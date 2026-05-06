import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

type NavItem = {
  label: string;
  path: string;
  icon?: string;
};

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly navItems: NavItem[] = [
    {
      label: 'City Planner',
      path: '/city-planner',
    },
    {
      label: 'Troops Planner',
      path: '/troops-planner',
    },
    {
      label: 'References',
      path: '/references',
    },
    {
      label: 'Guides',
      path: '/guides',
    },
    {
      label: 'Time Tools',
      path: '/time-tools',
    },
    {
      label: 'Battle Simulator',
      path: '/battle-simulator',
    },
    {
      label: 'Settings',
      path: '/settings',
    },
  ];
}