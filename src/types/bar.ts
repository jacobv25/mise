/**
 * Shape of the exported bar data (`assets/data/bar.json`), produced by
 * `scripts/export-data.ts` from `~/cooking/bar.md` — the shopping-run
 * sections only. Unlike pantry items, bar items keep their annotation:
 * price hints and brand picks are exactly what you need in the store.
 */

export interface BarItem {
  name: string;
  /** Price range, brand picks, or what the bottle unlocks. */
  detail?: string;
  /** "Optional add-on" lines — nice-to-have, not needed for the first run. */
  optional: boolean;
}

export interface BarSection {
  /** Display title, e.g. "Phase 1 · The sour lane". */
  title: string;
  /** Intro line under the section heading, when the source has one. */
  note?: string;
  items: BarItem[];
}
