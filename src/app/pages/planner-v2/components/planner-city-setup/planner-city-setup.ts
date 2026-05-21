import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';
import { GhSelectField } from '../../../../shared/ui/gh-select-field/gh-select-field';

import { PlannerBuildingTile } from '../planner-building-tile/planner-building-tile';

import type {
  BuildingTileView,
  CityModifierToggle,
  CityModifierToggleId,
  SetupContextItem,
  SpecialBuildingSlotView,
} from '../../planner-v2.models';

@Component({
  selector: 'app-planner-city-setup',
  imports: [TranslatePipe, GhPanel, GhSelectField, PlannerBuildingTile],
  templateUrl: './planner-city-setup.html',
})
export class PlannerCitySetup {
  readonly contextLeft = input.required<readonly SetupContextItem[]>();
  readonly contextRight = input.required<readonly SetupContextItem[]>();
  readonly modifiers = input.required<readonly CityModifierToggle[]>();
  readonly buildings = input.required<readonly BuildingTileView[]>();
  readonly specialSlots = input.required<readonly SpecialBuildingSlotView[]>();
  readonly buildingLevelChanged = output<{ readonly buildingId: string; readonly level: number }>();
  readonly modifierToggled = output<CityModifierToggleId>();
  readonly specialBuildingSelected = output<{
    readonly slotId: string;
    readonly optionId: string;
  }>();
}
