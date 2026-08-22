import type { Bowl, Recipe, StationExtra } from '@/types/recipe';

/**
 * Cook-mode selectors: what the station contributes to a given step.
 *
 * The exported data stays normalized — bowls own their `targetSteps` (the
 * "→ step N" arrows in ~/cooking) and nothing is denormalized per step.
 * These pure functions derive the per-step view the cook screen renders,
 * so a step can show its own ingredients inline instead of sending the
 * cook back to the mise section.
 */

export interface StepStation {
  /** Bowls that tip in at this step, in bowl (①②③) order. */
  bowls: Bowl[];
  /** Arrow-targeted station cards landing here (garnish plates, mostly). */
  extras: StationExtra[];
}

export function stationForStep(recipe: Recipe, stepNumber: number): StepStation {
  return {
    bowls: recipe.bowls.filter((b) => b.targetSteps.includes(stepNumber)),
    extras: recipe.stationExtras.filter((e) => e.targetSteps.includes(stepNumber)),
  };
}

/**
 * Cards with no landing step — stove-side oils/liquids used across steps.
 * Cook mode keeps these visible throughout rather than attaching them anywhere.
 */
export function standingExtras(recipe: Recipe): StationExtra[] {
  return recipe.stationExtras.filter((e) => e.targetSteps.length === 0);
}
