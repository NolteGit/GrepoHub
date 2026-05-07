import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export type SupportedLanguage = 'en' | 'de';

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

  translate(key: string): string {
    return this.dictionary()[key] ?? key;
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

  private getInitialLanguage(): SupportedLanguage {
    const storedLanguage = localStorage.getItem(this.storageKey);

    return storedLanguage === 'de' || storedLanguage === 'en' ? storedLanguage : 'en';
  }
}