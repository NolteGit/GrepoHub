import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';

import { ReferenceQuickLink, referenceQuickLinks } from '../../data/reference-documents';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

export type CodexDocumentType = 'markdown' | 'pdf' | 'image' | 'docx' | 'file' | 'external';

type CodexStatus = 'loading' | 'ready' | 'error';
type CodexReaderStatus = 'idle' | 'loading' | 'ready' | 'error';

type CodexDocument = {
  id: string;
  title: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  category: string;
  categoryKey?: string;
  type: CodexDocumentType;
  path: string;
  tags?: string[];
  author?: string;
  updatedAt?: string;
  language?: string;
  note?: string;
  noteKey?: string;
};

type CodexManifest = {
  documents: CodexDocument[];
};

type MarkdownBlock =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; text: string };

@Component({
  selector: 'app-references',
  imports: [TranslatePipe],
  templateUrl: './references.html',
  styleUrl: './references.scss',
})
export class References implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly translationService = inject(TranslationService);

  protected readonly quickLinks = referenceQuickLinks;
  protected readonly documents = signal<CodexDocument[]>([]);
  protected readonly codexStatus = signal<CodexStatus>('loading');
  protected readonly readerStatus = signal<CodexReaderStatus>('idle');
  protected readonly markdownBlocks = signal<MarkdownBlock[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal('all');
  protected readonly selectedDocumentId = signal<string | null>(null);

  protected readonly categories = computed(() => {
    this.translationService.currentLanguage();

    return Array.from(new Set(this.documents().map((document) => document.category))).sort((a, b) =>
      this.categoryLabel(a).localeCompare(this.categoryLabel(b)),
    );
  });

  protected readonly filteredDocuments = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const selectedCategory = this.selectedCategory();

    this.translationService.currentLanguage();

    return this.documents().filter((document) => {
      const matchesCategory = selectedCategory === 'all' || document.category === selectedCategory;
      const searchableText = [
        this.documentTitle(document),
        this.documentDescription(document),
        this.documentCategory(document),
        document.type,
        document.author,
        document.language,
        ...(document.tags ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesCategory && (!searchTerm || searchableText.includes(searchTerm));
    });
  });

  protected readonly selectedDocument = computed(() => {
    const selectedDocumentId = this.selectedDocumentId();

    if (!selectedDocumentId) {
      return null;
    }

    return this.documents().find((document) => document.id === selectedDocumentId) ?? null;
  });

  protected readonly isReaderOpen = computed(() => this.selectedDocument() !== null);

  ngOnInit(): void {
    this.loadCodex();
  }

  protected quickLinkUrl(link: ReferenceQuickLink): string {
    const language = this.translationService.currentLanguage();

    if (language === 'de') {
      return link.urlDe ?? link.url ?? link.urlEn ?? '#';
    }

    return link.urlEn ?? link.url ?? link.urlDe ?? '#';
  }

  protected updateSearchTerm(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  protected openDocument(document: CodexDocument): void {
    this.selectedDocumentId.set(document.id);
    this.markdownBlocks.set([]);

    if (document.type !== 'markdown') {
      this.readerStatus.set('ready');
      return;
    }

    this.readerStatus.set('loading');

    this.http
      .get(document.path, { responseType: 'text' })
      .pipe(
        catchError(() => {
          this.readerStatus.set('error');
          return of('');
        }),
      )
      .subscribe((content) => {
        if (this.readerStatus() === 'error') {
          return;
        }

        this.markdownBlocks.set(this.parseMarkdown(content));
        this.readerStatus.set('ready');
      });
  }

  protected closeReader(): void {
    this.selectedDocumentId.set(null);
    this.readerStatus.set('idle');
    this.markdownBlocks.set([]);
  }

  protected documentTypeLabel(type: CodexDocumentType): string {
    const labels: Record<CodexDocumentType, string> = {
      markdown: 'MD',
      pdf: 'PDF',
      image: 'IMG',
      docx: 'DOCX',
      file: 'FILE',
      external: 'LINK',
    };

    return this.translationService.translate('references.documentType.' + type, labels[type]);
  }

  protected safePreviewUrl(document: CodexDocument): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(document.path);
  }

  protected isInlinePreview(document: CodexDocument): boolean {
    return document.type === 'markdown' || document.type === 'pdf' || document.type === 'image';
  }

  protected categoryLabel(category: string): string {
    return this.translationService.translate(
      'references.codex.category.' + this.toTranslationId(category),
      category,
    );
  }

  protected documentTitle(document: CodexDocument): string {
    return document.titleKey
      ? this.translationService.translate(document.titleKey, document.title)
      : document.title;
  }

  protected documentDescription(document: CodexDocument): string {
    return document.descriptionKey
      ? this.translationService.translate(document.descriptionKey, document.description)
      : document.description;
  }

  protected documentCategory(document: CodexDocument): string {
    return document.categoryKey
      ? this.translationService.translate(document.categoryKey, document.category)
      : this.categoryLabel(document.category);
  }

  protected documentNote(document: CodexDocument): string {
    return document.noteKey
      ? this.translationService.translate(document.noteKey, document.note ?? '')
      : (document.note ?? '');
  }

  protected trackByDocumentId(_: number, document: CodexDocument): string {
    return document.id;
  }

  private loadCodex(): void {
    this.codexStatus.set('loading');

    this.http
      .get<CodexManifest>('/codex/index.json')
      .pipe(
        catchError(() => {
          this.codexStatus.set('error');
          return of({ documents: [] });
        }),
      )
      .subscribe((manifest) => {
        this.documents.set(manifest.documents ?? []);

        if (this.codexStatus() !== 'error') {
          this.codexStatus.set('ready');
        }
      });
  }

  private toTranslationId(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private parseMarkdown(content: string): MarkdownBlock[] {
    const blocks: MarkdownBlock[] = [];
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    let paragraph: string[] = [];
    let listItems: string[] = [];
    let codeLines: string[] = [];
    let inCodeBlock = false;

    const flushParagraph = () => {
      if (paragraph.length === 0) {
        return;
      }

      blocks.push({ type: 'paragraph', text: paragraph.join(' ').trim() });
      paragraph = [];
    };

    const flushList = () => {
      if (listItems.length === 0) {
        return;
      }

      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    };

    const flushCode = () => {
      if (codeLines.length === 0) {
        return;
      }

      blocks.push({ type: 'code', text: codeLines.join('\n') });
      codeLines = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      if (line.trim().startsWith('```')) {
        flushParagraph();
        flushList();

        if (inCodeBlock) {
          flushCode();
        }

        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      if (!line.trim()) {
        flushParagraph();
        flushList();
        continue;
      }

      const headingMatch = /^(#{2,4})\s+(.+)$/.exec(line.trim());

      if (headingMatch) {
        flushParagraph();
        flushList();
        blocks.push({
          type: 'heading',
          level: headingMatch[1].length as 2 | 3 | 4,
          text: headingMatch[2],
        });
        continue;
      }

      const listMatch = /^[-*]\s+(.+)$/.exec(line.trim());

      if (listMatch) {
        flushParagraph();
        listItems.push(listMatch[1]);
        continue;
      }

      flushList();
      paragraph.push(line.trim());
    }

    flushParagraph();
    flushList();
    flushCode();

    return blocks;
  }
}
