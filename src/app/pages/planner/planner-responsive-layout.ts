export const compactToolboxMediaQuery = '(max-width: 76rem)';

export function getEffectiveToolboxCollapsed(
  userCollapsed: boolean,
  compactLayout: boolean,
): boolean {
  return userCollapsed || compactLayout;
}
