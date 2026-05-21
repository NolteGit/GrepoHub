import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhNumberStepper } from '../../../../shared/ui/gh-number-stepper/gh-number-stepper';

import type { BuildingTileView } from '../../planner-v2.models';

@Component({
  selector: 'app-planner-building-tile',
  imports: [TranslatePipe, GhNumberStepper],
  templateUrl: './planner-building-tile.html',
})
export class PlannerBuildingTile {
  readonly building = input.required<BuildingTileView>();
  readonly levelChanged = output<number>();
}
