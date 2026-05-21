import { Component, input } from '@angular/core';

import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-gh-tile-shell',
  imports: [TranslatePipe],
  templateUrl: './gh-tile-shell.html',
  host: {
    class: 'block',
  },
})
export class GhTileShell {
  readonly icon = input.required<string>();
  readonly labelKey = input.required<string>();
  readonly fallback = input.required<string>();
}
