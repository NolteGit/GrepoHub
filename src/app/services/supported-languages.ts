export const supportedLanguageCodes = ['en', 'de', 'fr', 'nl', 'it', 'es'] as const;

export type SupportedLanguage = (typeof supportedLanguageCodes)[number];

export type LanguageOption = {
  code: SupportedLanguage;
  labelKey: string;
  shortLabelKey: string;
};

export const languageOptions: readonly LanguageOption[] = [
  {
    code: 'en',
    labelKey: 'language.english',
    shortLabelKey: 'language.englishCode',
  },
  {
    code: 'de',
    labelKey: 'language.german',
    shortLabelKey: 'language.germanCode',
  },
  {
    code: 'fr',
    labelKey: 'language.french',
    shortLabelKey: 'language.frenchCode',
  },
  {
    code: 'nl',
    labelKey: 'language.dutch',
    shortLabelKey: 'language.dutchCode',
  },
  {
    code: 'it',
    labelKey: 'language.italian',
    shortLabelKey: 'language.italianCode',
  },
  {
    code: 'es',
    labelKey: 'language.spanish',
    shortLabelKey: 'language.spanishCode',
  },
];

export function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return supportedLanguageCodes.includes(value as SupportedLanguage);
}

export function getNextSupportedLanguage(language: SupportedLanguage): SupportedLanguage {
  const currentIndex = supportedLanguageCodes.indexOf(language);
  const nextIndex = (currentIndex + 1) % supportedLanguageCodes.length;

  return supportedLanguageCodes[nextIndex];
}
