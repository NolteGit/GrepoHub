const imageBasePath = '/assets/images';

export const quickLinkIconPaths = {
  grepolis: `${imageBasePath}/quick-links/button_grepoGame.webp`,
  grepodata: `${imageBasePath}/quick-links/button_grepoData.webp`,
  grepolife: `${imageBasePath}/quick-links/button_grepolife.webp`,
  wiki: `${imageBasePath}/quick-links/button_grepoWiki.webp`,
  forum: `${imageBasePath}/quick-links/button_grepoForum.webp`,
  support: `${imageBasePath}/quick-links/button_grepoSupp.webp`,
} as const;

const buildingImageFileNames: Record<string, string> = {
  academy: 'academy.webp',
  barracks: 'barracks.webp',
  cave: 'cave.webp',
  divine_statue: 'divine_statue.webp',
  farm: 'farm.webp',
  harbour: 'harbour.webp',
  library: 'library.webp',
  lighthouse: 'light_house.webp',
  marketplace: 'market_place.webp',
  merchants_shop: 'merchant_shop.webp',
  oracle: 'oracle.webp',
  quarry: 'quarry.webp',
  senate: 'senate.webp',
  silver_mine: 'silver_mine.webp',
  temple: 'temple.webp',
  theatre: 'theatre.webp',
  thermal_baths: 'thermal_baths.webp',
  timber_camp: 'timber_camp.webp',
  tower: 'tower.webp',
  city_wall: 'wall.webp',
  warehouse: 'warehouse.webp',
};

const unitImageFileNames: Record<string, string> = {
  swordsman: 'swordsman.webp',
  slinger: 'slinger.webp',
  archer: 'archer.webp',
  hoplite: 'hoplite.webp',
  horseman: 'horseman.webp',
  chariot: 'chariot.webp',
  catapult: 'catapult.webp',
  militia: 'militia.webp',
  divine_envoy: 'divineEnvoy.webp',
  divineEnvoy: 'divineEnvoy.webp',
  minotaur: 'minotaur.webp',
  manticore: 'manticore.webp',
  cyclop: 'cyclop.webp',
  hydra: 'hydra.webp',
  harpy: 'harpy.webp',
  medusa: 'medusa.webp',
  centaur: 'centaur.webp',
  pegasus: 'pegasus.webp',
  cerberus: 'cerberus.webp',
  erinys: 'erinys.webp',
  griffin: 'griffin.webp',
  calydonian_boar: 'calydonianBoar.webp',
  calydonianBoar: 'calydonianBoar.webp',
  siren: 'siren.webp',
  satyr: 'satyr.webp',
  ladon: 'ladon.webp',
  spartoi: 'spartoi.webp',
  transport_boat: 'transportBoat.webp',
  transportBoat: 'transportBoat.webp',
  bireme: 'bireme.webp',
  light_ship: 'lightShip.webp',
  lightShip: 'lightShip.webp',
  fire_ship: 'fireShip.webp',
  fireShip: 'fireShip.webp',
  fast_transport_ship: 'fastTransportShip.webp',
  fastTransportShip: 'fastTransportShip.webp',
  trireme: 'trireme.webp',
  colony_ship: 'colonyShip.webp',
  colonyShip: 'colonyShip.webp',
};

export type ResourceIconId = 'wood' | 'stone' | 'silver' | 'favor' | 'population' | 'buildtime';

const battleIconFileNames: Record<string, string> = {
  attackSea: 'attackSea.webp',
  attackBlunt: 'blunt.webp',
  attackSharp: 'sharp.png',
  attackDistance: 'distance.png',
  booty: 'booty.webp',
  capacity: 'capacity.webp',
  defenseBlunt: 'defenseBlunt.webp',
  defenseDistance: 'defenseDistance.webp',
  defenseSea: 'defenseSea.webp',
  defenseSharp: 'defenseSharp.webp',
  speed: 'speed.webp',
};

export function getBuildingImagePath(buildingId: string): string {
  const fileName = buildingImageFileNames[buildingId];

  return fileName ? `${imageBasePath}/buildings/${fileName}` : '';
}

export function getUnitIconPath(unitId: string): string {
  const fileName = unitImageFileNames[unitId];

  return fileName ? `${imageBasePath}/units/${fileName}` : '';
}

export function getResourceIconPath(resource: ResourceIconId): string {
  return `${imageBasePath}/resources/${resource}.png`;
}

export function getBattleIconPath(icon: string): string {
  const fileName = battleIconFileNames[icon];

  return fileName ? `${imageBasePath}/battle/${fileName}` : '';
}
