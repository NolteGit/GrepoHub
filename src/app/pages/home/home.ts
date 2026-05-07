import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type DashboardCard = {
  title: string;
  description: string;
  path: string;
};


@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})

export class Home {
  protected readonly dashboardCards: DashboardCard[] = [
    {
      title: 'City Planning',
      description: 'Plan and organize city development.',
      path: '/city-planner',
    },
    {
      title: 'Unit Planning',
      description: 'Prepare unit compositions and planning notes.',
      path: '/troops-planner',
    },
    {
      title: 'References',
      description: 'Look up useful game information and reference material.',
      path: '/references',
    },
    {
      title: 'Guides',
      description: 'Collect and browse strategy guides and explanations.',
      path: '/guides',
    },
    {
      title: 'Time Tools',
      description: 'Access timers and time-based planning tools.',
      path: '/time-tools',
    },
    {
      title: 'Battle Simulator',
      description: 'Prepare future battle simulation and comparison tools.',
      path: '/battle-simulator',
    },
  ];
}