import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((module) => module.Home),
  },
  {
    path: 'city-planner',
    loadComponent: () =>
      import('./pages/city-planner/city-planner').then((module) => module.CityPlanner),
  },
  {
    path: 'troops-planner',
    loadComponent: () =>
      import('./pages/troops-planner/troops-planner').then((module) => module.TroopsPlanner),
  },
  {
    path: 'references',
    loadComponent: () => import('./pages/references/references').then((module) => module.References),
  },
  {
    path: 'toolbox',
    loadComponent: () => import('./pages/toolbox/toolbox').then((module) => module.Toolbox),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
