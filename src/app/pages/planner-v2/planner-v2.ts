import { Component, computed, inject, signal } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { PlanConfigService } from '../../services/plan-config.service';

import { PlannerHeader } from './components/planner-header/planner-header';
import {
  PlannerMode,
  PlannerModeSwitch,
} from './components/planner-mode-switch/planner-mode-switch';
import { PlannerSummarySidebar } from './components/planner-summary-sidebar/planner-summary-sidebar';
import { PlannerToolbox } from './components/planner-toolbox/planner-toolbox';

type PlannerTilePlaceholder = {
  readonly name: string;
  readonly icon: string;
  readonly level?: number;
  readonly amount?: string;
  readonly stat: string;
};

type RequirementCard = {
  readonly label: string;
  readonly icon: string;
  readonly value: string;
};

type BottomSummaryStat = {
  readonly label: string;
  readonly value: string;
  readonly icon: string;
};

const buildingPlaceholders: readonly PlannerTilePlaceholder[] = [
  { name: 'Senate', icon: '▥', level: 9, stat: 'Population 27' },
  { name: 'Timber Camp', icon: '♜', level: 1, stat: 'Wood 1' },
  { name: 'Farm', icon: '♨', level: 1, stat: 'Population 1' },
  { name: 'Quarry', icon: '◼', level: 1, stat: 'Stone 1' },
  { name: 'Warehouse', icon: '▤', level: 1, stat: 'Storage 1' },
  { name: 'Silver Mine', icon: '●', level: 1, stat: 'Silver 1' },
  { name: 'Barracks', icon: '⚔', level: 1, stat: 'Units 1' },
  { name: 'Temple', icon: '♛', level: 1, stat: 'Favor 1' },
  { name: 'Marketplace', icon: '◎', level: 1, stat: 'Trade 1' },
  { name: 'Harbour', icon: '⚓', level: 0, stat: 'Ships 0' },
  { name: 'Academy', icon: '⚗', level: 0, stat: 'Research 0' },
  { name: 'City Wall', icon: '▰', level: 0, stat: 'Defense 0' },
];

const unitPlaceholders: readonly PlannerTilePlaceholder[] = [
  { name: 'Swordsman', icon: '⚔', amount: '7,420', stat: '18 attack · 1 pop · 00:30' },
  { name: 'Archer', icon: '➶', amount: '5,210', stat: '24 attack · 1 pop · 00:35' },
  { name: 'Hoplite', icon: '◈', amount: '3,860', stat: '28 attack · 1 pop · 00:45' },
  { name: 'Horseman', icon: '♞', amount: '1,980', stat: '32 attack · 2 pop · 00:50' },
  { name: 'Slinger', icon: '◒', amount: '2,450', stat: '16 attack · 1 pop · 00:25' },
  { name: 'Chariot', icon: '♘', amount: '1,150', stat: '36 attack · 2 pop · 00:55' },
  { name: 'Catapult', icon: '⚙', amount: '2,150', stat: '120 attack · 5 pop · 02:00' },
  { name: 'Militia', icon: '◉', amount: '4,300', stat: '10 attack · 1 pop · 00:20' },
];

const requirementCards: readonly RequirementCard[] = [
  { label: 'Barracks', icon: '⚔', value: 'Level 25' },
  { label: 'Harbour', icon: '⚓', value: 'Level 20' },
  { label: 'Temple', icon: '♛', value: 'Level 18' },
  { label: 'God', icon: '☉', value: 'Zeus' },
];

@Component({
  selector: 'app-planner-v2',
  imports: [TranslatePipe, PlannerToolbox, PlannerHeader, PlannerModeSwitch, PlannerSummarySidebar],
  templateUrl: './planner-v2.html',
  styleUrl: './planner-v2.scss',
})
export class PlannerV2 {
  private readonly planConfigService = inject(PlanConfigService);

  protected readonly plans = this.planConfigService.plans;
  protected readonly activePlan = this.planConfigService.activePlan;
  protected readonly activeMode = signal<PlannerMode>('city');
  protected readonly buildingPlaceholders = buildingPlaceholders;
  protected readonly unitPlaceholders = unitPlaceholders;
  protected readonly requirementCards = requirementCards;
  protected readonly specialSlots = ['Special Building 1', 'Special Building 2'];
  protected readonly troopCategories = ['Land Units', 'Sea Units', 'Mythical Units', 'Favorites'];
  protected readonly buildingCount = computed(
    () => Object.keys(this.activePlan().cityPlan.buildingLevels).length,
  );
  protected readonly usedUnitCount = computed(
    () =>
      Object.values(this.activePlan().troopPlan.unitAmounts).filter((amount) => amount > 0).length,
  );
  protected readonly bottomSummaryStats = computed<readonly BottomSummaryStat[]>(() =>
    this.activeMode() === 'city'
      ? [
          { label: 'Total Population', value: '114', icon: '♟' },
          { label: 'Total Buildings', value: String(this.buildingCount()), icon: '▥' },
          { label: 'Used Land', value: '20 / 20', icon: '▦' },
          { label: 'City Modifiers', value: 'Aphro, Expansion, Pflug', icon: '★' },
        ]
      : [
          { label: 'Total Units', value: '28,520', icon: '⚔' },
          { label: 'Used Population', value: '28,520 / 114', icon: '♟' },
          { label: 'Total Attack', value: '620,260', icon: '⚔' },
          { label: 'Carrying Capacity', value: '105,000', icon: '⚓' },
          { label: 'March Time', value: '01:42:30', icon: '◷' },
        ],
  );

  protected selectMode(mode: PlannerMode): void {
    this.activeMode.set(mode);
  }

  protected selectPlan(planId: string): void {
    this.planConfigService.selectPlan(planId);
  }
}
