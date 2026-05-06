import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattleSimulator } from './battle-simulator';

describe('BattleSimulator', () => {
  let component: BattleSimulator;
  let fixture: ComponentFixture<BattleSimulator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleSimulator],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleSimulator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
