import { Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';

import { PlannerUnitTile } from '../planner-unit-tile/planner-unit-tile';

import type {
  SetupContextItem,
  SidebarTroopTransportStats,
  TranslatableText,
  TroopCategory,
  TroopCategoryTab,
  UnitTileView,
} from '../../planner-v2.models';

type TransportStatRow = TranslatableText & {
  readonly id: string;
  readonly value: string;
  readonly tone: 'default' | 'gold' | 'danger' | 'muted';
};

type TroopCategoryTabWithContext = TroopCategoryTab & {
  readonly context: SetupContextItem;
};

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

@Component({
  selector: 'app-planner-troop-setup',
  imports: [TranslatePipe, GhPanel, PlannerUnitTile],
  templateUrl: './planner-troop-setup.html',
})
export class PlannerTroopSetup {
  readonly categoryContexts = input.required<Record<TroopCategory, SetupContextItem>>();
  readonly categories = input.required<readonly TroopCategoryTab[]>();
  readonly activeCategory = input.required<TroopCategory>();
  readonly units = input.required<readonly UnitTileView[]>();
  readonly transportStats = input.required<SidebarTroopTransportStats>();
  readonly categorySelected = output<TroopCategory>();
  readonly unitAmountChanged = output<{ readonly unitId: string; readonly amount: number }>();

  protected readonly categoryTabs = computed<readonly TroopCategoryTabWithContext[]>(() => {
    const contexts = this.categoryContexts();

    return this.categories().map((category) => ({
      ...category,
      context: contexts[category.id],
    }));
  });

  protected readonly transportRows = computed<readonly TransportStatRow[]>(() => {
    const stats = this.transportStats();
    const balance = stats.transportBalance;
    const isMissingCapacity = balance < 0;

    return [
      {
        id: 'used',
        labelKey: 'plannerV2.summary.transportSpace',
        fallback: 'Used',
        value: formatNumber(stats.transportSpace),
        tone: stats.transportSpace > 0 ? 'gold' : 'muted',
      },
      {
        id: 'capacity',
        labelKey: 'plannerV2.summary.transportCapacity',
        fallback: 'Capacity',
        value: formatNumber(stats.transportCapacity),
        tone: stats.transportCapacity > 0 ? 'default' : 'muted',
      },
      {
        id: isMissingCapacity ? 'missing' : 'available',
        labelKey: isMissingCapacity
          ? 'plannerV2.summary.transportOverflow'
          : 'plannerV2.summary.transportAvailable',
        fallback: isMissingCapacity ? 'Missing capacity' : 'Available',
        value: isMissingCapacity ? `+${formatNumber(Math.abs(balance))}` : formatNumber(balance),
        tone: isMissingCapacity ? 'danger' : balance > 0 ? 'default' : 'muted',
      },
      {
        id: 'bunks',
        labelKey: 'plannerV2.summary.bunksBonus',
        fallback: 'Bunks bonus',
        value: formatNumber(stats.bunksBonus),
        tone: stats.bunksBonus > 0 ? 'gold' : 'muted',
      },
    ];
  });
  protected readonly missingTransportCapacity = computed<number>(() =>
    Math.max(0, -this.transportStats().transportBalance),
  );
  protected readonly missingTransportCapacityLabel = computed<string>(() =>
    formatNumber(this.missingTransportCapacity()),
  );
  protected readonly transportUsageLabel = computed<string>(() => {
    const stats = this.transportStats();

    return `${formatNumber(stats.transportSpace)}/${formatNumber(stats.transportCapacity)}`;
  });
}
