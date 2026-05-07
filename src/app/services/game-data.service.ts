import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Building } from '../models/building.model';
import { Unit } from '../models/unit.model';

@Injectable({
  providedIn: 'root',
})
export class GameDataService {
  private readonly http = inject(HttpClient);

  getUnitDefinitions(): Observable<Unit[]> {
    return this.http.get<Unit[]>('/assets/data/units.json');
  }

  getBuildingDefinitions(): Observable<Building[]> {
    return this.http.get<Building[]>('/assets/data/buildings.json');
  }
}