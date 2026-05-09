import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { routes } from '../app.routes';
import { GameDataService } from '../services/game-data.service';
import { TranslationService } from '../services/translation.service';

const testTranslations: Record<string, string> = {
  'home.title': 'Grepo Hub',
};

export const appTestProviders = [
  provideRouter(routes),
  {
    provide: TranslationService,
    useValue: {
      currentLanguage: () => 'en',
      translate: (key: string) => testTranslations[key] ?? key,
      setLanguage: () => undefined,
      toggleLanguage: () => undefined,
    },
  },
  {
    provide: GameDataService,
    useValue: {
      getUnitDefinitions: () => of([]),
      getBuildingDefinitions: () => of([]),
    },
  },
];
