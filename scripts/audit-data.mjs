import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const errors = [];
const warnings = [];
const validUnitTypes = new Set(['land', 'sea']);
const playableUnitGods = new Set([
  'zeus',
  'poseidon',
  'hera',
  'athena',
  'hades',
  'artemis',
  'aphrodite',
  'ares',
]);
const validGods = new Set([...playableUnitGods, 'all']);
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

  const mythicalUnitCountsByGod = new Map([...playableUnitGods].map((god) => [god, 0]));

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

    if (unit.isMythical && unit.god === null) {
      addError(`${label} is mythical but has no god`);
    }

    if (!unit.isMythical && unit.god !== null) {
      addError(`${label} is not mythical but has god: ${unit.god}`);
    }

    if (unit.god === 'all' && unit.id !== 'divine_envoy') {
      addError(`${label} uses god=all but is not divine_envoy`);
    }

    if (unit.isMythical && playableUnitGods.has(unit.god)) {
      mythicalUnitCountsByGod.set(unit.god, (mythicalUnitCountsByGod.get(unit.god) ?? 0) + 1);
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

  for (const [god, count] of mythicalUnitCountsByGod) {
    if (count === 0) {
      addError(`Unit data has no god-specific mythical units for god: ${god}`);
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

function extractConstStringMap(source, constName) {
  const match = source.match(new RegExp(`const\\s+${constName}[^=]*=\\s*\\{([\\s\\S]*?)\\};`, 'm'));

  if (!match) {
    addError(`src/app/data/asset-paths.ts is missing ${constName}`);
    return new Map();
  }

  return new Map(extractKeyStringPairs(match[1]).map(({ key, value }) => [key, value]));
}

function checkMappedImageFile(map, mapName, key, folder) {
  const fileName = map.get(key);

  if (!fileName) {
    addError(`src/app/data/asset-paths.ts ${mapName} is missing ${key}`);
    return;
  }

  const imagePath = path.join('public', 'assets', 'images', folder, fileName);

  if (!fs.existsSync(projectPath(imagePath))) {
    addError(`src/app/data/asset-paths.ts ${mapName}.${key} references missing image: ${imagePath}`);
  }
}

function checkAssetPathMappings(units, buildings) {
  const source = readText('src/app/data/asset-paths.ts');
  const buildingImages = extractConstStringMap(source, 'buildingImageFileNames');
  const unitImages = extractConstStringMap(source, 'unitImageFileNames');
  const battleIcons = extractConstStringMap(source, 'battleIconFileNames');
  const requiredBattleIcons = [
    'attackSea',
    'attackBlunt',
    'attackSharp',
    'attackDistance',
    'booty',
    'capacity',
    'defenseBlunt',
    'defenseDistance',
    'defenseSea',
    'defenseSharp',
    'speed',
  ];

  for (const building of buildings) {
    checkMappedImageFile(buildingImages, 'buildingImageFileNames', building.id, 'buildings');
  }

  for (const unit of units) {
    checkMappedImageFile(unitImages, 'unitImageFileNames', unit.id, 'units');
  }

  for (const icon of requiredBattleIcons) {
    checkMappedImageFile(battleIcons, 'battleIconFileNames', icon, 'battle');
  }
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

function checkTroopUnitAmountLimits(units) {
  const sourceFile = 'src/app/domain/planner/unit-rules.ts';
  const source = readText(sourceFile);
  const maxBudgetMatch = source.match(/const\s+maxPopulationBudgetPerUnit\s*=\s*(\d+)\s*;/);
  const amountMapMatch = source.match(/const\s+troopUnitAmountMaxById[^=]*=\s*\{([\s\S]*?)\};/m);

  if (!maxBudgetMatch) {
    addError(`${sourceFile} is missing maxPopulationBudgetPerUnit`);
    return;
  }

  if (!amountMapMatch) {
    addError(`${sourceFile} is missing troopUnitAmountMaxById`);
    return;
  }

  const maxPopulationBudgetPerUnit = Number(maxBudgetMatch[1]);
  const amountLimits = new Map(
    extractKeyNumberPairs(amountMapMatch[1]).map(({ key, value }) => [key, value]),
  );
  const unitIds = new Set(units.map((unit) => unit.id));

  for (const unit of units) {
    const expectedLimit = Math.ceil(maxPopulationBudgetPerUnit / Math.max(1, unit.cost.population));
    const configuredLimit = amountLimits.get(unit.id);

    if (configuredLimit === undefined) {
      addError(`${sourceFile} is missing a unit amount limit for ${unit.id}`);
      continue;
    }

    if (configuredLimit !== expectedLimit) {
      addError(
        `${sourceFile} has stale unit amount limit for ${unit.id}: ${configuredLimit}, expected ${expectedLimit}`,
      );
    }
  }

  for (const unitId of amountLimits.keys()) {
    if (!unitIds.has(unitId)) {
      addError(`${sourceFile} has unit amount limit for unknown unit id: ${unitId}`);
    }
  }
}

function extractExportedStringConstant(source, name, sourceFile) {
  const match = source.match(new RegExp(`export\\s+const\\s+${name}\\s*=\\s*'([^']+)'\\s*;`));

  if (!match) {
    addError(`${sourceFile} is missing ${name}`);
    return null;
  }

  return match[1];
}

function extractExportedNumberConstant(source, name, sourceFile) {
  const match = source.match(new RegExp(`export\\s+const\\s+${name}\\s*=\\s*(\\d+)\\s*;`));

  if (!match) {
    addError(`${sourceFile} is missing ${name}`);
    return null;
  }

  return Number(match[1]);
}

function checkTransportCapacityRules(units) {
  const sourceFile = 'src/app/domain/planner/transport-rules.ts';
  const source = readText(sourceFile);
  const slowTransportShipId = extractExportedStringConstant(source, 'slowTransportShipId', sourceFile);
  const fastTransportShipId = extractExportedStringConstant(source, 'fastTransportShipId', sourceFile);
  const bunksCapacityBonusPerShip = extractExportedNumberConstant(
    source,
    'bunksCapacityBonusPerShip',
    sourceFile,
  );

  if (!slowTransportShipId || !fastTransportShipId || bunksCapacityBonusPerShip === null) {
    return;
  }

  if (slowTransportShipId === fastTransportShipId) {
    addError(`${sourceFile} slow and fast transport ids must be different`);
  }

  if (bunksCapacityBonusPerShip <= 0) {
    addError(`${sourceFile} has invalid bunksCapacityBonusPerShip: ${bunksCapacityBonusPerShip}`);
  }

  const unitById = new Map(units.map((unit) => [unit.id, unit]));
  const transportShipIds = new Set([slowTransportShipId, fastTransportShipId]);

  for (const unitId of transportShipIds) {
    const unit = unitById.get(unitId);

    if (!unit) {
      addError(`${sourceFile} references unknown transport ship id: ${unitId}`);
      continue;
    }

    if (unit.type !== 'sea') {
      addError(`${sourceFile} transport ship ${unitId} must be a sea unit`);
    }

    if (unit.transportCapacity <= 0) {
      addError(`${sourceFile} transport ship ${unitId} must have positive transportCapacity`);
    }

    if (unit.transportSpace !== 0) {
      addError(`Transport ship ${unitId} should not consume transportSpace`);
    }
  }

  for (const unit of units) {
    const label = `Unit ${unit.id ?? '<missing-id>'}`;

    if (unit.transportCapacity > 0 && !transportShipIds.has(unit.id)) {
      addError(`${label} has transportCapacity > 0 but is not listed in ${sourceFile}`);
    }

    if (transportShipIds.has(unit.id)) {
      continue;
    }

    if (unit.type === 'sea' && unit.transportSpace > 0) {
      addError(`${label} is sea but consumes transportSpace`);
    }
  }
}

function checkUnitCombatStats(units) {
  for (const unit of units) {
    const label = `Unit ${unit.id ?? '<missing-id>'}`;

    if (unit.type === 'land') {
      if (unit.attack <= 0) {
        addError(`${label} is land but has no positive land attack value`);
      }

      if (unit.attackSea !== 0) {
        addError(`${label} is land but has attackSea > 0`);
      }

      if (unit.defenseSea !== 0) {
        addError(`${label} is land but has defenseSea > 0`);
      }

      if (unit.defenseBlunt + unit.defenseSharp + unit.defenseDistance <= 0) {
        addError(`${label} is land but has no land defense values`);
      }
    }

    if (unit.type === 'sea') {
      if (unit.attack !== unit.attackSea) {
        addError(`${label} is sea but attack (${unit.attack}) does not match attackSea (${unit.attackSea})`);
      }

      if (unit.defenseBlunt !== 0) {
        addError(`${label} is sea but has defenseBlunt > 0`);
      }

      if (unit.defenseSharp !== 0) {
        addError(`${label} is sea but has defenseSharp > 0`);
      }

      if (unit.defenseDistance !== 0) {
        addError(`${label} is sea but has defenseDistance > 0`);
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
  const buildingPlanIds = new Map();

  if (!definitionMatch) {
    addError('Could not find cityBuildingPlanDefinitions');
    return buildingPlanIds;
  }

  for (const match of definitionMatch[1].matchAll(/\{\s*id:\s*'([^']+)',\s*maxLevel:\s*(\d+),\s*populationByLevel:\s*([\s\S]*?),\s*\}/g)) {
    const [, id, maxLevelText, tableExpression] = match;
    const maxLevel = Number(maxLevelText);

    buildingPlanIds.set(id, maxLevel);

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
  const buildingById = new Map(buildings.map((building) => [building.id, building]));
  const intentionallyPlanOnlyBuildingIds = new Set(['land_expansion']);

  for (const [id, planMaxLevel] of buildingPlanIds) {
    const building = buildingById.get(id);

    if (!building) {
      if (!intentionallyPlanOnlyBuildingIds.has(id)) {
        addWarning(`City plan building has no public building data entry: ${id}`);
      }

      continue;
    }

    if (building.isSpecial) {
      addError(`Special building ${id} must not appear as a normal city-plan building`);
    }

    if (building.maxLevel !== null && building.maxLevel !== planMaxLevel) {
      addError(`Building ${id} maxLevel ${building.maxLevel} does not match city plan maxLevel ${planMaxLevel}`);
    }
  }

  for (const building of buildings) {
    if (building.isSpecial || building.maxLevel === null) {
      continue;
    }

    if (!buildingPlanIds.has(building.id)) {
      addWarning(`Building data has no city-plan definition: ${building.id}`);
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
  checkTroopUnitAmountLimits(units);
  checkTransportCapacityRules(units);
  checkUnitCombatStats(units);
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

if (Array.isArray(units) && Array.isArray(buildings)) {
  checkAssetPathMappings(units, buildings);
}

reportSection('Data audit warnings', warnings);
reportSection('Data audit errors', errors);

if (errors.length > 0) {
  console.error(`\nData audit failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(`Data audit passed with ${warnings.length} warning(s).`);
