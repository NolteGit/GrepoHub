import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-gh-button',
  templateUrl: './gh-button.html',
  host: {
    class: 'inline-block',
  },
})
export class GhButton {
  readonly variant = input<'default' | 'primary' | 'gold'>('default');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly wide = input(false);
  readonly ariaLabel = input<string | null>(null);

  protected readonly buttonClasses = computed(() => {
    const classes = [
      'gh-button',
      'inline-flex',
      'cursor-pointer',
      'items-center',
      'justify-center',
      'gap-2',
      'rounded-md',
      'font-bold',
      'text-[var(--gh-text)]',
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
      classes.push('min-h-8', 'px-3', 'text-sm');
    } else if (this.size() === 'lg') {
      classes.push('min-h-11', 'px-4');
    } else {
      classes.push('min-h-10', 'px-4', 'text-sm');
    }

    if (this.wide()) {
      classes.push('w-full');
    }

    return classes.join(' ');
  });
}
