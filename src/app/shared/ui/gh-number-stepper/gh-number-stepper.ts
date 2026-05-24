import { Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../pipes/translate.pipe';

type NumberStepperVariant = 'default' | 'amount';

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
  readonly quickStep = input(10);
  readonly largeStep = input(100);
  readonly showMinMax = input(false);
  readonly variant = input<NumberStepperVariant>('default');
  readonly valueChange = output<number>();

  protected readonly displayValue = computed(() => String(this.value()));
  protected readonly resetValue = computed(() => this.min() ?? 0);
  protected readonly canReset = computed(() => this.numericValue() > this.resetValue());
  protected readonly canSetMaximum = computed(() => {
    const maximum = this.max();

    return maximum !== null && this.numericValue() < maximum;
  });

  protected decrease(event?: MouseEvent): void {
    this.emitValue(this.numericValue() - this.resolveStep(event));
  }

  protected increase(event?: MouseEvent): void {
    this.emitValue(this.numericValue() + this.resolveStep(event));
  }

  protected setFromInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const nextValue = this.emitValue(this.parseNumericValue(inputElement.value));

    inputElement.value = String(nextValue);
  }

  protected handleAmountInputKeydown(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    if (event.key === 'Enter') {
      event.preventDefault();
      this.setFromInput(event);
      inputElement.blur();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      inputElement.value = this.displayValue();
      inputElement.blur();
      return;
    }

    if (event.key === 'Home' && this.min() !== null) {
      event.preventDefault();
      inputElement.value = String(this.emitValue(this.min() ?? 0));
      return;
    }

    if (event.key === 'End' && this.max() !== null) {
      event.preventDefault();
      inputElement.value = String(this.emitValue(this.max() ?? 0));
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowUp' ? 1 : -1;
      const nextValue =
        this.parseNumericValue(inputElement.value) + direction * this.resolveStep(event);

      inputElement.value = String(this.emitValue(nextValue));
    }
  }

  protected resetToMinimum(): void {
    this.emitValue(this.resetValue());
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

  private resolveStep(event?: MouseEvent | KeyboardEvent): number {
    if (event?.ctrlKey || event?.metaKey) {
      return this.largeStep();
    }

    if (event?.shiftKey) {
      return this.quickStep();
    }

    return this.step();
  }

  private numericValue(): number {
    return this.parseNumericValue(this.value());
  }

  private parseNumericValue(value: number | string): number {
    if (typeof value === 'number') {
      return value;
    }

    return Number(value.replace(/[,_\s]/g, '')) || 0;
  }

  private emitValue(value: number): number {
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

    return nextValue;
  }
}
