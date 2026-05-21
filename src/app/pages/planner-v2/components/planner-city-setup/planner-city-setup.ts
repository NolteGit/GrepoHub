import { Component, input } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhNumberStepper } from '../../../../shared/ui/gh-number-stepper/gh-number-stepper';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';
import {
  GhSelectField,
  type GhSelectOption,
} from '../../../../shared/ui/gh-select-field/gh-select-field';
import { GhTileShell } from '../../../../shared/ui/gh-tile-shell/gh-tile-shell';

import type {
  BuildingTilePlaceholder,
  CityModifierToggle,
  SetupContextItem,
  TranslatableText,
} from '../../planner-v2.models';

@Component({
  selector: 'app-planner-city-setup',
  imports: [TranslatePipe, GhNumberStepper, GhPanel, GhSelectField, GhTileShell],
  templateUrl: './planner-city-setup.html',
})
export class PlannerCitySetup {
  readonly contextLeft = input.required<readonly SetupContextItem[]>();
  readonly contextRight = input.required<readonly SetupContextItem[]>();
  readonly modifiers = input.required<readonly CityModifierToggle[]>();
  readonly buildings = input.required<readonly BuildingTilePlaceholder[]>();
  readonly specialSlots = input.required<readonly TranslatableText[]>();
  readonly specialBuildingOptions = input.required<readonly GhSelectOption[]>();
}
