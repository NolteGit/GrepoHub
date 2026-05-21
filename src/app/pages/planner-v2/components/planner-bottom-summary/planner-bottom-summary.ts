import { Component, input } from '@angular/core';

import { GhStatRow } from '../../../../shared/ui/gh-stat-row/gh-stat-row';

import type { BottomSummaryStat } from '../../planner-v2.models';

@Component({
  selector: 'app-planner-bottom-summary',
  imports: [GhStatRow],
  templateUrl: './planner-bottom-summary.html',
})
export class PlannerBottomSummary {
  readonly stats = input.required<readonly BottomSummaryStat[]>();
}
