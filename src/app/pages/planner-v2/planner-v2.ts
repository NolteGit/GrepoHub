import { Component, computed, inject } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { PlanConfigService } from '../../services/plan-config.service';

@Component({
  selector: 'app-planner-v2',
  imports: [TranslatePipe],
  templateUrl: './planner-v2.html',
  styleUrl: './planner-v2.scss',
})
export class PlannerV2 {
  private readonly planConfigService = inject(PlanConfigService);

  protected readonly plans = this.planConfigService.plans;
  protected readonly activePlan = this.planConfigService.activePlan;
  protected readonly buildingCount = computed(
    () => Object.keys(this.activePlan().cityPlan.buildingLevels).length,
  );
  protected readonly usedUnitCount = computed(
    () => Object.values(this.activePlan().troopPlan.unitAmounts).filter((amount) => amount > 0).length,
  );
}
