import { Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GhPanel } from '../../../../shared/ui/gh-panel/gh-panel';

import { PlannerUnitTile } from '../planner-unit-tile/planner-unit-tile';

import type {
  GodOption,
  SetupContextItem,
  SidebarTroopTransportStats,
  TroopCategory,
  TroopCategoryTab,
  UnitTileView,
} from '../../planner-v2.models';

type TranslationParams = Record<string, string | number>;

type TransportPlannerTone = 'default' | 'gold' | 'danger' | 'muted' | 'success';

type TransportPlannerBarSegment = {
  readonly id: string;
  readonly left: string;
  readonly width: string;
};

type TransportPlannerBar = {
  readonly fillWidth: string;
  readonly fillColor: string;
  readonly trackColor: string;
  readonly segmentColor: string;
  readonly topLeftKey: string;
  readonly topLeftFallback: string;
  readonly topLeftParams?: TranslationParams;
  readonly topRightKey: string;
  readonly topRightFallback: string;
  readonly topRightParams?: TranslationParams;
  readonly bottomLeftKey: string;
  readonly bottomLeftFallback: string;
  readonly bottomLeftParams?: TranslationParams;
  readonly bottomRightKey: string;
  readonly bottomRightFallback: string;
  readonly bottomRightParams?: TranslationParams;
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
  readonly selectedGod = input.required<string>();
  readonly gods = input.required<readonly GodOption[]>();
  readonly units = input.required<readonly UnitTileView[]>();
  readonly transportStats = input.required<SidebarTroopTransportStats>();
  readonly detailsVisible = input(false);
  readonly detailsToggled = output<boolean>();
  readonly categorySelected = output<TroopCategory>();
  readonly godSelected = output<string>();
  readonly unitAmountChanged = output<{ readonly unitId: string; readonly amount: number }>();
  readonly bunksToggled = output<boolean>();

  protected readonly categoryTabs = computed<readonly TroopCategoryTabWithContext[]>(() => {
    const contexts = this.categoryContexts();

    return this.categories().map((category) => ({
      ...category,
      context: contexts[category.id],
    }));
  });

  protected readonly transportTone = computed<TransportPlannerTone>(() => {
    const stats = this.transportStats();

    if (stats.transportSpace <= 0) {
      return 'muted';
    }

    if (stats.transportBalance < 0) {
      return 'danger';
    }

    if (stats.transportBalance === 0) {
      return 'success';
    }

    return 'gold';
  });

  protected readonly transportAccentColor = computed<string>(() => {
    const tone = this.transportTone();

    if (tone === 'danger') {
      return '#cf453e';
    }

    if (tone === 'success') {
      return '#39a96b';
    }

    if (tone === 'gold') {
      return 'var(--gh-gold)';
    }

    return 'var(--gh-muted)';
  });

  protected readonly transportLoadValue = computed<string>(
    () => `${formatNumber(this.transportStats().transportSpace)} pop`,
  );

  protected readonly transportBar = computed<TransportPlannerBar>(() => {
    const stats = this.transportStats();
    const missingCapacity = Math.max(0, -stats.transportBalance);
    const freeCapacity = Math.max(0, stats.transportBalance);
    const hasLoad = stats.transportSpace > 0;
    const tone = this.transportTone();

    if (!hasLoad) {
      return this.createTransportBar({
        fillWidth: '0%',
        fillColor: 'var(--gh-muted)',
        trackColor: 'rgba(148, 163, 184, 0.14)',
        segmentColor: 'rgba(255,255,255,0.12)',
        topLeftKey: 'plannerV2.summary.transportBarIdleLeft',
        topLeftFallback: 'No transport load',
        topRightKey: 'plannerV2.summary.transportBarIdleRight',
        topRightFallback: 'Select land units',
        bottomLeftKey: 'plannerV2.summary.transportRequiredShipsDetail',
        bottomLeftFallback: 'Slow {slowCapacity} / fast {fastCapacity} capacity',
        bottomLeftParams: {
          slowCapacity: formatNumber(stats.slowTransportCapacity),
          fastCapacity: formatNumber(stats.fastTransportCapacity),
        },
        bottomRightKey: 'plannerV2.summary.transportNoShipsRequired',
        bottomRightFallback: 'No ships required',
      });
    }

    if (tone === 'danger') {
      return this.createTransportBar({
        fillWidth: `${((stats.transportCapacity / stats.transportSpace) * 100).toFixed(2)}%`,
        fillColor: '#cf453e',
        trackColor: 'rgba(207, 69, 62, 0.18)',
        segmentColor: 'rgba(255,255,255,0.28)',
        topLeftKey: 'plannerV2.summary.transportBarSelected',
        topLeftFallback: 'Selected {capacity} / {load} pop',
        topLeftParams: {
          capacity: formatNumber(stats.transportCapacity),
          load: formatNumber(stats.transportSpace),
        },
        topRightKey: 'plannerV2.summary.transportBarMissing',
        topRightFallback: 'Missing {value} pop',
        topRightParams: { value: formatNumber(missingCapacity) },
        bottomLeftKey: 'plannerV2.summary.transportBarShipsSelected',
        bottomLeftFallback: 'Ships {slow} slow · {fast} fast',
        bottomLeftParams: {
          slow: formatNumber(stats.slowTransportShipCount),
          fast: formatNumber(stats.fastTransportShipCount),
        },
        bottomRightKey: 'plannerV2.summary.transportBarNeedShips',
        bottomRightFallback: 'Need +{slow} slow or +{fast} fast',
        bottomRightParams: {
          slow: formatNumber(stats.additionalSlowTransportShips),
          fast: formatNumber(stats.additionalFastTransportShips),
        },
      });
    }

    if (tone === 'success') {
      return this.createTransportBar({
        fillWidth: '100%',
        fillColor: '#39a96b',
        trackColor: 'rgba(57, 169, 107, 0.2)',
        segmentColor: 'rgba(255,255,255,0.3)',
        topLeftKey: 'plannerV2.summary.transportBarSelected',
        topLeftFallback: 'Selected {capacity} / {load} pop',
        topLeftParams: {
          capacity: formatNumber(stats.transportCapacity),
          load: formatNumber(stats.transportSpace),
        },
        topRightKey: 'plannerV2.summary.transportBarPerfect',
        topRightFallback: 'Perfect fit',
        bottomLeftKey: 'plannerV2.summary.transportBarShipsSelected',
        bottomLeftFallback: 'Ships {slow} slow · {fast} fast',
        bottomLeftParams: {
          slow: formatNumber(stats.slowTransportShipCount),
          fast: formatNumber(stats.fastTransportShipCount),
        },
        bottomRightKey: 'plannerV2.summary.transportBarExactCapacity',
        bottomRightFallback: 'Exact transport capacity',
      });
    }

    return this.createTransportBar({
      fillWidth: `${((stats.transportSpace / stats.transportCapacity) * 100).toFixed(2)}%`,
      fillColor: 'var(--gh-gold)',
      trackColor: 'rgba(212, 160, 55, 0.22)',
      segmentColor: 'rgba(255,255,255,0.28)',
      topLeftKey: 'plannerV2.summary.transportBarSelected',
      topLeftFallback: 'Selected {capacity} / {load} pop',
      topLeftParams: {
        capacity: formatNumber(stats.transportCapacity),
        load: formatNumber(stats.transportSpace),
      },
      topRightKey: 'plannerV2.summary.transportBarFree',
      topRightFallback: 'Free {value} pop',
      topRightParams: { value: formatNumber(freeCapacity) },
      bottomLeftKey: 'plannerV2.summary.transportBarShipsSelected',
      bottomLeftFallback: 'Ships {slow} slow · {fast} fast',
      bottomLeftParams: {
        slow: formatNumber(stats.slowTransportShipCount),
        fast: formatNumber(stats.fastTransportShipCount),
      },
      bottomRightKey: 'plannerV2.summary.transportBarRequiredShipsInline',
      bottomRightFallback: 'Required {slow} slow or {fast} fast',
      bottomRightParams: {
        slow: formatNumber(stats.requiredSlowTransportShips),
        fast: formatNumber(stats.requiredFastTransportShips),
      },
    });
  });

  private createTransportBar(bar: TransportPlannerBar): TransportPlannerBar {
    return bar;
  }

  protected readonly transportShipSegments = computed<readonly TransportPlannerBarSegment[]>(() => {
    const stats = this.transportStats();
    const totalReference = Math.max(stats.transportSpace, stats.transportCapacity);

    if (totalReference <= 0) {
      return [];
    }

    const segments: TransportPlannerBarSegment[] = [];
    let offset = 0;

    const appendSegments = (count: number, widthValue: number, prefix: string): void => {
      for (let index = 0; index < count; index += 1) {
        const width = (widthValue / totalReference) * 100;
        segments.push({
          id: `${prefix}-${index.toString()}`,
          left: `${offset.toFixed(3)}%`,
          width: `${width.toFixed(3)}%`,
        });
        offset += width;
      }
    };

    appendSegments(stats.slowTransportShipCount, stats.slowTransportCapacity, 'slow');
    appendSegments(stats.fastTransportShipCount, stats.fastTransportCapacity, 'fast');

    return segments;
  });

  protected selectGod(event: Event): void {
    event.stopPropagation();
    this.godSelected.emit((event.target as HTMLSelectElement).value);
  }

  protected toggleDetails(event: Event): void {
    this.detailsToggled.emit((event.target as HTMLInputElement).checked);
  }

  protected toggleBunks(event: Event): void {
    this.bunksToggled.emit((event.target as HTMLInputElement).checked);
  }
}
