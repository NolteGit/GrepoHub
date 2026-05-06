import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityPlanner } from './city-planner';

describe('CityPlanner', () => {
  let component: CityPlanner;
  let fixture: ComponentFixture<CityPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityPlanner],
    }).compileComponents();

    fixture = TestBed.createComponent(CityPlanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
