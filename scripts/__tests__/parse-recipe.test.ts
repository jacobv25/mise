import { parseRecipe } from '../parse-recipe';

/**
 * Fixtures are synthetic but shaped exactly like the real `~/cooking` files —
 * every quirk here (wrapped bowl lines, parenthetical nutrition, arrow prose
 * with two "step N"s) exists in the real corpus.
 */
const MADE_RECIPE = `# Test Skillet (jar-stretch, low-sodium)

- **Cuisine:** Italian-American
- **Time:** ~10 min prep + ~25 min cook   **Serves:** 4 (dinner + 3 meal-prep portions)
- **Source:** Adapted from "Some Recipe" — https://example.com/recipe

## Nutrition (per serving — required)
- **Sodium:** ~380 mg (1,352 as written!)   **Protein:** ~30 g   **Calories:** ~480
- _Biggest sodium source & how it's kept low:_ The jarred marinara (~880 mg/cup).
- _personal-notes notes:_ lean turkey, olive oil.

## Mise en place (bowls · tools · amounts — the whole station in one view)
**Tools & station:** stainless skillet (large) · wooden spoon · knife + board ·
4 meal-prep containers · **garbage bowl** · damp towel under board

- **Bowl ① — Sofrito (→ pan at step 3, oil first):** ½ yellow onion, chopped · 2 garlic
  cloves, minced
- **Bowl ② — Yogurt sauce (stirred at step 1, → bowls at step 5; makes
  ~4 servings):** ¾ cup Greek yogurt · juice of ½ lemon
- **Stove-side:** 1½ tbsp olive oil · 1 lb 93% ground turkey
- **Side/garnish plate (→ step 5):** 2 tbsp chopped parsley · lemon wedges

## Steps (heat on every step)
1. **Mise — fill the bowls (no heat, ~8 min).** Line bowls up ① → ②.
2. **Preheat — MEDIUM-HIGH, empty pan, 2–3 min.** Water-drop test, then oil until it
   shimmers across two wrapped lines.
3. **Aromatics — drop to MEDIUM to a bubble, then MEDIUM-LOW, 15 min.** Bowl ① in.
4. **Balance — OFF HEAT.** Taste; splash of balsamic, never salt.
5. **Plate.** Dollop the sauce, parsley from height.

## Personal notes
- **How it went:** secret diary content that must never be exported.
- **Rating:** ★★★★ / 5

<!-- Passes dietary-profile.md checklist. [redacted] note in a comment. -->
`;

const TO_TRY_RECIPE = `# Lentil Soup (batch)

- **Cuisine:** Mediterranean
- **Time:** 15 min prep + 45 min simmer   **Serves:** 7 (1½-cup servings)

## Nutrition (per serving, as adapted)
- **Sodium:** ~110 mg (1452 as written!)   **Protein:** 9 g (≈17 g with yogurt)
  **Calories:** ~185

## Ingredients (as adapted)
- 2 Tbsp olive oil
- 1 large onion + 2 carrots, diced small (or bell pepper + extra
  onion)
- 2 tsp cumin · 1 tsp cinnamon — **no salt**

## Steps
1. Rinse lentils until water runs clear.
2. Sweat onion/carrot in oil over medium-high, 6–7 min.
`;

describe('parseRecipe — made recipe with mise bowls', () => {
  const { recipe, warnings } = parseRecipe(MADE_RECIPE, { id: 'test-skillet', status: 'made' });

  test('extracts title and meta bullets', () => {
    expect(recipe.title).toBe('Test Skillet (jar-stretch, low-sodium)');
    expect(recipe.cuisine).toBe('Italian-American');
    expect(recipe.time).toBe('~10 min prep + ~25 min cook');
    expect(recipe.serves).toBe('4 (dinner + 3 meal-prep portions)');
    expect(recipe.source).toContain('https://example.com/recipe');
  });

  test('nutrition takes the first number after each marker, ignoring parentheticals', () => {
    expect(recipe.sodiumMg).toBe(380); // not 1,352 from "(as written!)"
    expect(recipe.proteinG).toBe(30);
    expect(recipe.calories).toBe(480);
  });

  test('tools list splits on · and survives a wrapped line', () => {
    expect(recipe.tools).toEqual([
      'stainless skillet (large)',
      'wooden spoon',
      'knife + board',
      '4 meal-prep containers',
      'garbage bowl',
      'damp towel under board',
    ]);
  });

  test('bowls: circled digit index, arrow-stripped name, items split on ·', () => {
    expect(recipe.bowls).toHaveLength(2);
    const [sofrito, yogurt] = recipe.bowls;
    expect(sofrito.index).toBe(1);
    expect(sofrito.name).toBe('Sofrito');
    expect(sofrito.arrowText).toBe('→ pan at step 3, oil first');
    expect(sofrito.items).toEqual(['½ yellow onion, chopped', '2 garlic cloves, minced']);
    expect(yogurt.index).toBe(2);
    expect(yogurt.name).toBe('Yogurt sauce');
  });

  test('bowl target is the first "step N" after the arrow, not before it', () => {
    const [sofrito, yogurt] = recipe.bowls;
    expect(sofrito.targetStep).toBe(3);
    // "(stirred at step 1, → bowls at step 5)" — target is 5, not 1.
    expect(yogurt.targetStep).toBe(5);
  });

  test('stove-side and garnish lines become station extras, not bowls', () => {
    expect(recipe.stationExtras.map((e) => e.label)).toEqual(['Stove-side', 'Side/garnish plate']);
    expect(recipe.stationExtras[0].arrowText).toBeNull();
    expect(recipe.stationExtras[1].arrowText).toBe('step 5');
  });

  test('steps: numbers, bold lead-ins, wrapped lines joined', () => {
    expect(recipe.steps.map((s) => s.number)).toEqual([1, 2, 3, 4, 5]);
    expect(recipe.steps[1].leadIn).toBe('Preheat — MEDIUM-HIGH, empty pan, 2–3 min.');
    expect(recipe.steps[1].text).toContain('shimmers across two wrapped lines');
  });

  test('heat tokens: longest-token-first, OFF HEAT, "no heat", null for plating', () => {
    expect(recipe.steps.map((s) => s.heat)).toEqual([
      'no heat',
      'MEDIUM-HIGH', // not "HIGH" or "MEDIUM"
      'MEDIUM', // first token wins over the later MEDIUM-LOW
      'OFF HEAT',
      null, // "**Plate.**" has no token
    ]);
  });

  test('valid bowl targets produce no warnings', () => {
    expect(warnings).toEqual([]);
  });

  test('privacy: personal/health content never reaches the output', () => {
    const json = JSON.stringify(recipe);
    expect(json).not.toContain('[redacted]');
    expect(json).not.toContain('secret diary');
    expect(json).not.toContain('Biggest sodium source');
    expect(json).not.toContain('dietary-profile');
    expect(json).not.toContain('Rating');
  });
});

describe('parseRecipe — bowl-less to-try recipe', () => {
  const { recipe, warnings } = parseRecipe(TO_TRY_RECIPE, { id: 'lentil-soup', status: 'to-try' });

  test('degrades gracefully: no bowls, no tools, plain ingredients captured', () => {
    expect(recipe.bowls).toEqual([]);
    expect(recipe.tools).toEqual([]);
    expect(recipe.stationExtras).toEqual([]);
    expect(recipe.ingredients).toEqual([
      '2 Tbsp olive oil',
      '1 large onion + 2 carrots, diced small (or bell pepper + extra onion)',
      '2 tsp cumin · 1 tsp cinnamon — no salt',
    ]);
  });

  test('nutrition parses even when Calories wraps to the next line', () => {
    expect(recipe.sodiumMg).toBe(110); // not 1452
    expect(recipe.proteinG).toBe(9); // not 17
    expect(recipe.calories).toBe(185);
  });

  test('steps without bold lead-ins get null heat (lowercase prose is not a token)', () => {
    expect(recipe.steps).toHaveLength(2);
    expect(recipe.steps.every((s) => s.heat === null)).toBe(true);
    expect(recipe.steps.every((s) => s.leadIn === null)).toBe(true);
  });

  test('parses clean with no warnings', () => {
    expect(warnings).toEqual([]);
  });
});

describe('parseRecipe — contract violations surface as warnings', () => {
  test('bowl arrow pointing at a nonexistent step warns', () => {
    const md = `# Broken

## Mise en place
- **Bowl ① — Sofrito (→ pan at step 9):** onion

## Steps
1. **Only step.** Do the thing.
`;
    const { warnings } = parseRecipe(md, { id: 'broken', status: 'made' });
    expect(warnings.some((w) => w.includes('targets step 9'))).toBe(true);
  });

  test('bowl with no "step N" in its arrow text warns', () => {
    const md = `# Broken

## Mise en place
- **Bowl ① — Sofrito (→ into the pan eventually):** onion

## Steps
1. **Only step.** Do the thing.
`;
    const { warnings } = parseRecipe(md, { id: 'broken', status: 'made' });
    expect(warnings.some((w) => w.includes('no "step N" target'))).toBe(true);
  });

  test('missing nutrition markers warn and yield nulls', () => {
    const md = `# No Nutrition

## Steps
1. Cook it.
`;
    const { recipe, warnings } = parseRecipe(md, { id: 'no-nutrition', status: 'to-try' });
    expect(recipe.sodiumMg).toBeNull();
    expect(recipe.proteinG).toBeNull();
    expect(warnings.some((w) => w.includes('Sodium'))).toBe(true);
    expect(warnings.some((w) => w.includes('Protein'))).toBe(true);
  });

  test('OVEN heat token parses with its temperature', () => {
    const md = `# Oven Thing

## Steps
1. **Roast — OVEN 425°F, 20 min.** Until blistered.
`;
    const { recipe } = parseRecipe(md, { id: 'oven', status: 'made' });
    expect(recipe.steps[0].heat).toBe('OVEN 425°F');
  });
});
