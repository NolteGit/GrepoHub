import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import {
  ReferenceDocument,
  ReferenceDocumentBlock,
  ReferenceDocumentSection,
  ReferenceDocumentTag,
  ReferenceLibraryIndexDocument,
  ReferenceQuickLink,
  referenceQuickLinks,
} from '../../data/reference-documents';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AppIconComponent } from '../../shared/app-icon/app-icon';
import { TranslationService } from '../../services/translation.service';

type LibraryStatus = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-references',
  imports: [AppIconComponent, TranslatePipe],
  templateUrl: './references.html',
  styleUrl: './references.scss',
})
export class References implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly translationService = inject(TranslationService);

  protected readonly quickLinks = referenceQuickLinks;
  protected readonly documents = signal<ReferenceDocument[]>([]);
  protected readonly libraryStatus = signal<LibraryStatus>('loading');
  protected readonly searchTerm = signal('');
  protected readonly selectedTag = signal<ReferenceDocumentTag | 'all'>('all');
  protected readonly selectedDocumentId = signal<string | null>(null);
  protected readonly selectedSectionId = signal<string | null>(null);
  protected readonly expandedSectionIds = signal<ReadonlySet<string>>(new Set());
  protected readonly unlockedDocumentIds = signal<ReadonlySet<string>>(new Set());
  protected readonly accessCodeDialogDocumentId = signal<string | null>(null);
  protected readonly accessCodeInput = signal('');
  protected readonly accessCodeError = signal('');

  protected readonly tagFilters: {
    labelKey: string;
    fallback: string;
    value: ReferenceDocumentTag | 'all';
  }[] = [
    { labelKey: 'references.tagFilter.all', fallback: 'All', value: 'all' },
    { labelKey: 'references.tagFilter.advanced', fallback: 'Advanced', value: 'advanced' },
    { labelKey: 'references.tagFilter.bela', fallback: 'Bela', value: 'bela' },
    { labelKey: 'references.tagFilter.revo', fallback: 'Revo', value: 'revo' },
  ];

  protected readonly filteredDocuments = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const selectedTag = this.selectedTag();

    return this.documents().filter((document) => {
      const matchesTag = selectedTag === 'all' || document.tags.includes(selectedTag);
      const searchableText = [
        this.documentTitle(document),
        this.documentDescription(document),
        this.documentAbstract(document),
        ...document.tags.map((tag) => this.tagLabel(tag)),
        ...document.sections.map(
          (section) =>
            `${this.sectionTitle(document, section.id, section.title)} ${this.sectionSummary(document, section.id, section.summary)}`,
        ),
      ]
        .join(' ')
        .toLowerCase();

      return matchesTag && (!searchTerm || searchableText.includes(searchTerm));
    });
  });

  protected readonly selectedDocument = computed(() => {
    const documentId = this.selectedDocumentId();

    if (!documentId) {
      return null;
    }

    return this.documents().find((document) => document.id === documentId) ?? null;
  });

  protected readonly isLibraryMode = computed(() => this.selectedDocument() === null);

  protected readonly accessCodeDialogDocument = computed(() => {
    const documentId = this.accessCodeDialogDocumentId();

    if (!documentId) {
      return null;
    }

    return this.documents().find((document) => document.id === documentId) ?? null;
  });

  ngOnInit(): void {
    this.loadLibrary();
  }

  protected quickLinkUrl(link: ReferenceQuickLink): string {
    const language = this.translationService.currentLanguage();

    if (language === 'de') {
      return link.urlDe ?? link.url ?? link.urlEn ?? '#';
    }

    return link.urlEn ?? link.url ?? link.urlDe ?? '#';
  }

  protected requestDocument(document: ReferenceDocument): void {
    if (this.requiresAccessCode(document)) {
      this.openAccessCodeDialog(document);
      return;
    }

    this.selectDocument(document);
  }

  private selectDocument(document: ReferenceDocument): void {
    const firstSectionId = document.sections[0]?.id ?? null;

    this.selectedDocumentId.set(document.id);
    this.selectedSectionId.set(firstSectionId);
    this.expandedSectionIds.set(firstSectionId ? new Set([firstSectionId]) : new Set());
    this.scrollDocumentReaderToTop();
  }

  protected updateAccessCodeInput(event: Event): void {
    this.accessCodeInput.set((event.target as HTMLInputElement).value);

    if (this.accessCodeError()) {
      this.accessCodeError.set('');
    }
  }

  protected closeAccessCodeDialog(): void {
    this.accessCodeDialogDocumentId.set(null);
    this.accessCodeInput.set('');
    this.accessCodeError.set('');
  }

  protected submitAccessCode(event: Event): void {
    event.preventDefault();

    const document = this.accessCodeDialogDocument();

    if (!document) {
      this.closeAccessCodeDialog();
      return;
    }

    if (this.accessCodeInput() !== document.accessCode) {
      this.accessCodeError.set(
        this.translationService.translate('references.accessCode.wrong', 'Wrong access code.'),
      );
      return;
    }

    this.unlockDocument(document);
  }

  protected selectSection(document: ReferenceDocument, sectionId: string): void {
    if (this.requiresAccessCode(document)) {
      this.openAccessCodeDialog(document);
      return;
    }

    const expandedSectionIds = new Set(this.expandedSectionIds());

    expandedSectionIds.add(sectionId);
    this.selectedDocumentId.set(document.id);
    this.selectedSectionId.set(sectionId);
    this.expandedSectionIds.set(expandedSectionIds);
    this.scrollToSection(sectionId);
  }

  protected showLibrary(): void {
    this.selectedDocumentId.set(null);
    this.selectedSectionId.set(null);
    this.expandedSectionIds.set(new Set());
  }

  protected updateSearchTerm(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected selectTag(value: ReferenceDocumentTag | 'all'): void {
    this.selectedTag.set(value);
    this.showLibrary();
  }

  protected documentTitle(document: ReferenceDocument): string {
    return this.translateDocument(document.id, 'title', document.title);
  }

  protected documentDescription(document: ReferenceDocument): string {
    return this.translateDocument(document.id, 'description', document.description);
  }

  protected documentAbstract(document: ReferenceDocument): string {
    return this.translateDocument(document.id, 'abstract', document.abstract);
  }

  protected tagLabel(tag: ReferenceDocumentTag): string {
    const fallbacks: Record<ReferenceDocumentTag, string> = {
      advanced: 'Advanced',
      bela: 'Bela',
      revo: 'Revo',
    };

    return this.translationService.translate(`references.tags.${tag}`, fallbacks[tag]);
  }

  protected languageLabel(language: string): string {
    return language.trim().toUpperCase();
  }

  protected isDocumentUnlocked(document: ReferenceDocument): boolean {
    return !this.requiresAccessCode(document);
  }

  protected sectionTitle(document: ReferenceDocument, sectionId: string, fallback: string): string {
    return this.translationService.translate(
      `references.documents.${document.id}.sections.${sectionId}.title`,
      fallback,
    );
  }

  protected sectionSummary(
    document: ReferenceDocument,
    sectionId: string,
    fallback: string,
  ): string {
    return this.translationService.translate(
      `references.documents.${document.id}.sections.${sectionId}.summary`,
      fallback,
    );
  }

  protected blockText(
    document: ReferenceDocument,
    sectionId: string,
    index: number,
    text: string,
  ): string {
    return this.translationService.translate(
      `references.documents.${document.id}.sections.${sectionId}.blocks.${index}.text`,
      text,
    );
  }

  protected blockTitle(
    document: ReferenceDocument,
    sectionId: string,
    index: number,
    fallback: string,
  ): string {
    return this.translationService.translate(
      `references.documents.${document.id}.sections.${sectionId}.blocks.${index}.title`,
      fallback,
    );
  }

  protected listItemText(
    document: ReferenceDocument,
    sectionId: string,
    blockIndex: number,
    itemIndex: number,
    text: string,
  ): string {
    return this.translationService.translate(
      `references.documents.${document.id}.sections.${sectionId}.blocks.${blockIndex}.items.${itemIndex}`,
      text,
    );
  }

  protected linkLabel(
    document: ReferenceDocument,
    sectionId: string,
    blockIndex: number,
    linkIndex: number,
    label: string,
  ): string {
    return this.translationService.translate(
      `references.documents.${document.id}.sections.${sectionId}.blocks.${blockIndex}.links.${linkIndex}.label`,
      label,
    );
  }

  protected linkNote(
    document: ReferenceDocument,
    sectionId: string,
    blockIndex: number,
    linkIndex: number,
    note: string,
  ): string {
    return this.translationService.translate(
      `references.documents.${document.id}.sections.${sectionId}.blocks.${blockIndex}.links.${linkIndex}.note`,
      note,
    );
  }

  protected isSelectedDocument(document: ReferenceDocument): boolean {
    return this.selectedDocumentId() === document.id;
  }

  protected isSelectedSection(document: ReferenceDocument, sectionId: string): boolean {
    return this.selectedDocumentId() === document.id && this.selectedSectionId() === sectionId;
  }

  protected isSectionExpanded(sectionId: string): boolean {
    return this.expandedSectionIds().has(sectionId);
  }

  protected toggleSection(sectionId: string): void {
    const expandedSectionIds = new Set(this.expandedSectionIds());

    if (expandedSectionIds.has(sectionId)) {
      expandedSectionIds.delete(sectionId);
    } else {
      expandedSectionIds.add(sectionId);
      this.selectedSectionId.set(sectionId);
    }

    this.expandedSectionIds.set(expandedSectionIds);
  }

  protected sectionChevronIcon(sectionId: string): 'chevron-down' | 'chevron-right' {
    return this.isSectionExpanded(sectionId) ? 'chevron-down' : 'chevron-right';
  }

  protected contentsTargetSection(
    document: ReferenceDocument,
    section: ReferenceDocumentSection,
    item: string,
  ): ReferenceDocumentSection | null {
    if (!this.isContentsSection(section)) {
      return null;
    }

    const normalizedItem = this.normalizeTocLabel(item);

    return (
      document.sections.find(
        (documentSection) =>
          documentSection.id !== section.id &&
          this.normalizeTocLabel(documentSection.title) === normalizedItem,
      ) ?? null
    );
  }

  private isContentsSection(section: ReferenceDocumentSection): boolean {
    const normalizedTitle = this.normalizeTocLabel(section.title);

    return (
      normalizedTitle === 'inhaltsverzeichnis' ||
      normalizedTitle === 'contents' ||
      normalizedTitle === 'table of contents'
    );
  }

  private requiresAccessCode(document: ReferenceDocument): boolean {
    return Boolean(document.locked && !this.unlockedDocumentIds().has(document.id));
  }

  private openAccessCodeDialog(document: ReferenceDocument): void {
    this.accessCodeDialogDocumentId.set(document.id);
    this.accessCodeInput.set('');
    this.accessCodeError.set('');
  }

  protected scrollToDocumentTop(): void {
    this.scrollDocumentReaderToTop();
  }

  private scrollToSection(sectionId: string): void {
    window.setTimeout(() => {
      globalThis.document
        .getElementById(`document-section-${sectionId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private scrollDocumentReaderToTop(): void {
    window.setTimeout(() => {
      globalThis.document
        .querySelector<HTMLElement>('.library-main')
        ?.scrollTo({ top: 0, behavior: 'smooth' });
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  private loadLibrary(): void {
    this.libraryStatus.set('loading');

    this.http
      .get<ReferenceLibraryIndexDocument[]>('library/index.json')
      .pipe(
        switchMap((entries) => {
          if (entries.length === 0) {
            return of([]);
          }

          return forkJoin(
            entries.map((entry) =>
              entry.locked ? of(this.createLockedDocument(entry)) : this.loadDocument(entry),
            ),
          );
        }),
        catchError(() => {
          this.libraryStatus.set('error');
          return of([]);
        }),
      )
      .subscribe((documents) => {
        this.documents.set(documents);

        if (this.libraryStatus() !== 'error') {
          this.libraryStatus.set('ready');
        }
      });
  }

  private loadDocument(entry: ReferenceLibraryIndexDocument) {
    return this.http.get(`library/${entry.file}`, { responseType: 'text' }).pipe(
      map((content) => this.parseMarkdownDocument(entry, content)),
      catchError(() => of(this.createEmptyDocument(entry))),
    );
  }

  private unlockDocument(document: ReferenceDocument): void {
    const unlockedDocumentIds = new Set(this.unlockedDocumentIds());

    unlockedDocumentIds.add(document.id);
    this.unlockedDocumentIds.set(unlockedDocumentIds);
    this.closeAccessCodeDialog();

    if (document.contentLoaded) {
      this.selectDocument(document);
      return;
    }

    this.loadDocument(this.toIndexDocument(document)).subscribe((loadedDocument) => {
      this.documents.update((documents) =>
        documents.map((currentDocument) =>
          currentDocument.id === loadedDocument.id ? loadedDocument : currentDocument,
        ),
      );
      this.selectDocument(loadedDocument);
    });
  }

  private toIndexDocument(document: ReferenceDocument): ReferenceLibraryIndexDocument {
    return {
      id: document.id,
      title: document.title,
      description: document.description,
      abstract: document.abstract,
      file: document.file,
      tags: document.tags,
      author: document.author,
      date: document.date,
      language: document.language,
      locked: document.locked,
      accessCode: document.accessCode,
    };
  }

  private parseMarkdownDocument(
    entry: ReferenceLibraryIndexDocument,
    markdown: string,
  ): ReferenceDocument {
    const sections: ReferenceDocumentSection[] = [];
    let currentSection: ReferenceDocumentSection | null = null;
    let paragraphLines: string[] = [];
    let listItems: string[] = [];

    const pushBlock = (block: ReferenceDocumentBlock): void => {
      if (!currentSection) {
        currentSection = this.createSection('overview', 'Overview');
        sections.push(currentSection);
      }

      currentSection.blocks.push(block);
    };

    const flushList = (): void => {
      if (listItems.length > 0) {
        pushBlock({ type: 'list', items: listItems });
        listItems = [];
      }
    };

    const flushParagraph = (): void => {
      const text = this.cleanMarkdownText(paragraphLines.join(' '));
      paragraphLines = [];

      if (!text) {
        return;
      }

      const note = this.parseNoteText(text);

      if (note) {
        pushBlock(note);
        return;
      }

      pushBlock({ type: 'paragraph', text });
    };

    for (const rawLine of markdown.replace(/\r\n?/g, '\n').split('\n')) {
      const line = rawLine.trim();

      if (!line || line === '---') {
        flushList();
        flushParagraph();
        continue;
      }

      const heading = /^(#{1,6})\s+(.+)$/.exec(line);

      if (heading) {
        flushList();
        flushParagraph();

        const level = heading[1].length;
        const title = this.cleanMarkdownText(heading[2]);

        if (level === 1) {
          continue;
        }

        if (level === 2) {
          currentSection = this.createSection(this.slugKey(title), title);
          sections.push(currentSection);
          continue;
        }

        pushBlock({ type: 'heading', level: level === 3 ? 3 : 4, text: title });
        continue;
      }

      const listItem = /^(?:[-*]|\d+\.)\s+(.+)$/.exec(line);

      if (listItem) {
        flushParagraph();
        listItems.push(this.cleanMarkdownText(listItem[1]));
        continue;
      }

      flushList();
      paragraphLines.push(line);
    }

    flushList();
    flushParagraph();

    return {
      id: entry.id,
      title: entry.title,
      description: entry.description,
      abstract: entry.abstract,
      file: entry.file,
      author: entry.author,
      date: entry.date,
      language: entry.language,
      tags: entry.tags,
      locked: entry.locked,
      accessCode: entry.accessCode,
      contentLoaded: true,
      sections:
        sections.length > 0
          ? sections.map((section) => this.withSummary(section))
          : [this.createEmptySection()],
    };
  }

  private createSection(id: string, title: string): ReferenceDocumentSection {
    return {
      id,
      title,
      summary: '',
      blocks: [],
    };
  }

  private withSummary(section: ReferenceDocumentSection): ReferenceDocumentSection {
    const firstTextBlock = section.blocks.find(
      (block) => block.type === 'paragraph' || block.type === 'note' || block.type === 'list',
    );
    let summary = '';

    if (firstTextBlock?.type === 'paragraph' || firstTextBlock?.type === 'note') {
      summary = firstTextBlock.text;
    } else if (firstTextBlock?.type === 'list') {
      summary = firstTextBlock.items[0] ?? '';
    }

    return {
      ...section,
      summary: this.shortenText(summary, 180),
    };
  }

  private createLockedDocument(entry: ReferenceLibraryIndexDocument): ReferenceDocument {
    return {
      id: entry.id,
      title: entry.title,
      description: entry.description,
      abstract: entry.abstract,
      file: entry.file,
      author: entry.author,
      date: entry.date,
      language: entry.language,
      tags: entry.tags,
      locked: entry.locked,
      accessCode: entry.accessCode,
      contentLoaded: false,
      sections: [],
    };
  }

  private createEmptyDocument(entry: ReferenceLibraryIndexDocument): ReferenceDocument {
    return {
      id: entry.id,
      title: entry.title,
      description: entry.description,
      abstract: entry.abstract,
      file: entry.file,
      author: entry.author,
      date: entry.date,
      language: entry.language,
      tags: entry.tags,
      locked: entry.locked,
      accessCode: entry.accessCode,
      contentLoaded: true,
      sections: [this.createEmptySection()],
    };
  }

  private createEmptySection(): ReferenceDocumentSection {
    return {
      id: 'overview',
      title: 'Overview',
      summary: 'No readable document content was found yet.',
      blocks: [
        {
          type: 'note',
          title: 'Missing content',
          text: 'The library entry exists, but the Markdown file could not be loaded.',
        },
      ],
    };
  }

  private parseNoteText(text: string): Extract<ReferenceDocumentBlock, { type: 'note' }> | null {
    const match = /^(Merksatz|Fazit):\s*(.+)$/i.exec(text);

    if (!match) {
      return null;
    }

    return {
      type: 'note',
      title: match[1],
      text: match[2],
    };
  }

  private normalizeTocLabel(value: string): string {
    return this.cleanMarkdownText(value)
      .toLowerCase()
      .replace(/^\d+(?:\.\d+)*\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanMarkdownText(value: string): string {
    return value
      .replace(/^_([^_]+)_$/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1 ($2)')
      .replace(/^>\s?/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private shortenText(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength).trim()}…`;
  }

  private translateDocument(documentId: string, field: string, fallback: string): string {
    return this.translationService.translate(
      `references.documents.${documentId}.${field}`,
      fallback,
    );
  }

  private slugKey(value: string): string {
    return value
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
