import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhNumberStepper } from '../../../../shared/ui/gh-number-stepper/gh-number-stepper';

import type { UnitTileView } from '../../planner-v2.models';

@Component({
  selector: 'app-planner-unit-tile',
  imports: [TranslatePipe, GhNumberStepper],
  templateUrl: './planner-unit-tile.html',
})
export class PlannerUnitTile {
  readonly unit = input.required<UnitTileView>();
  readonly amountChanged = output<number>();
}
