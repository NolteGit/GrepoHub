import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PlanConfig } from '../models/plan-config.model';
import { Unit } from '../models/unit.model';
import { GameDataService } from './game-data.service';
import { PlanConfigService } from './plan-config.service';
import { PlanReadableExportService } from './plan-readable-export.service';
import { TranslationService } from './translation.service';

const unitDefinitions: Unit[] = [
  {
    id: 'swordsman',
    nameKey: 'unit.swordsman',
    type: 'land',
    isMythical: false,
    god: null,
    cost: {
      wood: 95,
      stone: 0,
      silver: 85,
      favor: 0,
      population: 1,
    },
    transportCapacity: 0,
    transportSpace: 1,
    attack: 5,
    attackType: 'sharp',
    defenseBlunt: 14,
    defenseSharp: 8,
    defenseDistance: 30,
    attackSea: 0,
    defenseSea: 0,
  },
  {
    id: 'transport_boat',
    nameKey: 'unit.transport_boat',
    type: 'sea',
    isMythical: false,
    god: null,
    cost: {
      wood: 500,
      stone: 500,
      silver: 400,
      favor: 0,
      population: 7,
    },
    transportCapacity: 16,
    transportSpace: 0,
    attack: 0,
    attackType: 'naval',
    defenseBlunt: 0,
    defenseSharp: 0,
    defenseDistance: 0,
    attackSea: 0,
    defenseSea: 0,
  },
  {
    id: 'harpy',
    nameKey: 'unit.harpy',
    type: 'land',
    isMythical: true,
    god: 'hera',
    cost: {
      wood: 1600,
      stone: 400,
      silver: 1360,
      favor: 130,
      population: 14,
    },
    transportCapacity: 0,
    transportSpace: 1,
    attack: 295,
    attackType: 'sharp',
    defenseBlunt: 105,
    defenseSharp: 70,
    defenseDistance: 1,
    attackSea: 0,
    defenseSea: 0,
  },
  {
    id: 'militia',
    nameKey: 'unit.militia',
    type: 'land',
    isMythical: false,
    god: null,
    cost: {
      wood: 0,
      stone: 0,
      silver: 0,
      favor: 0,
      population: 0,
    },
    transportCapacity: 0,
    transportSpace: 0,
    attack: 2,
    attackType: 'blunt',
    defenseBlunt: 6,
    defenseSharp: 8,
    defenseDistance: 4,
    attackSea: 0,
    defenseSea: 0,
  },
];

const testPlan: PlanConfig = {
  id: 'plan-readable-test',
  name: 'Logic Test Plan',
  isPreset: false,
  createdAt: null,
  updatedAt: '2026-05-11T12:00:00.000Z',
  settings: {
    worldSpeed: null,
    unitSpeed: null,
    timezone: null,
    locale: null,
  },
  cityPlan: {
    id: 'city-readable-test',
    name: 'Logic City',
    isPreset: false,
    buildingLevels: {
      farm: 10,
      senate: 9,
      academy: 0,
      timber_camp: 1,
      quarry: 1,
      silver_mine: 1,
      barracks: 1,
      harbour: 0,
      city_wall: 0,
      temple: 1,
      marketplace: 1,
      cave: 0,
      warehouse: 1,
      land_expansion: 1,
    },
    modifiers: {
      plowResearched: true,
      aphroditeActive: true,
    },
    specialBuildings: {
      slot1: 'thermal_baths',
      slot2: 'tower',
    },
  },
  troopPlan: {
    id: 'troops-readable-test',
    name: 'Logic Troops',
    isPreset: false,
    unitAmounts: {
      swordsman: 10,
      transport_boat: 1,
      harpy: 2,
      militia: 999,
    },
    modifiers: {
      bunks: true,
    },
  },
};

describe('PlanReadableExportService', () => {
  let service: PlanReadableExportService;
  let capturedBlob: Blob | null;
  let capturedAnchor: HTMLAnchorElement | null;

  beforeEach(() => {
    capturedBlob = null;
    capturedAnchor = null;
    TestBed.resetTestingModule();

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => {
        capturedBlob = blob;

        return 'blob:grepo-readable-export';
      }),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      capturedAnchor = this;
    });

    TestBed.configureTestingModule({
      providers: [
        PlanReadableExportService,
        {
          provide: GameDataService,
          useValue: {
            getUnitDefinitions: () => of(unitDefinitions),
            getBuildingDefinitions: () => of([]),
          },
        },
        {
          provide: PlanConfigService,
          useValue: {
            activePlan: () => testPlan,
          },
        },
        {
          provide: TranslationService,
          useValue: {
            currentLanguage: () => 'en',
            translate: (_key: string, fallback: string) => fallback,
            setLanguage: () => undefined,
            toggleLanguage: () => undefined,
          },
        },
      ],
    });

    service = TestBed.inject(PlanReadableExportService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports a CSV report with calculated troop totals and transport balance', async () => {
    service.exportActivePlanAsCsv();

    const content = await readCapturedBlobText(capturedBlob);
    const rows = parseCsvRows(content.replace(/^\uFEFF/, ''));
    const swordsmanRow = rows.find((row) => row[4] === 'Swordsman');
    const harpyRow = rows.find((row) => row[4] === 'Harpy');
    const totalUnitsRow = rows.find(
      (row) => row[0] === 'Troops Summary' && row[3] === 'Total units',
    );
    const populationRow = rows.find(
      (row) => row[0] === 'Troops Summary' && row[3] === 'Total population',
    );
    const transportCapacityRow = rows.find(
      (row) => row[0] === 'Troops Summary' && row[3] === 'Transport capacity',
    );
    const transportSpaceRow = rows.find(
      (row) => row[0] === 'Troops Summary' && row[3] === 'Transport space',
    );
    const transportBalanceRow = rows.find(
      (row) => row[0] === 'Troops Summary' && row[3] === 'Transport balance',
    );

    expect(capturedAnchor?.download).toMatch(
      /^grepo-hub_logic-test-plan_\d{4}-\d{2}-\d{2}_\d{4}\.csv$/,
    );
    expect(capturedAnchor?.href).toBe('blob:grepo-readable-export');
    expect(rows[0]).toEqual([
      'Section',
      'Building',
      'Building Level',
      'Modifier',
      'Unit',
      'Unit Amount',
      'Space',
      'Population',
      'Wood',
      'Stone',
      'Silver',
      'Favor',
      'Value',
    ]);
    expect(swordsmanRow?.[0]).toBe('Land units');
    expect(swordsmanRow?.[5]).toBe('10');
    expect(swordsmanRow?.[6]).toBe('10');
    expect(swordsmanRow?.[7]).toBe('10');
    expect(harpyRow?.[0]).toBe('Mythical units');
    expect(harpyRow?.[5]).toBe('2');
    expect(harpyRow?.[11]).toBe('260');
    expect(rows.some((row) => row[4] === 'Militia')).toBe(false);
    expect(totalUnitsRow?.[12]).toBe('13');
    expect(populationRow?.[12]).toBe('45');
    expect(transportCapacityRow?.[12]).toBe('22');
    expect(transportSpaceRow?.[12]).toBe('12');
    expect(transportBalanceRow?.[12]).toBe('10');
  });

  it('exports a text report with grouped unit lines and city summary values', async () => {
    service.exportActivePlanAsTxt();

    const content = await readCapturedBlobText(capturedBlob);

    expect(capturedAnchor?.download).toMatch(
      /^grepo-hub_logic-test-plan_\d{4}-\d{2}-\d{2}_\d{4}\.txt$/,
    );
    expect(content).toContain('Grepo Hub Export');
    expect(content).toContain('Config: Logic Test Plan');
    expect(content).toContain('- Swordsman: 10, Space 10, Population 10, Wood 950');
    expect(content).toContain('- Harpy: 2, Space 2, Population 28');
    expect(content).toContain('Favor 260');
    expect(content).toContain('- Bunks: Yes (+6 transport capacity)');
    expect(content).toContain('- Total units: 13');
    expect(content).toContain('- Total population: 45');
    expect(content).toContain('- Transport capacity: 22');
    expect(content).toContain('- Transport balance: 10');
    expect(content).toContain('- Population capacity: 744');
    expect(content).toContain('- Used population: 159');
    expect(content).toContain('- Free population: 585');
    expect(content).not.toContain('Militia');
  });
});

async function readCapturedBlobText(blob: Blob | null): Promise<string> {
  expect(blob).not.toBeNull();

  return await (blob as Blob).text();
}

function parseCsvRows(content: string): string[][] {
  return content.split('\r\n').map((line) => line.split(';'));
}
