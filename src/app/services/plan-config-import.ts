import {
  PLAN_CONFIG_FORMAT,
  PLAN_CONFIG_VERSION,
  PlanConfig,
  PlanConfigBundle,
} from '../models/plan-config.model';
import { isPlainRecord } from './plan-config-normalization';

export const planImportFileSizeLimitBytes = 1024 * 1024;
const maxImportedPlanCount = 100;

export function parsePlanConfigBundleJson(json: string): Partial<PlanConfigBundle> {
  const trimmedJson = json.trim();

  if (trimmedJson.length === 0) {
    throw new Error('The selected file is empty.');
  }

  if (trimmedJson.length > planImportFileSizeLimitBytes) {
    throw new Error('The selected file is too large. Import files must be 1 MB or smaller.');
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(trimmedJson);
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  if (!isPlainRecord(parsedJson)) {
    throw new Error('Unsupported plan config file.');
  }

  return parsedJson as Partial<PlanConfigBundle>;
}

export function assertSupportedPlanConfigBundle(rawBundle: Partial<PlanConfigBundle>): void {
  if (!isPlainRecord(rawBundle) || rawBundle.format !== PLAN_CONFIG_FORMAT) {
    throw new Error('Unsupported plan config file.');
  }

  if (rawBundle.version !== PLAN_CONFIG_VERSION) {
    throw new Error('Unsupported plan config version.');
  }
}

export function getValidatedImportedPlans(
  rawPlans: unknown,
  requirePlans: boolean,
): Partial<PlanConfig>[] {
  if (!Array.isArray(rawPlans) || rawPlans.length === 0) {
    if (requirePlans) {
      throw new Error('No plans found in the selected file.');
    }

    return [];
  }

  if (rawPlans.length > maxImportedPlanCount) {
    throw new Error('The selected file contains too many plans. Import up to 100 plans at a time.');
  }

  if (!rawPlans.every((plan) => isPlainRecord(plan))) {
    throw new Error('The selected file contains invalid plan entries.');
  }

  return rawPlans as Partial<PlanConfig>[];
}
