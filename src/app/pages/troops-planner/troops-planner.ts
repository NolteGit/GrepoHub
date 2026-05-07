import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { GameDataService } from '../../services/game-data.service';

@Component({
  selector: 'app-troops-planner',
  imports: [AsyncPipe],
  templateUrl: './troops-planner.html',
  styleUrl: './troops-planner.scss',
})
export class TroopsPlanner {
  private readonly gameDataService = inject(GameDataService);

  protected readonly units$ = this.gameDataService.getUnitDefinitions();
}