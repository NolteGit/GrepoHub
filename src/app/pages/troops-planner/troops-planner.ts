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

  protected readonly unitAmounts: Record<string, number> = {};

  protected getUnitAmount(unitId: string): number {
    return this.unitAmounts[unitId] ?? 0;
  }

  protected updateUnitAmount(unitId: string, value: string): void {
    const amount = Number(value);

    this.unitAmounts[unitId] = Number.isFinite(amount) && amount > 0 ? amount : 0;
  }
}