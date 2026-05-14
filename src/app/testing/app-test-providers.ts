import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { routes } from '../app.routes';
import { GameDataService } from '../services/game-data.service';
import { TranslationService, type SupportedLanguage } from '../services/translation.service';

const testTranslations: Record<string, string> = {
  'home.title': 'Grepo Hub',
  'language.openMenu': 'Choose language',
  'language.menuAria': 'Language selection',
  'language.english': 'English',
  'language.german': 'German',
  'language.englishCode': 'EN',
  'language.germanCode': 'DE',
};

class MockTranslationService {
  private readonly language = signal<SupportedLanguage>('en');
  readonly currentLanguage = this.language.asReadonly();

  translate(key: string, fallback?: string): string {
    return testTranslations[key] ?? fallback ?? key;
  }

  setLanguage(language: SupportedLanguage): void {
    this.language.set(language);
  }

  toggleLanguage(): void {
    this.setLanguage(this.language() === 'en' ? 'de' : 'en');
  }
}

export const appTestProviders = [
  provideRouter(routes),
  {
    provide: TranslationService,
    useClass: MockTranslationService,
  },
  {
    provide: GameDataService,
    useValue: {
      getUnitDefinitions: () => of([]),
      getBuildingDefinitions: () => of([]),
    },
  },
];
