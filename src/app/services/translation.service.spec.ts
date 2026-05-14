import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let http: HttpTestingController;

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('loads English by default and falls back to the key when a translation is missing', () => {
    createService();

    expect(service.currentLanguage()).toBe('en');

    http.expectOne('/assets/i18n/en.json').flush({
      'nav.home': 'Home',
    });

    expect(service.translate('nav.home')).toBe('Home');
    expect(service.translate('missing.key')).toBe('missing.key');
    expect(service.translate('missing.key', 'Fallback')).toBe('Fallback');
  });

  it('interpolates translation parameters in dictionary and fallback values', () => {
    createService();

    http.expectOne('/assets/i18n/en.json').flush({
      greeting: 'Hello {name}',
    });

    expect(service.translate('greeting', undefined, { name: 'Alex' })).toBe('Hello Alex');
    expect(service.translate('missing.key', 'Fallback {count}', { count: 3 })).toBe('Fallback 3');
  });

  it('restores the stored language when it is supported', () => {
    localStorage.setItem('grepo-hub-language', 'fr');
    createService();

    expect(service.currentLanguage()).toBe('fr');

    http.expectOne('/assets/i18n/fr.json').flush({
      'nav.home': 'Accueil',
    });

    expect(service.translate('nav.home')).toBe('Accueil');
  });

  it('persists explicit language changes and reloads the dictionary', () => {
    createService();
    http.expectOne('/assets/i18n/en.json').flush({});

    service.setLanguage('de');

    expect(service.currentLanguage()).toBe('de');
    expect(localStorage.getItem('grepo-hub-language')).toBe('de');

    http.expectOne('/assets/i18n/de.json').flush({
      'nav.toolbox': 'Werkzeuge',
    });

    expect(service.translate('nav.toolbox')).toBe('Werkzeuge');
  });

  it('cycles through supported languages', () => {
    createService();
    http.expectOne('/assets/i18n/en.json').flush({});

    service.toggleLanguage();

    expect(service.currentLanguage()).toBe('de');
    http.expectOne('/assets/i18n/de.json').flush({});

    service.toggleLanguage();

    expect(service.currentLanguage()).toBe('fr');
    http.expectOne('/assets/i18n/fr.json').flush({});

    service.toggleLanguage();

    expect(service.currentLanguage()).toBe('nl');
    http.expectOne('/assets/i18n/nl.json').flush({});

    service.toggleLanguage();

    expect(service.currentLanguage()).toBe('it');
    http.expectOne('/assets/i18n/it.json').flush({});

    service.toggleLanguage();

    expect(service.currentLanguage()).toBe('en');
    http.expectOne('/assets/i18n/en.json').flush({});
  });

  it('falls back to English dictionaries when a pending language file is missing', () => {
    createService();
    http.expectOne('/assets/i18n/en.json').flush({});

    service.setLanguage('fr');

    expect(service.currentLanguage()).toBe('fr');
    expect(localStorage.getItem('grepo-hub-language')).toBe('fr');

    http.expectOne('/assets/i18n/fr.json').flush('Missing', {
      status: 404,
      statusText: 'Not Found',
    });
    http.expectOne('/assets/i18n/en.json').flush({
      'nav.home': 'Home',
    });

    expect(service.translate('nav.home')).toBe('Home');
  });

  function createService(): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TranslationService);
    http = TestBed.inject(HttpTestingController);
  }
});
