import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { CityPlanner } from './pages/city-planner/city-planner';
import { TroopsPlanner } from './pages/troops-planner/troops-planner';
import { References } from './pages/references/references';
import { Toolbox } from './pages/toolbox/toolbox';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'city-planner',
    component: CityPlanner,
  },
  {
    path: 'troops-planner',
    component: TroopsPlanner,
  },
  {
    path: 'references',
    component: References,
  },
  {
    path: 'toolbox',
    component: Toolbox,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
