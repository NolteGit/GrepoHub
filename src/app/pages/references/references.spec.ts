import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appTestProviders } from '../../testing/app-test-providers';
import { References } from './references';

describe('References', () => {
  let component: References;
  let fixture: ComponentFixture<References>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [References],
      providers: [...appTestProviders, provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(References);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
