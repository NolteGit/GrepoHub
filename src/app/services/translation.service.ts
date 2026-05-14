import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export type SupportedLanguage = 'en' | 'de';
export type TranslationParams = Record<string, string | number>;

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'grepo-hub-language';

  private readonly language = signal<SupportedLanguage>(this.getInitialLanguage());
  private readonly dictionary = signal<Record<string, string>>({});

  readonly currentLanguage = this.language.asReadonly();

  constructor() {
    this.loadLanguage(this.language());
  }

  translate(key: string, fallback?: string, params?: TranslationParams): string {
    const value = this.dictionary()[key] ?? fallback ?? key;

    return this.interpolate(value, params);
  }

  setLanguage(language: SupportedLanguage): void {
    this.language.set(language);
    localStorage.setItem(this.storageKey, language);
    this.loadLanguage(language);
  }

  toggleLanguage(): void {
    this.setLanguage(this.language() === 'en' ? 'de' : 'en');
  }

  private loadLanguage(language: SupportedLanguage): void {
    this.http
      .get<Record<string, string>>(`/assets/i18n/${language}.json`)
      .subscribe((dictionary) => {
        this.dictionary.set(dictionary);
      });
  }

  private interpolate(value: string, params?: TranslationParams): string {
    if (!params) {
      return value;
    }

    return Object.entries(params).reduce((text, [name, replacement]) => {
      return text.replaceAll(`{${name}}`, String(replacement));
    }, value);
  }

  private getInitialLanguage(): SupportedLanguage {
    const storedLanguage = localStorage.getItem(this.storageKey);

    return storedLanguage === 'de' || storedLanguage === 'en' ? storedLanguage : 'en';
  }
}
