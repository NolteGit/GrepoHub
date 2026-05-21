import { Component, input } from '@angular/core';

@Component({
  selector: 'app-gh-panel',
  templateUrl: './gh-panel.html',
  host: {
    class: 'block gh-panel rounded-xl text-[var(--gh-text)]',
    '[class.gh-panel-primary]': "variant() === 'primary'",
    '[class.p-0]': "padding() === 'none'",
    '[class.p-3]': "padding() === 'sm'",
    '[class.p-4]': "padding() === 'md'",
    '[class.p-5]': "padding() === 'lg'",
  },
})
export class GhPanel {
  readonly variant = input<'default' | 'primary'>('default');
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
}
