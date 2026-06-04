import { Routes } from '@angular/router';

const loadPlanner = () => import('./pages/planner/planner').then((module) => module.Planner);

export const routes: Routes = [
  {
    path: '',
    loadComponent: loadPlanner,
  },
  {
    path: 'planner',
    loadComponent: loadPlanner,
  },
  {
    path: 'planner-v2',
    redirectTo: 'planner',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
