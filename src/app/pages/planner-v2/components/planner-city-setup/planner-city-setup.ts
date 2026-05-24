import { Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';
import { PlannerBuildingTile } from '../planner-building-tile/planner-building-tile';

import type {
  BuildingTileView,
  CityModifierToggle,
  CityModifierToggleId,
  SpecialBuildingOptionView,
  SpecialBuildingSlotView,
} from '../../planner-v2.models';

@Component({
  selector: 'app-planner-city-setup',
  imports: [TranslatePipe, GhPanel, PlannerBuildingTile],
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

  protected readonly compactModifiers = computed<readonly CityModifierToggle[]>(() => {
    const modifierOrder: readonly CityModifierToggleId[] = [
      'landExpansion',
      'aphroditeActive',
      'plowResearched',
    ];
    const modifiers = this.modifiers();

    return modifierOrder
      .map((modifierId) => modifiers.find((modifier) => modifier.id === modifierId))
      .filter((modifier): modifier is CityModifierToggle => modifier !== undefined);
  });

  protected specialBuildingOptions(
    slot: SpecialBuildingSlotView,
  ): readonly SpecialBuildingOptionView[] {
    return slot.options.filter((option) => option.value !== 'none');
  }

  protected selectedSpecialBuildingOption(
    slot: SpecialBuildingSlotView,
  ): SpecialBuildingOptionView | null {
    return slot.options.find((option) => option.value === slot.value) ?? null;
  }

  protected optionIsSelected(
    slot: SpecialBuildingSlotView,
    option: SpecialBuildingOptionView,
  ): boolean {
    return slot.value === option.value;
  }

  protected selectSpecialBuildingOption(
    slot: SpecialBuildingSlotView,
    option: SpecialBuildingOptionView,
  ): void {
    this.specialBuildingSelected.emit({
      slotId: slot.id,
      optionId: this.optionIsSelected(slot, option) ? 'none' : option.value,
    });
  }
}
