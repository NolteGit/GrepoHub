import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CalculatorButton, ToolDraft } from '../../models/toolbox.models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-quick-calculator',
  imports: [TranslatePipe],
  templateUrl: './quick-calculator.html',
  styleUrl: './quick-calculator.scss',
})
export class QuickCalculatorComponent {
  @Input() draft!: ToolDraft;
  @Input() preview = '';
  @Input() buttons: CalculatorButton[] = [];
  @Input() keyboardActive = false;

  @Output() keyboardActivate = new EventEmitter<void>();
  @Output() buttonPressed = new EventEmitter<CalculatorButton>();
}
