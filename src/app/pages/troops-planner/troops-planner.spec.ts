import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appTestProviders } from '../../testing/app-test-providers';
import { TroopsPlanner } from './troops-planner';

describe('TroopsPlanner', () => {
  let component: TroopsPlanner;
  let fixture: ComponentFixture<TroopsPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TroopsPlanner],
      providers: [...appTestProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(TroopsPlanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});