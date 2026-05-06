import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTools } from './time-tools';

describe('TimeTools', () => {
  let component: TimeTools;
  let fixture: ComponentFixture<TimeTools>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeTools],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeTools);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
