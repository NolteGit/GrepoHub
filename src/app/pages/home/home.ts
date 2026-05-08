import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../pipes/translate.pipe';

type DashboardCard = {
  titleKey: string;
  descriptionKey: string;
  path: string;
  featured: boolean;
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly dashboardCards: DashboardCard[] = [
  {
    titleKey: 'dashboard.cityPlanning.title',
    descriptionKey: 'dashboard.cityPlanning.description',
    path: '/city-planner',
    featured: true,
  },
  {
    titleKey: 'dashboard.unitPlanning.title',
    descriptionKey: 'dashboard.unitPlanning.description',
    path: '/troops-planner',
    featured: true,
  },
  {
    titleKey: 'dashboard.references.title',
    descriptionKey: 'dashboard.references.description',
    path: '/references',
    featured: false,
  },
  {
    titleKey: 'dashboard.timeTools.title',
    descriptionKey: 'dashboard.timeTools.description',
    path: '/time-tools',
    featured: false,
  },
  {
    titleKey: 'dashboard.battleSimulator.title',
    descriptionKey: 'dashboard.battleSimulator.description',
    path: '/battle-simulator',
    featured: false,
  },
];
}