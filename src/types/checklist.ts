/**
 * Shape shared by the exported shopping checklists (`assets/data/bar.json`,
 * `assets/data/shopping.json`), produced by `scripts/export-data.ts` from
 * `~/cooking/bar.md` and the pantry's running shopping list. Unlike pantry
 * items, checklist items keep their annotation: price hints, brand picks,
 * and why-it's-listed notes are exactly what you need in the store.
 */

export interface ChecklistItem {
  name: string;
  /** Price range, brand picks, or why the item is on the list. */
  detail?: string;
  /** Nice-to-have, not needed for the run. */
  optional: boolean;
}

export interface ChecklistSection {
  /** Display title, e.g. "Phase 1 · The sour lane". */
  title: string;
  /** Intro line under the section heading, when the source has one. */
  note?: string;
  items: ChecklistItem[];
}
