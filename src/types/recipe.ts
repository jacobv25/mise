/**
 * Shared shape of the exported recipe data (`assets/data/recipes.json`).
 *
 * Produced at build time by `scripts/export-data.ts` from the markdown
 * recipes in `~/cooking`; consumed read-only by the app. The parsing rules
 * live in the machine-readable comment block at the bottom of
 * `~/cooking/recipes/TEMPLATE.md` — that file is the contract, this file
 * is its TypeScript mirror.
 */

/** Which `~/cooking/recipes/` directory the file came from ('cocktail' ← `cocktails/`). */
export type RecipeStatus = 'made' | 'to-try' | 'cocktail';

/** Fixed heat vocabulary from the template, e.g. "MEDIUM-HIGH", "OVEN 425°F", "no heat". */
export type HeatLevel = string;

export interface Bowl {
  /** 1-based position parsed from the circled digit (① → 1). */
  index: number;
  /** Moment name, e.g. "Sofrito" — the paren arrow group is stripped out. */
  name: string;
  /** Free prose after the arrow, e.g. "pan at step 5, oil first". */
  arrowText: string;
  /** Step the bowl tips in at — first "step N" in the arrow text. Null only on contract violations. */
  targetStep: number | null;
  /** Ingredient + amount strings, split on the "·" separators. */
  items: string[];
}

/** Non-bowl station cards: "Stove-side" and "Side/garnish plate" lines. */
export interface StationExtra {
  label: string;
  /** Arrow prose if the line had one (garnish plates sometimes do), else null. */
  arrowText: string | null;
  items: string[];
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
