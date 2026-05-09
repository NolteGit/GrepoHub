import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DraftUpdateEvent, ToolDraft } from '../../models/toolbox.models';

type BattleSimulatorSummary = {
  title: string;
  eyebrow: string;
};

@Component({
  selector: 'app-battle-simulator',
  templateUrl: './battle-simulator.html',
  styleUrl: './battle-simulator.scss',
})
export class BattleSimulatorComponent {
  @Input() summary!: BattleSimulatorSummary;
  @Input() draft!: ToolDraft;

  @Output() draftUpdated = new EventEmitter<DraftUpdateEvent>();
}
