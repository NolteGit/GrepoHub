import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const imagesRoot = path.join(projectRoot, 'public', 'assets', 'images');
const srcRoot = path.join(projectRoot, 'src');
const assetPathsFile = path.join(projectRoot, 'src', 'app', 'data', 'asset-paths.ts');
const buildingsDataFile = path.join(projectRoot, 'public', 'assets', 'data', 'buildings.json');
const unitsDataFile = path.join(projectRoot, 'public', 'assets', 'data', 'units.json');

const warningSizeBytes = 100 * 1024;
const quickLinkMaxBytes = 120 * 1024;
const errors = [];
const warnings = [];
const intentionallyImagelessBuildingIds = new Set(['agora']);

const supportedImageExtensions = new Set(['.png', '.webp', '.jpg', '.jpeg', '.svg', '.ico']);
const scannedCodeExtensions = new Set(['.ts', '.html', '.scss', '.css']);

function toProjectPath(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, '/');
}

function fileExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function detectImageFormat(filePath) {
  const buffer = fs.readFileSync(filePath);
  const header = buffer.subarray(0, 16);
  const textStart = buffer.subarray(0, 256).toString('utf8').trimStart().toLowerCase();

  if (header.length >= 8 && header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png';
  }

  if (header.length >= 12 && header.subarray(0, 4).toString('ascii') === 'RIFF' && header.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'webp';
  }

  if (header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return 'jpg';
  }

  if (header.length >= 4 && header[0] === 0x00 && header[1] === 0x00 && header[2] === 0x01 && header[3] === 0x00) {
    return 'ico';
  }

  if (textStart.startsWith('<svg') || textStart.startsWith('<?xml')) {
    return 'svg';
  }

  return 'unknown';
}

function extensionToFormat(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.jpeg') {
    return 'jpg';
  }

  return extension.replace('.', '');
}

function checkImageFormats() {
  for (const filePath of walkFiles(imagesRoot)) {
    const extension = path.extname(filePath).toLowerCase();

    if (!supportedImageExtensions.has(extension)) {
      continue;
    }

    const expected = extensionToFormat(filePath);
    const actual = detectImageFormat(filePath);

    if (actual === 'unknown') {
      warnings.push(`Unknown image signature: ${toProjectPath(filePath)}`);
      continue;
    }

    if (expected !== actual) {
      errors.push(`Image extension/content mismatch: ${toProjectPath(filePath)} is ${actual}, expected ${expected}`);
    }
  }
}

function checkImageSizes() {
  for (const filePath of walkFiles(imagesRoot)) {
    const extension = path.extname(filePath).toLowerCase();

    if (!supportedImageExtensions.has(extension)) {
      continue;
    }

    const size = fs.statSync(filePath).size;
    const projectPath = toProjectPath(filePath);

    if (projectPath.startsWith('public/assets/images/quick-links/') && size > quickLinkMaxBytes) {
      errors.push(`Quick-link image is too large: ${projectPath} (${formatBytes(size)}, max ${formatBytes(quickLinkMaxBytes)})`);
      continue;
    }

    if (size > warningSizeBytes) {
      warnings.push(`Large image: ${projectPath} (${formatBytes(size)})`);
    }
  }
}

function checkLegacyQuickLinks() {
  const legacyFiles = fs.existsSync(imagesRoot)
    ? fs.readdirSync(imagesRoot).filter((fileName) => /^button_.*\.png$/i.test(fileName))
    : [];

  for (const fileName of legacyFiles) {
    errors.push(`Legacy root quick-link PNG still exists: public/assets/images/${fileName}`);
  }
}

function checkDirectAssetReferences() {
  for (const filePath of walkFiles(srcRoot)) {
    const extension = path.extname(filePath).toLowerCase();
    const projectPath = toProjectPath(filePath);

    if (!scannedCodeExtensions.has(extension)) {
      continue;
    }

    if (projectPath === 'src/app/data/asset-paths.ts') {
      continue;
    }

    const lines = readText(filePath).split(/\r?\n/);

    lines.forEach((line, index) => {
      if (line.includes('/assets/images')) {
        errors.push(`Direct image path outside asset-paths.ts: ${projectPath}:${index + 1}`);
      }
    });
  }
}

function extractObjectKeys(source, objectName) {
  const objectRegex = new RegExp(`const\\s+${objectName}[^=]*=\\s*\\{([\\s\\S]*?)\\}\\s*(?:as\\s+const)?\\s*;`, 'm');
  const match = source.match(objectRegex);

  if (!match) {
    return new Set();
  }

  const keys = new Set();
  const keyRegex = /^\s*([a-zA-Z0-9_]+)\s*:/gm;
  let keyMatch;

  while ((keyMatch = keyRegex.exec(match[1])) !== null) {
    keys.add(keyMatch[1]);
  }

  return keys;
}

function extractObjectValues(source, objectName) {
  const objectRegex = new RegExp(`(?:export\\s+)?const\\s+${objectName}[^=]*=\\s*\\{([\\s\\S]*?)\\}\\s*(?:as\\s+const)?\\s*;`, 'm');
  const match = source.match(objectRegex);

  if (!match) {
    return [];
  }

  const values = [];
  const valueRegex = /:\s*['`]([^'`]+)['`]/g;
  let valueMatch;

  while ((valueMatch = valueRegex.exec(match[1])) !== null) {
    values.push(valueMatch[1]);
  }

  return values;
}

function extractResourceIds(source) {
  const match = source.match(/export\s+type\s+ResourceIconId\s*=\s*([^;]+);/m);

  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/'([^']+)'/g)].map((resourceMatch) => resourceMatch[1]);
}

function checkMappedFilesExist() {
  if (!fileExists(assetPathsFile)) {
    errors.push('Missing src/app/data/asset-paths.ts');
    return;
  }

  const source = readText(assetPathsFile);
  const mappedFiles = [
    ...extractObjectValues(source, 'quickLinkIconPaths').map((assetPath) => assetPath.replace('${imageBasePath}/', '')),
    ...extractObjectValues(source, 'buildingImageFileNames').map((fileName) => `buildings/${fileName}`),
    ...extractObjectValues(source, 'unitImageFileNames').map((fileName) => `units/${fileName}`),
    ...extractObjectValues(source, 'battleIconFileNames').map((fileName) => `battle/${fileName}`),
    ...extractResourceIds(source).map((resourceId) => `resources/${resourceId}.webp`),
  ];

  for (const mappedFile of new Set(mappedFiles)) {
    const normalizedFile = mappedFile.replace(/^\/assets\/images\//, '');
    const absolutePath = path.join(imagesRoot, normalizedFile);

    if (!fileExists(absolutePath)) {
      errors.push(`Mapped asset file does not exist: public/assets/images/${normalizedFile}`);
    }
  }
}

function readJsonArray(filePath) {
  if (!fileExists(filePath)) {
    return [];
  }

  const parsed = JSON.parse(readText(filePath));

  return Array.isArray(parsed) ? parsed : [];
}

function checkDataIdsHaveMappings() {
  if (!fileExists(assetPathsFile)) {
    return;
  }

  const source = readText(assetPathsFile);
  const buildingMappingKeys = extractObjectKeys(source, 'buildingImageFileNames');
  const unitMappingKeys = extractObjectKeys(source, 'unitImageFileNames');
  const buildingIds = readJsonArray(buildingsDataFile).map((building) => building.id).filter(Boolean);
  const unitIds = readJsonArray(unitsDataFile).map((unit) => unit.id).filter(Boolean);

  for (const buildingId of buildingIds) {
    if (!buildingMappingKeys.has(buildingId) && !intentionallyImagelessBuildingIds.has(buildingId)) {
      warnings.push(`Building has no image mapping: ${buildingId}`);
    }
  }

  for (const unitId of unitIds) {
    if (!unitMappingKeys.has(unitId)) {
      warnings.push(`Unit has no image mapping: ${unitId}`);
    }
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function printSection(title, items) {
  if (items.length === 0) {
    return;
  }

  console.log(`\n${title}`);

  for (const item of items) {
    console.log(`- ${item}`);
  }
}

checkLegacyQuickLinks();
checkImageFormats();
checkImageSizes();
checkMappedFilesExist();
checkDataIdsHaveMappings();
checkDirectAssetReferences();

printSection('Asset audit warnings', warnings);
printSection('Asset audit errors', errors);

if (errors.length > 0) {
  console.error(`\nAsset audit failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(`\nAsset audit passed with ${warnings.length} warning(s).`);

