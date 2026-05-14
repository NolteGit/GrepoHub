import { TranslationParams } from './translation.service';

export class TranslatableError extends Error {
  constructor(
    readonly translationKey: string,
    fallback: string,
    readonly params?: TranslationParams,
  ) {
    super(fallback);
    this.name = 'TranslatableError';
  }
}
