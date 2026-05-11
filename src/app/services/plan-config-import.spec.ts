import { PLAN_CONFIG_FORMAT, PLAN_CONFIG_VERSION } from '../models/plan-config.model';
import {
  assertSupportedPlanConfigBundle,
  getValidatedImportedPlans,
  parsePlanConfigBundleJson,
  planImportFileSizeLimitBytes,
} from './plan-config-import';

describe('plan config import helpers', () => {
  it('parses a non-empty JSON object bundle', () => {
    const bundle = parsePlanConfigBundleJson(
      JSON.stringify({
        format: PLAN_CONFIG_FORMAT,
        version: PLAN_CONFIG_VERSION,
        plans: [{ name: 'Import Me' }],
      }),
    );

    expect(bundle.format).toBe(PLAN_CONFIG_FORMAT);
    expect(bundle.version).toBe(PLAN_CONFIG_VERSION);
    expect(bundle.plans).toEqual([{ name: 'Import Me' }]);
  });

  it('rejects empty, oversized, invalid and non-object files before validation', () => {
    expect(() => parsePlanConfigBundleJson('   ')).toThrow('The selected file is empty.');
    expect(() => parsePlanConfigBundleJson('x'.repeat(planImportFileSizeLimitBytes + 1))).toThrow(
      'The selected file is too large. Import files must be 1 MB or smaller.',
    );
    expect(() => parsePlanConfigBundleJson('{broken')).toThrow(
      'The selected file is not valid JSON.',
    );
    expect(() => parsePlanConfigBundleJson('[]')).toThrow('Unsupported plan config file.');
  });

  it('accepts only the supported bundle format and version', () => {
    expect(() =>
      assertSupportedPlanConfigBundle({
        format: PLAN_CONFIG_FORMAT,
        version: PLAN_CONFIG_VERSION,
        plans: [],
      }),
    ).not.toThrow();

    expect(() =>
      assertSupportedPlanConfigBundle({
        format: 'legacy-format' as typeof PLAN_CONFIG_FORMAT,
        version: PLAN_CONFIG_VERSION,
        plans: [],
      }),
    ).toThrow('Unsupported plan config file.');

    expect(() =>
      assertSupportedPlanConfigBundle({
        format: PLAN_CONFIG_FORMAT,
        version: PLAN_CONFIG_VERSION + 1,
        plans: [],
      }),
    ).toThrow('Unsupported plan config version.');
  });

  it('validates imported plan arrays according to import mode', () => {
    expect(getValidatedImportedPlans([], false)).toEqual([]);
    expect(() => getValidatedImportedPlans([], true)).toThrow(
      'No plans found in the selected file.',
    );
    expect(() => getValidatedImportedPlans('not-an-array', true)).toThrow(
      'No plans found in the selected file.',
    );
  });

  it('rejects invalid plan entries and overly large import batches', () => {
    expect(() => getValidatedImportedPlans([{ name: 'Valid' }, null], true)).toThrow(
      'The selected file contains invalid plan entries.',
    );
    expect(() =>
      getValidatedImportedPlans(
        Array.from({ length: 101 }, (_, index) => ({ name: 'Plan ' + index })),
        true,
      ),
    ).toThrow('The selected file contains too many plans. Import up to 100 plans at a time.');
  });
});
