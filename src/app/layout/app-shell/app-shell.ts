import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

type NavItem = {
  labelKey: string;
  path: string;
};

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly translationService = inject(TranslationService);

  protected readonly navItems: NavItem[] = [
    {
      labelKey: 'nav.cityPlanner',
      path: '/city-planner',
    },
    {
      labelKey: 'nav.troopsPlanner',
      path: '/troops-planner',
    },
    {
      labelKey: 'nav.references',
      path: '/references',
    },
    {
      labelKey: 'nav.guides',
      path: '/guides',
    },
    {
      labelKey: 'nav.timeTools',
      path: '/time-tools',
    },
    {
      labelKey: 'nav.battleSimulator',
      path: '/battle-simulator',
    },
  ];

  protected toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }
}