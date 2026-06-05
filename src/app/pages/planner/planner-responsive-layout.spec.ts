import { getEffectiveToolboxCollapsed } from './planner-responsive-layout';

describe('planner responsive layout', () => {
  it('keeps the toolbox expanded on roomy desktop when the user did not collapse it', () => {
    expect(getEffectiveToolboxCollapsed(false, false)).toBe(false);
  });

  it('keeps the toolbox collapsed when the user collapsed it on desktop', () => {
    expect(getEffectiveToolboxCollapsed(true, false)).toBe(true);
  });

  it('forces the toolbox into collapsed rail mode on compact layouts', () => {
    expect(getEffectiveToolboxCollapsed(false, true)).toBe(true);
  });
});
