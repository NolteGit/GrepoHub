import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-gh-icon-button',
  templateUrl: './gh-icon-button.html',
  host: {
    class: 'inline-grid',
  },
})
export class GhIconButton {
  readonly icon = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly variant = input<'default' | 'primary' | 'gold'>('default');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false);

  protected readonly buttonClasses = computed(() => {
    const classes = [
      'gh-button',
      'grid',
      'aspect-square',
      'cursor-pointer',
      'place-items-center',
      'rounded-md',
      'font-black',
      'text-[var(--gh-gold)]',
      'transition',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
    ];

    if (this.variant() === 'primary') {
      classes.push('gh-button-primary');
    }

    if (this.variant() === 'gold') {
      classes.push('gh-gold-fill');
    }

    if (this.size() === 'sm') {
      classes.push('w-7', 'text-xs');
    } else if (this.size() === 'lg') {
      classes.push('w-11', 'text-base');
    } else {
      classes.push('w-9', 'text-sm');
    }

    return classes.join(' ');
  });
}
