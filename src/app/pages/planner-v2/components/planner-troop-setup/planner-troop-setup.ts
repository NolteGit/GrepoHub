import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhNumberStepper } from '../../../../shared/ui/gh-number-stepper/gh-number-stepper';
import { GhTileShell } from '../../../../shared/ui/gh-tile-shell/gh-tile-shell';

import type {
  GodOption,
  SetupContextItem,
  TroopCategory,
  TroopCategoryTab,
  UnitTilePlaceholder,
} from '../../planner-v2.models';

@Component({
  selector: 'app-planner-troop-setup',
  imports: [TranslatePipe, GhNumberStepper, GhTileShell],
  templateUrl: './planner-troop-setup.html',
})
export class PlannerTroopSetup {
  readonly contextLeft = input.required<readonly SetupContextItem[]>();
  readonly contextRight = input.required<readonly SetupContextItem[]>();
  readonly categories = input.required<readonly TroopCategoryTab[]>();
  readonly activeCategory = input.required<TroopCategory>();
  readonly selectedGod = input.required<string>();
  readonly gods = input.required<readonly GodOption[]>();
  readonly units = input.required<readonly UnitTilePlaceholder[]>();
  readonly categorySelected = output<TroopCategory>();
  readonly godSelected = output<string>();

  protected selectGod(event: Event): void {
    this.godSelected.emit((event.target as HTMLSelectElement).value);
  }
}
