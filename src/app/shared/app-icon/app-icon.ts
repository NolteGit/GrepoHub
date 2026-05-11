import { Component, Input } from '@angular/core';

export type AppIconName =
  | 'calculator'
  | 'chevron-down'
  | 'chevron-left'
  | 'language'
  | 'clear-all'
  | 'save'
  | 'export'
  | 'import'
  | 'duplicate'
  | 'delete'
  | 'clear'
  | 'reset';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      class="app-icon"
      [attr.aria-hidden]="label ? null : 'true'"
      [attr.aria-label]="label || null"
      [attr.role]="label ? 'img' : null"
      focusable="false"
    >
      <use [attr.href]="href" [attr.xlink:href]="href"></use>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: 0 0 auto;
        line-height: 0;
      }

      .app-icon {
        width: 1em;
        height: 1em;
        color: currentColor;
        fill: none;
      }
    `,
  ],
})
export class AppIconComponent {
  @Input({ required: true }) name!: AppIconName;
  @Input() label = '';

  protected get href(): string {
    return `icons/icons.svg#${this.name}`;
  }
}
