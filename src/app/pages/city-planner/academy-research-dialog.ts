import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AcademyResearchId, academyResearchLevelGroups } from '../../data/academy-research-presets';
import { getAcademyResearchIconPath } from '../../data/asset-paths';
import { TranslatePipe } from '../../pipes/translate.pipe';
import {
  AcademyResearchCalculationResult,
  calculateAcademyResearchPlan,
} from '../../services/academy-research-calculator';

@Component({
  selector: 'app-academy-research-dialog',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './academy-research-dialog.html',
  styleUrl: './academy-research-dialog.scss',
})
export class AcademyResearchDialogComponent {
  @Input({ required: true }) academyLevel = 0;
  @Output() readonly closeDialog = new EventEmitter<void>();

  protected readonly academyResearchLevelGroups = academyResearchLevelGroups;
  protected readonly getAcademyResearchIconPath = getAcademyResearchIconPath;
  protected readonly selectedAcademyResearchIds = signal<readonly AcademyResearchId[]>([]);
  protected readonly libraryBuilt = signal(false);
  protected readonly selectedAcademyResearchIdSet = computed(() => {
    return new Set(this.selectedAcademyResearchIds());
  });

  protected get calculation(): AcademyResearchCalculationResult {
    return calculateAcademyResearchPlan({
      academyLevel: this.academyLevel,
      selectedResearchIds: this.selectedAcademyResearchIds(),
      libraryBuilt: this.libraryBuilt(),
    });
  }

  protected close(): void {
    this.closeDialog.emit();
  }

  protected toggleResearch(researchId: AcademyResearchId): void {
    const selectedIds = this.selectedAcademyResearchIds();

    this.selectedAcademyResearchIds.set(
      selectedIds.includes(researchId)
        ? selectedIds.filter((selectedId) => selectedId !== researchId)
        : [...selectedIds, researchId],
    );
  }

  protected setLibraryBuilt(checked: boolean): void {
    this.libraryBuilt.set(checked);
  }

  protected clearSelection(): void {
    this.selectedAcademyResearchIds.set([]);
    this.libraryBuilt.set(false);
  }
}
