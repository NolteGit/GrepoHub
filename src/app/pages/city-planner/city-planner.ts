import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { GameDataService } from '../../services/game-data.service';

@Component({
  selector: 'app-city-planner',
  imports: [AsyncPipe],
  templateUrl: './city-planner.html',
  styleUrl: './city-planner.scss',
})
export class CityPlanner {
  private readonly gameDataService = inject(GameDataService);

  protected readonly buildings$ = this.gameDataService.getBuildingDefinitions();
}