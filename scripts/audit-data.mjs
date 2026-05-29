import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const errors = [];
const warnings = [];
const validUnitTypes = new Set(['land', 'sea']);
const validGods = new Set([
  'zeus',
  'poseidon',
  'hera',
  'athena',
  'hades',
  'artemis',
  'aphrodite',
  'ares',
  'all',
]);
const validAttackTypes = new Set(['naval', 'blunt', 'sharp', 'distance']);
const cityBuildingPresetSources = new Set(['src/app/data/city-planner-presets.ts', 'src/app/data/plan-config-presets.ts']);
const cityModifierPresetSources = new Set(['src/app/data/city-planner-presets.ts']);
const troopPresetSources = new Set(['src/app/data/troops-planner-presets.ts', 'src/app/data/plan-config-presets.ts']);

function projectPath(...segments) {
  return path.join(root, ...segments);
}

function readText(filePath) {
  return fs.readFileSync(projectPath(filePath), 'utf8');
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function reportSection(title, items) {
  if (items.length === 0) {
    return;
  }

  console.log(`\n${title}`);

  for (const item of items) {
    console.log(`- ${item}`);
  }
}

function checkDuplicateIds(items, label) {
  const seen = new Set();

  for (const item of items) {
    if (!isNonEmptyString(item.id)) {
      addError(`${label} has missing or invalid id`);
      continue;
    }

    if (seen.has(item.id)) {
      addError(`${label} has duplicate id: ${item.id}`);
      continue;
    }

    seen.add(item.id);
  }
}

function loadDictionaries() {
  const i18nRoot = projectPath('public', 'assets', 'i18n');
  const languages = fs
    .readdirSync(i18nRoot)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => fileName.replace(/\.json$/, ''))
    .sort();
  const dictionaries = new Map();

  for (const language of languages) {
    dictionaries.set(language, readJson(path.join('public', 'assets', 'i18n', `${language}.json`)));
  }

  return { languages, dictionaries };
}

function checkTranslationKey(key, label, languages, dictionaries) {
  if (!isNonEmptyString(key)) {
    addError(`${label} has missing translation key`);
    return;
  }

  for (const language of languages) {
    if (!(key in dictionaries.get(language))) {
      addError(`${label} uses missing ${language} translation key: ${key}`);
    }
  }
}

function checkUnits(units, languages, dictionaries) {
  checkDuplicateIds(units, 'Unit data');

  for (const unit of units) {
    const label = `Unit ${unit.id ?? '<missing-id>'}`;

    checkTranslationKey(unit.nameKey, label, languages, dictionaries);

    if (!validUnitTypes.has(unit.type)) {
      addError(`${label} has invalid type: ${unit.type}`);
    }

    if (typeof unit.isMythical !== 'boolean') {
      addError(`${label} has invalid isMythical value`);
    }

    if (unit.god !== null && !validGods.has(unit.god)) {
      addError(`${label} has invalid god: ${unit.god}`);
    }

    if (!validAttackTypes.has(unit.attackType)) {
      addError(`${label} has invalid attackType: ${unit.attackType}`);
    }

    if (!isPlainObject(unit.cost)) {
      addError(`${label} has invalid cost object`);
    } else {
      for (const resource of ['wood', 'stone', 'silver', 'favor', 'population']) {
        if (!isNonNegativeInteger(unit.cost[resource])) {
          addError(`${label} has invalid cost.${resource}: ${unit.cost[resource]}`);
        }
      }
    }

    for (const field of [
      'transportCapacity',
      'transportSpace',
      'attack',
      'defenseBlunt',
      'defenseSharp',
      'defenseDistance',
      'attackSea',
      'defenseSea',
    ]) {
      if (!isNonNegativeInteger(unit[field])) {
        addError(`${label} has invalid ${field}: ${unit[field]}`);
      }
    }

    if (unit.type === 'land' && unit.attackType === 'naval') {
      addError(`${label} is land but has naval attackType`);
    }

    if (unit.type === 'sea' && unit.attackType !== 'naval') {
      addError(`${label} is sea but does not have naval attackType`);
    }

    if (unit.type === 'land' && unit.transportCapacity > 0) {
      addError(`${label} is land but has transportCapacity > 0`);
    }
  }
}

function checkBuildings(buildings) {
  checkDuplicateIds(buildings, 'Building data');

  for (const building of buildings) {
    const label = `Building ${building.id ?? '<missing-id>'}`;

    if (!isNonEmptyString(building.name)) {
      addError(`${label} has missing or invalid name`);
    }

    if (typeof building.isSpecial !== 'boolean') {
      addError(`${label} has invalid isSpecial value`);
    }

    for (const nullableNumberField of [
      'maxLevel',
      'wood',
      'stone',
      'silver',
      'population',
      'constructionTimeMinutes',
    ]) {
      const value = building[nullableNumberField];

      if (value !== null && !isNonNegativeInteger(value)) {
        addError(`${label} has invalid ${nullableNumberField}: ${value}`);
      }
    }
  }
}

function extractStringUnion(source, typeName) {
  const match = source.match(new RegExp(`export\\s+type\\s+${typeName}\\s*=([\\s\\S]*?);`, 'm'));

  if (!match) {
    addError(`Could not find type union: ${typeName}`);
    return new Set();
  }

  return new Set([...match[1].matchAll(/'([^']+)'/g)].map((unionMatch) => unionMatch[1]));
}

function extractObjectBlocks(source, propertyName) {
  const blocks = [];
  let searchIndex = 0;

  while (searchIndex < source.length) {
    const propertyIndex = source.indexOf(`${propertyName}:`, searchIndex);

    if (propertyIndex === -1) {
      break;
    }

    const openIndex = source.indexOf('{', propertyIndex);

    if (openIndex === -1) {
      break;
    }

    let depth = 0;
    let closeIndex = -1;

    for (let index = openIndex; index < source.length; index += 1) {
      const character = source[index];

      if (character === '{') {
        depth += 1;
      } else if (character === '}') {
        depth -= 1;

        if (depth === 0) {
          closeIndex = index;
          break;
        }
      }
    }

    if (closeIndex === -1) {
      addError(`Could not parse object block for ${propertyName}`);
      break;
    }

    blocks.push(source.slice(openIndex + 1, closeIndex));
    searchIndex = closeIndex + 1;
  }

  return blocks;
}

function extractKeyNumberPairs(block) {
  return [...block.matchAll(/\b([a-zA-Z_][\w]*)\s*:\s*(-?\d+)/g)].map((match) => ({
    key: match[1],
    value: Number(match[2]),
  }));
}

function extractKeyStringPairs(block) {
  return [...block.matchAll(/\b([a-zA-Z_][\w]*)\s*:\s*'([^']+)'/g)].map((match) => ({
    key: match[1],
    value: match[2],
  }));
}

function checkPresetUnitReferences(units) {
  const unitIds = new Set(units.map((unit) => unit.id));

  for (const sourceFile of troopPresetSources) {
    const source = readText(sourceFile);
    const blocks = extractObjectBlocks(source, 'unitAmounts');

    for (const block of blocks) {
      for (const { key, value } of extractKeyNumberPairs(block)) {
        if (!unitIds.has(key)) {
          addError(`${sourceFile} references unknown unit id in unitAmounts: ${key}`);
        }

        if (!isNonNegativeInteger(value)) {
          addError(`${sourceFile} has invalid unit amount for ${key}: ${value}`);
        }
      }
    }
  }
}

function extractPopulationTables(source) {
  const tables = new Map();

  for (const match of source.matchAll(/const\s+([A-Z_]+)\s*=\s*\[([\s\S]*?)\];/g)) {
    tables.set(match[1], [...match[2].matchAll(/-?\d+/g)].map((numberMatch) => Number(numberMatch[0])));
  }

  return tables;
}

function checkCityPlanDefinitions() {
  const source = readText('src/app/data/city-planner-presets.ts');
  const tables = extractPopulationTables(source);
  const definitionMatch = source.match(/cityBuildingPlanDefinitions[^=]*=\s*\[([\s\S]*?)\];/m);
  const buildingPlanIds = new Set();

  if (!definitionMatch) {
    addError('Could not find cityBuildingPlanDefinitions');
    return buildingPlanIds;
  }

  for (const match of definitionMatch[1].matchAll(/\{\s*id:\s*'([^']+)',\s*maxLevel:\s*(\d+),\s*populationByLevel:\s*([\s\S]*?),\s*\}/g)) {
    const [, id, maxLevelText, tableExpression] = match;
    const maxLevel = Number(maxLevelText);

    buildingPlanIds.add(id);

    if (tableExpression.startsWith('createLinearPopulationTable')) {
      const levelMatch = tableExpression.match(/createLinearPopulationTable\((\d+),/);

      if (!levelMatch || Number(levelMatch[1]) !== maxLevel) {
        addError(`City building ${id} has mismatched createLinearPopulationTable maxLevel`);
      }

      continue;
    }

    const table = tables.get(tableExpression.trim());

    if (!table) {
      addError(`City building ${id} references unknown population table: ${tableExpression.trim()}`);
      continue;
    }

    if (table.length !== maxLevel + 1) {
      addError(`City building ${id} population table has ${table.length} entries, expected ${maxLevel + 1}`);
    }
  }

  return buildingPlanIds;
}

function checkCityPresetReferences(buildingPlanIds) {
  for (const sourceFile of cityBuildingPresetSources) {
    const source = readText(sourceFile);
    const blocks = extractObjectBlocks(source, 'buildingLevels');

    for (const block of blocks) {
      for (const { key, value } of extractKeyNumberPairs(block)) {
        if (!buildingPlanIds.has(key)) {
          addError(`${sourceFile} references unknown building level id: ${key}`);
        }

        if (!isNonNegativeInteger(value)) {
          addError(`${sourceFile} has invalid building level for ${key}: ${value}`);
        }
      }
    }
  }
}

function checkCityModifiersAndSpecialBuildings() {
  const modelSource = readText('src/app/models/city-configuration.model.ts');
  const presetSource = readText('src/app/data/city-planner-presets.ts');
  const modifierIds = extractStringUnion(modelSource, 'CityModifierId');
  const optionIds = extractStringUnion(modelSource, 'CitySpecialBuildingOptionId');
  const slotIds = extractStringUnion(modelSource, 'CitySpecialBuildingSlotId');
  const definedModifierIds = new Set([...presetSource.matchAll(/id:\s*'([^']+)',\s*populationDelta:/g)].map((match) => match[1]));
  const definedOptionIds = new Set([...presetSource.matchAll(/id:\s*'([^']+)',\s*populationDelta:/g)].map((match) => match[1]));
  const slotDefinitionIds = new Set([...presetSource.matchAll(/id:\s*'(slot\d+)',\s*optionIds:/g)].map((match) => match[1]));
  const slotOptionIds = new Set(
    [...presetSource.matchAll(/optionIds:\s*\[([^\]]+)\]/g)].flatMap((match) => [
      ...match[1].matchAll(/'([^']+)'/g),
    ].map((optionMatch) => optionMatch[1])),
  );

  for (const modifierId of modifierIds) {
    if (!definedModifierIds.has(modifierId)) {
      addError(`City modifier type is missing a definition: ${modifierId}`);
    }
  }

  for (const optionId of optionIds) {
    if (!definedOptionIds.has(optionId)) {
      addError(`Special building option type is missing a definition: ${optionId}`);
    }
  }

  for (const slotId of slotIds) {
    if (!slotDefinitionIds.has(slotId)) {
      addError(`Special building slot type is missing a definition: ${slotId}`);
    }
  }

  for (const optionId of slotOptionIds) {
    if (!optionIds.has(optionId)) {
      addError(`Special building slot references unknown option: ${optionId}`);
    }
  }

  for (const sourceFile of cityModifierPresetSources) {
    const source = readText(sourceFile);

    for (const block of extractObjectBlocks(source, 'modifiers')) {
      for (const { key } of [...block.matchAll(/\b([a-zA-Z_][\w]*)\s*:\s*(?:true|false)/g)].map((match) => ({ key: match[1] }))) {
        if (!modifierIds.has(key)) {
          addError(`${sourceFile} references unknown city modifier: ${key}`);
        }
      }
    }

    for (const block of extractObjectBlocks(source, 'specialBuildings')) {
      for (const { key, value } of extractKeyStringPairs(block)) {
        if (!slotIds.has(key)) {
          addError(`${sourceFile} references unknown special building slot: ${key}`);
        }

        if (!optionIds.has(value)) {
          addError(`${sourceFile} references unknown special building option: ${value}`);
        }
      }
    }
  }
}

function checkAcademyResearch(languages, dictionaries) {
  const source = readText('src/app/data/academy-research-presets.ts');
  const ids = [];

  for (const match of source.matchAll(/createResearch\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(-?\d+)\s*,\s*(-?\d+)/g)) {
    const [, id, fallbackName, costText, requiredLevelText] = match;
    const cost = Number(costText);
    const requiredLevel = Number(requiredLevelText);

    ids.push(id);

    if (!isNonEmptyString(fallbackName)) {
      addError(`Academy research ${id} has missing fallbackName`);
    }

    if (!isNonNegativeInteger(cost)) {
      addError(`Academy research ${id} has invalid cost: ${costText}`);
    }

    if (!Number.isInteger(requiredLevel) || requiredLevel < 1 || requiredLevel > 36) {
      addError(`Academy research ${id} has invalid requiredAcademyLevel: ${requiredLevelText}`);
    }

    checkTranslationKey(`academyResearch.${id}`, `Academy research ${id}`, languages, dictionaries);
  }

  checkDuplicateIds(
    ids.map((id) => ({ id })),
    'Academy research data',
  );
}

function checkBuildingJsonAlignment(buildings, buildingPlanIds) {
  const buildingDataIds = new Set(buildings.map((building) => building.id));
  const intentionallyPlanOnlyBuildingIds = new Set(['land_expansion']);

  for (const id of buildingPlanIds) {
    if (!buildingDataIds.has(id) && !intentionallyPlanOnlyBuildingIds.has(id)) {
      addWarning(`City plan building has no public building data entry: ${id}`);
    }
  }
}

const units = readJson('public/assets/data/units.json');
const buildings = readJson('public/assets/data/buildings.json');
const { languages, dictionaries } = loadDictionaries();

if (!Array.isArray(units)) {
  addError('public/assets/data/units.json must be an array');
} else {
  checkUnits(units, languages, dictionaries);
  checkPresetUnitReferences(units);
}

if (!Array.isArray(buildings)) {
  addError('public/assets/data/buildings.json must be an array');
} else {
  checkBuildings(buildings);
}

const buildingPlanIds = checkCityPlanDefinitions();
checkCityPresetReferences(buildingPlanIds);
checkCityModifiersAndSpecialBuildings();
checkAcademyResearch(languages, dictionaries);

if (Array.isArray(buildings)) {
  checkBuildingJsonAlignment(buildings, buildingPlanIds);
}

reportSection('Data audit warnings', warnings);
reportSection('Data audit errors', errors);

if (errors.length > 0) {
  console.error(`\nData audit failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(`Data audit passed with ${warnings.length} warning(s).`);
