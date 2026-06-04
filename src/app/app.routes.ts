import { Routes } from '@angular/router';

const loadPlanner = () =>
  import('./pages/planner-v2/planner-v2').then((module) => module.PlannerV2);

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
    loadComponent: loadPlanner,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
