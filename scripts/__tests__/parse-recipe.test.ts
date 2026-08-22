import { isZeroProof, parseLeadInDuration, parseRecipe } from '../parse-recipe';

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
- _Health notes:_ private dietary rationale that must never be exported.

## Mise en place (bowls · tools · amounts — the whole station in one view)
**Tools & station:** stainless skillet (large) · wooden spoon · knife + board ·
4 meal-prep containers · **garbage bowl** · damp towel under board

- **Bowl ① — Sofrito (→ pan at step 3, oil first):** ½ yellow onion, chopped · 2 garlic
  cloves, minced
- **Bowl ② — Yogurt sauce (stirred at step 1, → bowls at step 5; makes
  ~4 servings):** ¾ cup Greek yogurt · juice of ½ lemon
- **Bowl ③ — Eggs, two-stage (→ steps 4 & 5):** 2 eggs, fridge-cold
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

<!-- Passes dietary-profile.md checklist. private note in a comment. -->
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
    expect(recipe.bowls).toHaveLength(3);
    const [sofrito, yogurt] = recipe.bowls;
    expect(sofrito.index).toBe(1);
    expect(sofrito.name).toBe('Sofrito');
    expect(sofrito.arrowText).toBe('→ pan at step 3, oil first');
    expect(sofrito.items).toEqual(['½ yellow onion, chopped', '2 garlic cloves, minced']);
    expect(yogurt.index).toBe(2);
    expect(yogurt.name).toBe('Yogurt sauce');
  });

  test('bowl targets come from after the arrow; "steps 4 & 5" lands at both', () => {
    const [sofrito, yogurt, eggs] = recipe.bowls;
    expect(sofrito.targetSteps).toEqual([3]);
    // "(stirred at step 1, → bowls at step 5)" — target is 5, not 1.
    expect(yogurt.targetSteps).toEqual([5]);
    // The two-stage plural from the ramen recipes.
    expect(eggs.targetSteps).toEqual([4, 5]);
  });

  test('stove-side and garnish lines become station extras, not bowls', () => {
    expect(recipe.stationExtras.map((e) => e.label)).toEqual(['Stove-side', 'Side/garnish plate']);
    expect(recipe.stationExtras[0].arrowText).toBeNull();
    expect(recipe.stationExtras[1].arrowText).toBe('step 5');
  });

  test('extras get targetSteps from their arrow; arrow-less stove-side stays empty', () => {
    expect(recipe.stationExtras.map((e) => e.targetSteps)).toEqual([[], [5]]);
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

  test('durations: range, single value, and lead-ins without one', () => {
    expect(recipe.steps.map((s) => s.duration)).toEqual([
      { minSeconds: 480, maxSeconds: 480, text: '~8 min' },
      { minSeconds: 120, maxSeconds: 180, text: '2–3 min' },
      { minSeconds: 900, maxSeconds: 900, text: '15 min' },
      null, // "Balance — OFF HEAT." has no duration
      null, // "Plate."
    ]);
  });

  test('valid bowl targets produce no warnings', () => {
    expect(warnings).toEqual([]);
  });

  test('privacy: personal-section content never reaches the output', () => {
    const json = JSON.stringify(recipe);
    expect(json).not.toContain('Health notes');
    expect(json).not.toContain('private dietary rationale');
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
    // "6–7 min" in the body prose is not a lead-in duration.
    expect(recipe.steps.every((s) => s.duration === null)).toBe(true);
  });

  test('parses clean with no warnings', () => {
    expect(warnings).toEqual([]);
  });
});

/** Shaped like the real bar-track files: tin/ice "bowls", zero heat tokens. */
const COCKTAIL_RECIPE = `# The Test Sour 🍸

- **Cuisine:** Cocktail — the classic sour template
- **Time:** ~8 min active (+ glass chill)   **Serves:** 1

## Nutrition (per serving — required)
- **Sodium:** ~5 mg (no rim; ~100 mg with the half rim)   **Protein:** 0 g   **Calories:** ~205
- _Alcohol:_ guardrail prose that must never be exported.

## Mise en place — the bar station
**Tools & station:** jigger (¼-oz marks) · Boston shaker (both tins) · Hawthorne strainer

- **Bowl ① — The tin, liquids only (→ built in the small tin at step 1, cheapest
  first):** ¼ oz simple syrup, cold · ¾ oz fresh lime juice · 2 oz blanco tequila
- **Bowl ② — Shaking ice (→ large tin at step 2):** ice to fill the large tin ⅔ full
- **Glass station (→ prepped at step 1, poured at step 3):** rocks glass → freezer ≥10 min ·
  garnish — 1 thin lime wheel

## Steps
1. **Build the liquids in the small tin, cheapest first:** jigger at eye level.
2. **SHAKE — hard, 12 seconds on a phone timer.** A piston, not a rock.
3. **Plate.** Strain over fresh ice, wheel on the clean side of the rim.

## Plating target
![Plating target](test-sour-plating-target.jpg)
`;

describe('parseRecipe — cocktail spec from the bar track', () => {
  const { recipe, warnings } = parseRecipe(COCKTAIL_RECIPE, {
    id: 'test-sour',
    status: 'cocktail',
  });

  test('status passes through and the station parses like a kitchen mise', () => {
    expect(recipe.status).toBe('cocktail');
    expect(recipe.tools).toHaveLength(3);
    expect(recipe.bowls.map((b) => b.name)).toEqual(['The tin, liquids only', 'Shaking ice']);
    expect(recipe.bowls.map((b) => b.targetSteps)).toEqual([[1], [2]]);
    expect(recipe.stationExtras.map((e) => e.label)).toEqual(['Glass station']);
    expect(recipe.stationExtras[0].arrowText).toBe('prepped at step 1, poured at step 3');
    // Separate "step N" mentions each count — the glass is touched twice.
    expect(recipe.stationExtras[0].targetSteps).toEqual([1, 3]);
  });

  test('the shake timer parses as a seconds duration', () => {
    expect(recipe.steps.map((s) => s.duration)).toEqual([
      null,
      { minSeconds: 12, maxSeconds: 12, text: '12 seconds' },
      null,
    ]);
  });

  test('no burner anywhere: every step has null heat (SHAKE is not a token)', () => {
    expect(recipe.steps).toHaveLength(3);
    expect(recipe.steps.every((s) => s.heat === null)).toBe(true);
  });

  test('nutrition parses; alcohol guardrail and plating image stay out of the export', () => {
    expect(recipe.sodiumMg).toBe(5);
    expect(recipe.proteinG).toBe(0);
    expect(recipe.calories).toBe(205);
    const json = JSON.stringify(recipe);
    expect(json).not.toContain('guardrail prose');
    expect(json).not.toContain('plating-target.jpg');
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

  test('station extra targeting a nonexistent step warns', () => {
    const md = `# Broken

## Mise en place
- **Bowl ① — Sofrito (→ pan at step 1):** onion
- **Side/garnish plate (→ step 7):** parsley

## Steps
1. **Only step.** Do the thing.
`;
    const { warnings } = parseRecipe(md, { id: 'broken', status: 'made' });
    expect(warnings.some((w) => w.includes('"Side/garnish plate" targets step 7'))).toBe(true);
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

/**
 * Zero-proof specs share the `cocktails/` directory with the alcoholic ones,
 * so the exporter can only tell them apart by the Cuisine line. The real
 * corpus writes it two ways — "Zero-proof — …" and "Zero-proof cooler — …".
 */
describe('isZeroProof — the mocktail split inside cocktails/', () => {
  test('matches the zero-proof cuisine lines, with or without a trailing noun', () => {
    expect(isZeroProof('Zero-proof — soda-fountain classic, rickey family')).toBe(true);
    expect(isZeroProof('Zero-proof cooler — the collins family shape, no spirit')).toBe(true);
    expect(isZeroProof('zero proof — lowercase, spaced')).toBe(true);
  });

  test('leaves the alcoholic specs alone', () => {
    expect(isZeroProof('Cocktail — the classic sour template')).toBe(false);
    expect(isZeroProof('Cocktail — highball / built & topped, tequila lane')).toBe(false);
    // Only the opening word counts: a cocktail that merely mentions the
    // zero-proof variant in its cuisine prose is still a cocktail.
    expect(isZeroProof('Cocktail — spritz family, has a zero-proof sibling')).toBe(false);
  });

  test('kitchen recipes and missing cuisine lines are never zero-proof', () => {
    expect(isZeroProof('Italian-American')).toBe(false);
    expect(isZeroProof(null)).toBe(false);
  });
});

const ZERO_PROOF_RECIPE = `# The Test Cooler — Zero-Proof Precision Spec 🍸

- **Cuisine:** Zero-proof cooler — the collins family shape, no spirit
- **Time:** ~3 min active (+ bottles fridge-cold)   **Serves:** 1

## Nutrition (per serving — required)
- **Sodium:** ~5 mg   **Protein:** 0 g   **Calories:** ~35
- _Alcohol:_ **0.0** — guardrail prose that must never be exported.

## Mise en place — the bar station
**Tools & station:** jigger (¼-oz marks) · long bar spoon

- **Bowl ① — Serving ice (→ into the glass at step 1):** ice to fill the collins glass
- **Bowl ② — The pour, liquids only (→ built in the glass at step 2, lime first):**
  ½ oz fresh lime juice · 3 oz rose lemonade · 3 oz soda water

## Steps
1. **Fill the cold glass with ice.** Biggest cubes you have.
2. **Build in the glass, lime first.** Down the bar spoon, to keep the bubbles.
`;

describe('parseRecipe — zero-proof spec parses like its alcoholic sibling', () => {
  const { recipe, warnings } = parseRecipe(ZERO_PROOF_RECIPE, {
    id: 'test-cooler',
    status: 'cocktail',
  });

  test('parses clean, and the cuisine line flags it for the mocktail split', () => {
    expect(warnings).toEqual([]);
    expect(recipe.bowls.map((b) => b.targetSteps)).toEqual([[1], [2]]);
    expect(isZeroProof(recipe.cuisine)).toBe(true);
  });

  test('the 0.0 alcohol guardrail stays out of the export like any other', () => {
    expect(JSON.stringify(recipe)).not.toContain('guardrail prose');
  });
});

describe('parseLeadInDuration — corpus spellings beyond the fixtures', () => {
  test('unit variants normalize to seconds', () => {
    expect(parseLeadInDuration('Simmer — LOW, 1 hr.')).toEqual({
      minSeconds: 3600,
      maxSeconds: 3600,
      text: '1 hr',
    });
    expect(parseLeadInDuration('Rest — no heat, 5 mins.')).toEqual({
      minSeconds: 300,
      maxSeconds: 300,
      text: '5 mins',
    });
  });

  test('first duration wins; temperatures and bare numbers never match', () => {
    expect(parseLeadInDuration('Sear — MEDIUM-HIGH, ~5–6 min, flip, then 4–5 min.')).toEqual({
      minSeconds: 300,
      maxSeconds: 360,
      text: '~5–6 min',
    });
    expect(parseLeadInDuration('Roast — OVEN 425°F until blistered.')).toBeNull();
    expect(parseLeadInDuration(null)).toBeNull();
  });
});
