/**
 * Shape of the exported pantry data (`assets/data/pantry.json`), produced
 * by `scripts/export-data.ts` from `~/cooking/pantry.md`. Item names only —
 * the parser deliberately drops the pantry file's free-form annotations.
 */

export interface PantryItem {
  name: string;
  /** ⚠️ on the source line — sodium/label caution. */
  warn: boolean;
  /** ⏰ flag or membership in the USE-FIRST section. */
  useFirst: boolean;
}

export interface PantrySection {
  /** Display title, e.g. "Staples", "Fridge · Dairy". */
  title: string;
  items: PantryItem[];
}
