/**
 * Shared shape of the exported recipe data (`assets/data/recipes.json`).
 *
 * Produced at build time by `scripts/export-data.ts` from the markdown
 * recipes in `~/cooking`; consumed read-only by the app. The parsing rules
 * live in the machine-readable comment block at the bottom of
 * `~/cooking/recipes/TEMPLATE.md` — that file is the contract, this file
 * is its TypeScript mirror.
 */

/**
 * Which `~/cooking/recipes/` directory the file came from ('cocktail' ← `cocktails/`).
 * 'mocktail' is the one exception to the directory rule: zero-proof specs are
 * filed in `cocktails/` too, and the exporter splits them off by their
 * "**Cuisine:** Zero-proof …" line (see `isZeroProof` in parse-recipe.ts).
 */
export type RecipeStatus = 'made' | 'to-try' | 'cocktail' | 'mocktail';

/** Fixed heat vocabulary from the template, e.g. "MEDIUM-HIGH", "OVEN 425°F", "no heat". */
export type HeatLevel = string;

export interface Bowl {
  /** 1-based position parsed from the circled digit (① → 1). */
  index: number;
  /** Moment name, e.g. "Sofrito" — the paren arrow group is stripped out. */
  name: string;
  /** Free prose after the arrow, e.g. "pan at step 5, oil first". */
  arrowText: string;
  /**
   * Steps the bowl lands at, in order of mention — "step N" numbers after
   * the arrow. Usually one; two-stage bowls carry two ("→ steps 4 & 5").
   * Empty only on contract violations.
   */
  targetSteps: number[];
  /** Ingredient + amount strings, split on the "·" separators. */
  items: string[];
}

/** Non-bowl station cards: "Stove-side" and "Side/garnish plate" lines. */
export interface StationExtra {
  label: string;
  /** Arrow prose if the line had one (garnish plates sometimes do), else null. */
  arrowText: string | null;
  /**
   * Steps the card lands at, same grammar as bowls (a garnish plate's
   * "prepped at step 1, poured at step 3" → [1, 3]). Empty for cards with
   * no arrow (stove-side) or arrows without a step; unlike bowls, that's
   * allowed, not a contract violation.
   */
  targetSteps: number[];
  items: string[];
}

/** Timer parsed from a step's bold lead-in, e.g. "2–3 min" → 120–180 s. */
export interface StepDuration {
  minSeconds: number;
  /** Equals minSeconds when the lead-in gives a single value ("~8 min"). */
  maxSeconds: number;
  /** The token as written, for display: "~5–6 min", "30–45 sec". */
  text: string;
}

export interface Step {
  /** The number as written in the markdown list. */
  number: number;
  /** Full step text, markdown emphasis preserved. */
  text: string;
  /** Bold lead-in sentence if the step has one, e.g. "Preheat — MEDIUM-HIGH, 2–3 min." */
  leadIn: string | null;
  /** Heat token found in the lead-in, or null (bowl-less/to-try steps have none). */
  heat: HeatLevel | null;
  /** First duration in the lead-in (same lead-in-only rule as heat), or null. */
  duration: StepDuration | null;
}

export interface Recipe {
  /** Filename slug, e.g. "turkey-marinara-skillet". */
  id: string;
  title: string;
  status: RecipeStatus;
  cuisine: string | null;
  time: string | null;
  serves: string | null;
  source: string | null;
  /** First number after "**Sodium:**", in mg. */
  sodiumMg: number | null;
  /** First number after "**Protein:**", in g. */
  proteinG: number | null;
  calories: number | null;
  /** "Tools & station" entries, split on "·". Empty for recipes without a mise section. */
  tools: string[];
  /** Empty for to-try recipes — screens must degrade gracefully. */
  bowls: Bowl[];
  stationExtras: StationExtra[];
  /** Plain ingredient list, only present on recipes without mise bowls (to-try files). */
  ingredients: string[];
  steps: Step[];
}
