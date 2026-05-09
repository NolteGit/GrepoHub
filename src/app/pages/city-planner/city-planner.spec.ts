import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appTestProviders } from '../../testing/app-test-providers';
import { CityPlanner } from './city-planner';

describe('CityPlanner', () => {
  let component: CityPlanner;
  let fixture: ComponentFixture<CityPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityPlanner],
      providers: [...appTestProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(CityPlanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
