import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/planner-v2/planner-v2').then((module) => module.PlannerV2),
  },
  {
    path: 'planner-v2',
    loadComponent: () => import('./pages/planner-v2/planner-v2').then((module) => module.PlannerV2),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
