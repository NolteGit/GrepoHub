import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import type { ActiveTimerItem } from '../../pages/toolbox/models/toolbox.models';
import { ToolboxTimerService } from '../../pages/toolbox/services/toolbox-timer.service';
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly translationService = inject(TranslationService);
  protected readonly timerService = inject(ToolboxTimerService);
  protected readonly isNavigationMenuOpen = signal(false);
  protected readonly isTimerMenuOpen = signal(false);
  protected readonly isContactPopoverOpen = signal(false);
  protected readonly githubUrl = 'https://github.com/NolteGit/GrepoHub';
  protected readonly contactEmail = 'replace-me@example.com';
  protected readonly timerItems = this.timerService.overviewItems;
  protected readonly activeTimerItems = computed(() =>
    this.timerItems().filter((item) => item.tone !== 'done'),
  );
  protected readonly finishedTimerItems = computed(() =>
    this.timerItems().filter((item) => item.tone === 'done'),
  );
  protected readonly hasTimerItems = computed(() => this.timerItems().length > 0);
  protected readonly timerBadgeCount = computed(() =>
    this.finishedTimerItems().length > 0
      ? this.finishedTimerItems().length
      : this.activeTimerItems().length,
  );
  protected readonly hasFinishedTimerItems = computed(() => this.finishedTimerItems().length > 0);

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
    this.closeTimerMenu();
  }

  protected toggleTimerMenu(): void {
    if (!this.hasTimerItems()) {
      this.closeTimerMenu();
      return;
    }

    this.isTimerMenuOpen.update((isOpen) => !isOpen);
    this.closeNavigationMenu();
  }

  protected closeTimerMenu(): void {
    this.isTimerMenuOpen.set(false);
  }

  protected toggleContactPopover(): void {
    this.isContactPopoverOpen.update((isOpen) => !isOpen);
    this.closeNavigationMenu();
    this.closeTimerMenu();
  }

  protected closeContactPopover(): void {
    this.isContactPopoverOpen.set(false);
  }

  protected removeTimerItem(item: ActiveTimerItem): void {
    this.timerService.removeOverviewItem(item);
  }

  protected toggleTimerItem(item: ActiveTimerItem): void {
    this.timerService.toggleOverviewItem(item);
  }

  protected canToggleTimerItem(item: ActiveTimerItem): boolean {
    return item.type !== 'alarm' && item.tone !== 'done';
  }

  protected timerToggleLabelKey(item: ActiveTimerItem): string {
    return item.running ? 'toolbox.queue.pause' : 'toolbox.queue.start';
  }

  protected closeNavigationMenu(): void {
    this.isNavigationMenuOpen.set(false);
  }

  @HostListener('document:pointerdown', ['$event'])
  protected closePopoversOnOutsideClick(event: PointerEvent): void {
    if (!this.isTimerMenuOpen() && !this.isContactPopoverOpen()) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    const timerWidget = this.elementRef.nativeElement.querySelector('.app-shell__timer-widget');
    const contactWidget = this.elementRef.nativeElement.querySelector('.app-shell__contact');

    if (timerWidget?.contains(target) || contactWidget?.contains(target)) {
      return;
    }

    this.closeTimerMenu();
    this.closeContactPopover();
  }

  @HostListener('document:keydown.escape')
  protected closeOpenMenus(): void {
    this.closeNavigationMenu();
    this.closeTimerMenu();
    this.closeContactPopover();
  }

  @HostListener('window:resize')
  protected closeNavigationMenuOnDesktop(): void {
    if (window.innerWidth > 1180) {
      this.closeNavigationMenu();
    }

    this.closeTimerMenu();
    this.closeContactPopover();
  }
}
