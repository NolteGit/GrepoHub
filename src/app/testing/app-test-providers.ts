import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { routes } from '../app.routes';
import { GameDataService } from '../services/game-data.service';
import { getNextSupportedLanguage } from '../services/supported-languages';
import { TranslationService, type SupportedLanguage } from '../services/translation.service';

const testTranslations: Record<string, string> = {
  'home.title': 'Grepo Hub',
  'language.openMenu': 'Choose language',
  'language.menuAria': 'Language selection',
  'language.english': 'English',
  'language.german': 'German',
  'language.french': 'French',
  'language.dutch': 'Dutch',
  'language.italian': 'Italian',
  'language.spanish': 'Spanish',
  'language.englishCode': 'EN',
  'language.germanCode': 'DE',
  'language.frenchCode': 'FR',
  'language.dutchCode': 'NL',
  'language.italianCode': 'IT',
  'language.spanishCode': 'ES',
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
    this.setLanguage(getNextSupportedLanguage(this.language()));
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
