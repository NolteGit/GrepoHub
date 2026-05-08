import { Component, computed, inject, signal } from '@angular/core';

import {
  ReferenceQuickLink,
  ReferenceResource,
  ReferenceResourceType,
  referenceQuickLinks,
  referenceResources,
} from '../../data/reference-resources';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-references',
  imports: [],
  templateUrl: './references.html',
  styleUrl: './references.scss',
})
export class References {
  private readonly translationService = inject(TranslationService);

  protected readonly quickLinks = referenceQuickLinks;
  protected readonly resources = referenceResources;
  protected readonly searchTerm = signal('');
  protected readonly selectedType = signal<ReferenceResourceType | 'all'>('all');
  protected readonly selectedResourceId = signal<string | null>(null);
  protected readonly selectedSectionId = signal<string | null>(null);

  protected readonly typeFilters: { label: string; value: ReferenceResourceType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Tools', value: 'tool-guide' },
    { label: 'Guides', value: 'guide' },
    { label: 'Documents', value: 'reference-document' },
    { label: 'Links', value: 'external-link' },
  ];

  protected readonly filteredResources = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const selectedType = this.selectedType();

    return this.resources.filter((resource) => {
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const searchableText = [
        resource.title,
        resource.category,
        resource.description,
        ...resource.tags,
        ...resource.sections.map((section) => `${section.title} ${section.summary}`),
      ]
        .join(' ')
        .toLowerCase();

      return matchesType && (!searchTerm || searchableText.includes(searchTerm));
    });
  });

  protected readonly selectedResource = computed(() => {
    const resourceId = this.selectedResourceId();

    if (!resourceId) {
      return null;
    }

    return this.resources.find((resource) => resource.id === resourceId) ?? null;
  });

  protected readonly selectedSection = computed(() => {
    const sectionId = this.selectedSectionId();
    const resource = this.selectedResource();

    if (!sectionId || !resource) {
      return null;
    }

    return resource.sections.find((section) => section.id === sectionId) ?? null;
  });

  protected readonly isOverviewMode = computed(() => this.selectedResource() === null);

  protected quickLinkUrl(link: ReferenceQuickLink): string {
    const language = this.translationService.currentLanguage();

    if (language === 'de') {
      return link.urlDe ?? link.url ?? link.urlEn ?? '#';
    }

    return link.urlEn ?? link.url ?? link.urlDe ?? '#';
  }

  protected selectResource(resource: ReferenceResource): void {
    this.selectedResourceId.set(resource.id);
    this.selectedSectionId.set(null);
  }

  protected selectSection(resource: ReferenceResource, sectionId: string): void {
    this.selectedResourceId.set(resource.id);
    this.selectedSectionId.set(sectionId);
  }

  protected showOverview(): void {
    this.selectedResourceId.set(null);
    this.selectedSectionId.set(null);
  }

  protected updateSearchTerm(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected selectType(value: ReferenceResourceType | 'all'): void {
    this.selectedType.set(value);
    this.showOverview();
  }

  protected typeLabel(type: ReferenceResourceType): string {
    const labels: Record<ReferenceResourceType, string> = {
      'tool-guide': 'Tool guide',
      guide: 'Guide',
      'reference-document': 'Document',
      'external-link': 'External link',
    };

    return labels[type];
  }

  protected isSelectedResource(resource: ReferenceResource): boolean {
    return this.selectedResourceId() === resource.id;
  }

  protected isSelectedSection(resource: ReferenceResource, sectionId: string): boolean {
    return this.selectedResourceId() === resource.id && this.selectedSectionId() === sectionId;
  }
}