import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Building } from '../models/building.model';
import { Unit } from '../models/unit.model';
import { GameDataService } from './game-data.service';

describe('GameDataService', () => {
  let service: GameDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(GameDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads unit definitions from the static unit data asset', () => {
    let units: Unit[] | undefined;

    service.getUnitDefinitions().subscribe((value) => {
      units = value;
    });

    const request = http.expectOne('/assets/data/units.json');

    expect(request.request.method).toBe('GET');

    request.flush([
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
    ] satisfies Unit[]);

    expect(units?.map((unit) => unit.id)).toEqual(['swordsman']);
  });

  it('loads building definitions from the static building data asset', () => {
    let buildings: Building[] | undefined;

    service.getBuildingDefinitions().subscribe((value) => {
      buildings = value;
    });

    const request = http.expectOne('/assets/data/buildings.json');

    expect(request.request.method).toBe('GET');

    request.flush([
      {
        id: 'farm',
        name: 'Farm',
        isSpecial: false,
        maxLevel: 45,
        wood: 0,
        stone: 0,
        silver: 0,
        population: 0,
        constructionTimeMinutes: 0,
      },
    ] satisfies Building[]);

    expect(buildings?.map((building) => building.id)).toEqual(['farm']);
  });
});
