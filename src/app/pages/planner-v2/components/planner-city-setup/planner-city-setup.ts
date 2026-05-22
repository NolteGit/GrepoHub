import { Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';
import { GhSelectField } from '../../../../shared/ui/gh-select-field/gh-select-field';

import { PlannerBuildingTile } from '../planner-building-tile/planner-building-tile';

import type {
  BuildingTileView,
  CityModifierToggle,
  CityModifierToggleId,
  SpecialBuildingSlotView,
} from '../../planner-v2.models';

@Component({
  selector: 'app-planner-city-setup',
  imports: [TranslatePipe, GhPanel, GhSelectField, PlannerBuildingTile],
  templateUrl: './planner-city-setup.html',
})
export class PlannerCitySetup {
  readonly modifiers = input.required<readonly CityModifierToggle[]>();
  readonly heroBuilding = input<BuildingTileView | null>(null);
  readonly buildings = input.required<readonly BuildingTileView[]>();
  readonly specialSlots = input.required<readonly SpecialBuildingSlotView[]>();
  readonly buildingLevelChanged = output<{ readonly buildingId: string; readonly level: number }>();
  readonly modifierToggled = output<CityModifierToggleId>();
  readonly specialBuildingSelected = output<{
    readonly slotId: string;
    readonly optionId: string;
  }>();

  protected readonly heroLeftModifiers = computed<readonly CityModifierToggle[]>(() => {
    return this.modifiers().filter((modifier) => modifier.id === 'landExpansion');
  });

  protected readonly heroRightModifiers = computed<readonly CityModifierToggle[]>(() => {
    return this.modifiers().filter(
      (modifier) => modifier.id === 'aphroditeActive' || modifier.id === 'plowResearched',
    );
  });
}
