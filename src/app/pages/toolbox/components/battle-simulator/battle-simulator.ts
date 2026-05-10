import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DraftUpdateEvent, ToolDraft } from '../../models/toolbox.models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

type BattleSimulatorSummary = {
  titleKey: string;
  eyebrowKey: string;
};

@Component({
  selector: 'app-battle-simulator',
  imports: [TranslatePipe],
  templateUrl: './battle-simulator.html',
  styleUrl: './battle-simulator.scss',
})
export class BattleSimulatorComponent {
  @Input() summary!: BattleSimulatorSummary;
  @Input() draft!: ToolDraft;

  @Output() draftUpdated = new EventEmitter<DraftUpdateEvent>();
}
