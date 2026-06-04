import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import type { PlanConfig } from '../../../../models/plan-config.model';
import type { TranslationParams } from '../../../../services/translation.service';
import { TranslationService } from '../../../../services/translation.service';

import { PlannerHeader } from './planner-header';

class MockTranslationService {
  translate(key: string, fallback?: string, params?: TranslationParams): string {
    const value = fallback ?? key;

    if (!params) {
      return value;
    }

    return Object.entries(params).reduce(
      (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
      value,
    );
  }
}

const createPlan = (id: string, name: string): PlanConfig =>
  ({
    id,
    name,
  }) as PlanConfig;

function getMoreMenu(fixture: ComponentFixture<PlannerHeader>): HTMLDetailsElement {
  const menu = fixture.nativeElement.querySelector('details');

  if (!(menu instanceof HTMLDetailsElement)) {
    throw new Error('Expected planner header more menu to render.');
  }

  return menu;
}

function getMoreMenuSummary(menu: HTMLDetailsElement): HTMLElement {
  const summary = menu.querySelector('summary');

  if (!(summary instanceof HTMLElement)) {
    throw new Error('Expected planner header more menu summary to render.');
  }

  return summary;
}

describe('PlannerHeader accessibility behavior', () => {
  let fixture: ComponentFixture<PlannerHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannerHeader],
      providers: [
        {
          provide: TranslationService,
          useClass: MockTranslationService,
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createHeaderFixture(canDeletePlan = true): ComponentFixture<PlannerHeader> {
    const createdFixture = TestBed.createComponent(PlannerHeader);

    createdFixture.componentRef.setInput('plans', [createPlan('plan-a', 'Plan A')]);
    createdFixture.componentRef.setInput('activePlanId', 'plan-a');
    createdFixture.componentRef.setInput('canDeletePlan', canDeletePlan);
    createdFixture.detectChanges();

    fixture = createdFixture;

    return createdFixture;
  }

  it('provides accessible names for primary header actions', () => {
    createHeaderFixture();

    const labelledControls = Array.from(
      fixture.nativeElement.querySelectorAll('[aria-label]') as NodeListOf<HTMLElement>,
    ).map((element) => element.getAttribute('aria-label'));

    expect(labelledControls).toContain('New plan');
    expect(labelledControls).toContain('Import plan');
    expect(labelledControls).toContain('Export plan');
    expect(labelledControls).toContain('Plan');
    expect(labelledControls).toContain('Edit plan');
  });

  it('closes the more menu with Escape and restores focus to the summary', () => {
    createHeaderFixture();

    const menu = getMoreMenu(fixture);
    const summary = getMoreMenuSummary(menu);
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    const preventDefault = vi.spyOn(escapeEvent, 'preventDefault');

    menu.open = true;
    fixture.detectChanges();

    menu.dispatchEvent(escapeEvent);
    fixture.detectChanges();

    expect(preventDefault).toHaveBeenCalled();
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });

  it('keeps the delete action disabled when the active plan cannot be deleted', () => {
    createHeaderFixture(false);

    const menu = getMoreMenu(fixture);

    menu.open = true;
    fixture.detectChanges();

    const deleteButton = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Delete'));

    expect(deleteButton).toBeDefined();
    expect(deleteButton?.disabled).toBe(true);
  });
});
