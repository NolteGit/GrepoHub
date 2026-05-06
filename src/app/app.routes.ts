import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { CityPlanner } from './pages/city-planner/city-planner';
import { TroopsPlanner } from './pages/troops-planner/troops-planner';
import { References } from './pages/references/references';
import { Guides } from './pages/guides/guides';
import { TimeTools } from './pages/time-tools/time-tools';
import { BattleSimulator } from './pages/battle-simulator/battle-simulator';

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
    path: 'guides',
    component: Guides,
  },
  {
    path: 'time-tools',
    component: TimeTools,
  },
  {
    path: 'battle-simulator',
    component: BattleSimulator,
  },
];