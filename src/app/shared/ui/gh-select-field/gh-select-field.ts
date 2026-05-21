import { Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../pipes/translate.pipe';

export type GhSelectOption = {
  readonly value: string;
  readonly label?: string;
  readonly labelKey?: string;
  readonly fallback?: string;
};

@Component({
  selector: 'app-gh-select-field',
  imports: [TranslatePipe],
  templateUrl: './gh-select-field.html',
  host: {
    class: 'block min-w-0',
  },
})
export class GhSelectField {
  readonly labelKey = input<string | null>(null);
  readonly labelFallback = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly value = input.required<string>();
  readonly options = input.required<readonly GhSelectOption[]>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly valueChange = output<string>();

  protected readonly selectClasses = computed(() => {
    const classes = ['gh-control', 'w-full', 'cursor-pointer', 'rounded-md', 'px-3'];

    if (this.size() === 'sm') {
      classes.push('min-h-8', 'text-sm');
    } else if (this.size() === 'lg') {
      classes.push('min-h-11');
    } else {
      classes.push('min-h-10', 'text-sm');
    }

    return classes.join(' ');
  });

  protected selectValue(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}
