import { Component, computed, inject, signal } from '@angular/core';

import {
  ReferenceQuickLink,
  ReferenceResource,
  ReferenceResourceType,
  referenceQuickLinks,
  referenceResources,
} from '../../data/reference-resources';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-references',
  imports: [TranslatePipe],
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

  protected readonly typeFilters: { labelKey: string; value: ReferenceResourceType | 'all' }[] = [
    { labelKey: 'references.typeFilter.all', value: 'all' },
    { labelKey: 'references.typeFilter.tools', value: 'tool-guide' },
    { labelKey: 'references.typeFilter.guides', value: 'guide' },
    { labelKey: 'references.typeFilter.documents', value: 'reference-document' },
    { labelKey: 'references.typeFilter.links', value: 'external-link' },
  ];

  protected readonly filteredResources = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const selectedType = this.selectedType();

    return this.resources.filter((resource) => {
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const searchableText = [
        this.resourceTitle(resource),
        this.resourceCategory(resource),
        this.resourceDescription(resource),
        ...resource.tags.map((tag) => this.resourceTag(resource, tag)),
        ...resource.sections.map(
          (section) =>
            `${this.sectionTitle(resource, section.id, section.title)} ${this.sectionSummary(resource, section.id, section.summary)}`,
        ),
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

  protected typeLabelKey(type: ReferenceResourceType): string {
    const labels: Record<ReferenceResourceType, string> = {
      'tool-guide': 'references.type.toolGuide',
      guide: 'references.type.guide',
      'reference-document': 'references.type.document',
      'external-link': 'references.type.externalLink',
    };

    return labels[type];
  }

  protected resourceTitle(resource: ReferenceResource): string {
    return this.translateResource(resource.id, 'title', resource.title);
  }

  protected resourceCategory(resource: ReferenceResource): string {
    return this.translateResource(resource.id, 'category', resource.category);
  }

  protected resourceDescription(resource: ReferenceResource): string {
    return this.translateResource(resource.id, 'description', resource.description);
  }

  protected resourceTag(resource: ReferenceResource, tag: string): string {
    return this.translationService.translate(
      `references.resources.${resource.id}.tags.${this.slugKey(tag)}`,
      tag,
    );
  }

  protected sectionTitle(resource: ReferenceResource, sectionId: string, fallback: string): string {
    return this.translationService.translate(
      `references.resources.${resource.id}.sections.${sectionId}.title`,
      fallback,
    );
  }

  protected sectionSummary(
    resource: ReferenceResource,
    sectionId: string,
    fallback: string,
  ): string {
    return this.translationService.translate(
      `references.resources.${resource.id}.sections.${sectionId}.summary`,
      fallback,
    );
  }

  protected scriptTitle(resource: ReferenceResource, scriptId: string, fallback: string): string {
    return this.translationService.translate(
      `references.resources.${resource.id}.scripts.${scriptId}.title`,
      fallback,
    );
  }

  protected scriptDescription(
    resource: ReferenceResource,
    scriptId: string,
    fallback: string,
  ): string {
    return this.translationService.translate(
      `references.resources.${resource.id}.scripts.${scriptId}.description`,
      fallback,
    );
  }

  protected isSelectedResource(resource: ReferenceResource): boolean {
    return this.selectedResourceId() === resource.id;
  }

  protected isSelectedSection(resource: ReferenceResource, sectionId: string): boolean {
    return this.selectedResourceId() === resource.id && this.selectedSectionId() === sectionId;
  }

  private translateResource(resourceId: string, field: string, fallback: string): string {
    return this.translationService.translate(
      `references.resources.${resourceId}.${field}`,
      fallback,
    );
  }

  private slugKey(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
