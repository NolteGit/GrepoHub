import { Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-gh-number-stepper',
  imports: [TranslatePipe],
  templateUrl: './gh-number-stepper.html',
  host: {
    class: 'block min-w-0',
  },
})
export class GhNumberStepper {
  readonly value = input<number | string>(0);
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly step = input(1);
  readonly showMinMax = input(false);
  readonly valueChange = output<number>();

  protected readonly displayValue = computed(() => String(this.value()));

  protected decrease(): void {
    this.emitValue(this.numericValue() - this.step());
  }

  protected increase(): void {
    this.emitValue(this.numericValue() + this.step());
  }

  protected setMinimum(): void {
    const minimum = this.min();

    if (minimum !== null) {
      this.emitValue(minimum);
    }
  }

  protected setMaximum(): void {
    const maximum = this.max();

    if (maximum !== null) {
      this.emitValue(maximum);
    }
  }

  private numericValue(): number {
    const rawValue = this.value();

    if (typeof rawValue === 'number') {
      return rawValue;
    }

    return Number(rawValue.replace(/[,_\s]/g, '')) || 0;
  }

  private emitValue(value: number): void {
    const minimum = this.min();
    const maximum = this.max();
    let nextValue = value;

    if (minimum !== null) {
      nextValue = Math.max(minimum, nextValue);
    }

    if (maximum !== null) {
      nextValue = Math.min(maximum, nextValue);
    }

    this.valueChange.emit(nextValue);
  }
}
