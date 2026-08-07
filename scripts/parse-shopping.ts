/**
 * `~/cooking/pantry.md` § "Running shopping list" → shopping checklist.
 *
 * The pantry parser deliberately excludes this section (it's a to-buy
 * list, not inventory); this parser exports ONLY it. Item lines follow
 * the bar-list grammar (bold name, annotation → `detail`), plus:
 *  - `- [x]` items are skipped (bought/solved);
 *  - "(optional…)" in the line → `optional: true`, and the word itself
 *    is trimmed off the front of the detail (the chip already says it).
 *
 * The bar run stays in bar.json — the app points at the Bar tab instead
 * of duplicating the bottle list with unsynced checkboxes.
 */

import type { ChecklistSection } from '../src/types/checklist';
import { parseChecklistItem } from './parse-bar';
import { joinWrappedLines } from './parse-pantry';

export type { ChecklistItem, ChecklistSection } from '../src/types/checklist';

export function parseShopping(markdown: string): ChecklistSection[] {
  const source = markdown.replace(/<!--[\s\S]*?-->/g, '');
  const section: ChecklistSection = { title: 'Kitchen run', items: [] };
  let inSection = false;

  for (const line of joinWrappedLines(source.split('\n'))) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      inSection = /running shopping list/i.test(heading[1]);
      continue;
    }
    if (!inSection) continue;

    const box = line.match(/^-\s+\[( |x)\]\s+(.*)$/i);
    if (!box) continue;
    if (box[1].toLowerCase() === 'x') continue; // bought/solved

    const optional = /\(optional\b/i.test(box[2]);
    const item = parseChecklistItem(box[2], optional);
    if (optional && item.detail) {
      const detail = item.detail.replace(/^optional\b[\s,;—–-]*/i, '').trim();
      if (detail) item.detail = detail;
      else delete item.detail;
    }
    section.items.push(item);
  }

  return section.items.length > 0 ? [section] : [];
}
