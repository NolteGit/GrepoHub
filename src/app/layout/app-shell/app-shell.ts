import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { AppIconComponent } from '../../shared/app-icon/app-icon';

type NavItem = {
  labelKey: string;
  path: string;
};

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, AppIconComponent],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly translationService = inject(TranslationService);
  protected readonly isNavigationMenuOpen = signal(false);

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
      labelKey: 'nav.toolbox',
      path: '/toolbox',
    },
  ];

  protected toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }

  protected toggleNavigationMenu(): void {
    this.isNavigationMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeNavigationMenu(): void {
    this.isNavigationMenuOpen.set(false);
  }

  @HostListener('window:resize')
  protected closeNavigationMenuOnDesktop(): void {
    if (window.innerWidth > 1180) {
      this.closeNavigationMenu();
    }
  }
}
