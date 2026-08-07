/**
 * Export `~/cooking` recipes → `assets/data/recipes.json`.
 *
 * Run via `npm run export-data` (re-run any time the workspace changes;
 * sync is explicitly out of scope). The output file is gitignored — the
 * committed `recipes.sample.json` keeps fresh clones and CI building
 * without access to `~/cooking`.
 *
 * Parser warnings are fatal here: the corpus was retrofitted to the
 * TEMPLATE.md contract, so any warning means a recipe regressed.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import type { Recipe, RecipeStatus } from '../src/types/recipe';
import { parseBar } from './parse-bar';
import { parsePantry } from './parse-pantry';
import { parseRecipe } from './parse-recipe';

const COOKING_DIR = process.env.COOKING_DIR ?? path.join(os.homedir(), 'cooking');
const DATA_DIR = path.resolve(__dirname, '..', 'assets', 'data');
const OUT_FILE = path.join(DATA_DIR, 'recipes.json');
const PANTRY_OUT_FILE = path.join(DATA_DIR, 'pantry.json');
const BAR_OUT_FILE = path.join(DATA_DIR, 'bar.json');

// Belt-and-suspenders on top of the parsers' allowlist extraction: phrases
// that only occur in the workspace's private sections must never reach the
// export. This repo is public, so the more specific vocabulary lives in an
// untracked local extension file rather than in source.
const LOCAL_MARKERS_FILE = path.join(__dirname, 'privacy-markers.local.json');
const FORBIDDEN_MARKERS: string[] = [
  'Personal notes',
  'How it went',
  'Tweak next time',
  'Biggest sodium source',
  'dietary-profile',
  ...(fs.existsSync(LOCAL_MARKERS_FILE)
    ? (JSON.parse(fs.readFileSync(LOCAL_MARKERS_FILE, 'utf8')) as string[])
    : []),
];

const STATUS_DIRS: Record<RecipeStatus, string> = {
  made: 'made',
  'to-try': 'to-try',
  cocktail: 'cocktails',
};

function readDir(status: RecipeStatus): { recipes: Recipe[]; warnings: string[] } {
  const dir = path.join(COOKING_DIR, 'recipes', STATUS_DIRS[status]);
  const recipes: Recipe[] = [];
  const warnings: string[] = [];
  // Skip non-.md files — stray .html exports and plating jpgs live alongside the recipes.
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const markdown = fs.readFileSync(path.join(dir, file), 'utf8');
    const result = parseRecipe(markdown, { id: file.replace(/\.md$/, ''), status });
    // Made dishes and cocktail specs are station-first; only to-try queue
    // entries may fall back to a flat ingredient list.
    if (status !== 'to-try' && result.recipe.bowls.length === 0) {
      warnings.push(`${result.recipe.id}: ${status} recipe has no mise bowls`);
    }
    recipes.push(result.recipe);
    warnings.push(...result.warnings);
  }
  return { recipes, warnings };
}

const made = readDir('made');
const toTry = readDir('to-try');
const cocktails = readDir('cocktail');
const recipes = [...made.recipes, ...toTry.recipes, ...cocktails.recipes];
const warnings = [...made.warnings, ...toTry.warnings, ...cocktails.warnings];

const pantry = parsePantry(fs.readFileSync(path.join(COOKING_DIR, 'pantry.md'), 'utf8'));
const bar = parseBar(fs.readFileSync(path.join(COOKING_DIR, 'bar.md'), 'utf8'));

const json = JSON.stringify(recipes, null, 2) + '\n';
const pantryJson = JSON.stringify(pantry, null, 2) + '\n';
const barJson = JSON.stringify(bar, null, 2) + '\n';

const leaked = FORBIDDEN_MARKERS.filter(
  (marker) => json.includes(marker) || pantryJson.includes(marker) || barJson.includes(marker),
);
if (leaked.length > 0) {
  console.error(`PRIVACY GUARD: export contains forbidden content: ${leaked.join(', ')}`);
  process.exit(1);
}

if (warnings.length > 0) {
  console.error('Contract warnings (fix the recipe files in ~/cooking):');
  for (const w of warnings) console.error(`  - ${w}`);
  process.exit(1);
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, json);
fs.writeFileSync(PANTRY_OUT_FILE, pantryJson);
fs.writeFileSync(BAR_OUT_FILE, barJson);

const bowlCount = recipes.reduce((n, r) => n + r.bowls.length, 0);
const pantryCount = pantry.reduce((n, s) => n + s.items.length, 0);
const barCount = bar.reduce((n, s) => n + s.items.length, 0);
console.log(
  `Exported ${made.recipes.length} made + ${toTry.recipes.length} to-try + ` +
    `${cocktails.recipes.length} cocktail recipes ` +
    `(${bowlCount} bowls) → ${path.relative(process.cwd(), OUT_FILE)}\n` +
    `Exported ${pantry.length} pantry sections (${pantryCount} items) → ` +
    path.relative(process.cwd(), PANTRY_OUT_FILE) +
    `\nExported ${bar.length} bar sections (${barCount} items) → ` +
    path.relative(process.cwd(), BAR_OUT_FILE),
);
