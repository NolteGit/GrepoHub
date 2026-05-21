import { Component, computed, input } from '@angular/core';

import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-gh-stat-row',
  imports: [TranslatePipe],
  templateUrl: './gh-stat-row.html',
  host: {
    class: 'block',
  },
})
export class GhStatRow {
  readonly labelKey = input.required<string>();
  readonly fallback = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<string | null>(null);
  readonly tone = input<'default' | 'gold' | 'muted'>('gold');

  protected readonly valueClasses = computed(() => {
    const classes = ['shrink-0', 'text-right', 'text-sm'];

    if (this.tone() === 'gold') {
      classes.push('text-[var(--gh-gold)]');
    } else if (this.tone() === 'muted') {
      classes.push('text-[var(--gh-muted)]');
    } else {
      classes.push('text-[var(--gh-text)]');
    }

    return classes.join(' ');
  });
}
