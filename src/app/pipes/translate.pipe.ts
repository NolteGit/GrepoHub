import { Pipe, PipeTransform, inject } from '@angular/core';

import { TranslationParams, TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: string, fallback?: string, params?: TranslationParams): string {
    return this.translationService.translate(key, fallback, params);
  }
}
