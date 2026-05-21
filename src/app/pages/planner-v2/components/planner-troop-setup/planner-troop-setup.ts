import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';

import { PlannerUnitTile } from '../planner-unit-tile/planner-unit-tile';

import type {
  GodOption,
  SetupContextItem,
  TroopCategory,
  TroopCategoryTab,
  UnitTileView,
} from '../../planner-v2.models';

@Component({
  selector: 'app-planner-troop-setup',
  imports: [TranslatePipe, PlannerUnitTile],
  templateUrl: './planner-troop-setup.html',
})
export class PlannerTroopSetup {
  readonly contextLeft = input.required<readonly SetupContextItem[]>();
  readonly contextRight = input.required<readonly SetupContextItem[]>();
  readonly categories = input.required<readonly TroopCategoryTab[]>();
  readonly activeCategory = input.required<TroopCategory>();
  readonly selectedGod = input.required<string>();
  readonly gods = input.required<readonly GodOption[]>();
  readonly units = input.required<readonly UnitTileView[]>();
  readonly categorySelected = output<TroopCategory>();
  readonly godSelected = output<string>();
  readonly unitAmountChanged = output<{ readonly unitId: string; readonly amount: number }>();

  protected selectGod(event: Event): void {
    this.godSelected.emit((event.target as HTMLSelectElement).value);
  }
}
