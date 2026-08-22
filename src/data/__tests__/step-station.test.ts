import { stationForStep, standingExtras } from '../step-station';

import type { Recipe } from '@/types/recipe';

/** Only the station fields matter to these selectors. */
const RECIPE = {
  bowls: [
    { index: 1, name: 'Chicken', arrowText: 'step 5', targetSteps: [5], items: ['2 breasts'] },
    { index: 2, name: 'Aromatics', arrowText: 'step 6', targetSteps: [6], items: ['3 cloves garlic'] },
    { index: 3, name: 'Eggs', arrowText: 'steps 5 & 6', targetSteps: [5, 6], items: ['2 eggs'] },
  ],
  stationExtras: [
    { label: 'Stove-side', arrowText: null, targetSteps: [], items: ['2 tbsp olive oil'] },
    { label: 'Side/garnish plate', arrowText: 'step 8', targetSteps: [8], items: ['lemon zest'] },
  ],
} as Recipe;

describe('stationForStep', () => {
  test('collects every bowl and extra targeting the step; two-stage bowls land at each', () => {
    expect(stationForStep(RECIPE, 5).bowls.map((b) => b.name)).toEqual(['Chicken', 'Eggs']);
    expect(stationForStep(RECIPE, 6).bowls.map((b) => b.name)).toEqual(['Aromatics', 'Eggs']);
    expect(stationForStep(RECIPE, 8).extras.map((e) => e.label)).toEqual(['Side/garnish plate']);
  });

  test('steps with nothing tipping in get empty lists, never the null-target cards', () => {
    expect(stationForStep(RECIPE, 2)).toEqual({ bowls: [], extras: [] });
  });
});

describe('standingExtras', () => {
  test('returns only the arrow-less cards', () => {
    expect(standingExtras(RECIPE).map((e) => e.label)).toEqual(['Stove-side']);
  });
});
