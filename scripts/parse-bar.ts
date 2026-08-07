/**
 * `~/cooking/bar.md` → bar shopping checklist.
 *
 * bar.md is the cocktail sibling of pantry.md — health guardrails,
 * inventory, and the starter shopping list in one living doc. Only the
 * shopping-run sections export (bottles by phase + tools); guardrails,
 * inventory, storage notes, and the agents footer never leave the file.
 * Unlike the pantry parser this one KEEPS each item's annotation as
 * `detail` — the price hints and brand picks are the point in-store:
 *  - name = bold text when the line has one, else text before the first
 *    parenthetical; the rest becomes `detail` with parens/bold stripped;
 *  - `- [x]` items are skipped (bought → they live in inventory now);
 *  - "Optional add-on:" lines export with `optional: true`;
 *  - plain `-` prose lines ("Already owned…") are skipped;
 *  - the first non-list line under a heading becomes the section `note`.
 */

import type { ChecklistItem, ChecklistSection } from '../src/types/checklist';
import { joinWrappedLines } from './parse-pantry';

export type { ChecklistItem, ChecklistSection } from '../src/types/checklist';

/** Section headings we export, in display order, with app-facing titles. */
const SECTIONS: { re: RegExp; title: string }[] = [
  { re: /^starter shopping list/i, title: 'Phase 1 · The sour lane' },
  { re: /^phase 2/i, title: 'Phase 2 · The Italian lane' },
  { re: /^tools/i, title: 'Tools' },
];

export function parseBar(markdown: string): ChecklistSection[] {
  const source = markdown.replace(/<!--[\s\S]*?-->/g, '');
  const sections: ChecklistSection[] = [];
  let current: ChecklistSection | null = null;

  for (const line of joinWrappedLines(source.split('\n'))) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      const found = SECTIONS.find((s) => s.re.test(heading[1].trim()));
      current = found ? { title: found.title, items: [] } : null;
      if (current) sections.push(current);
      continue;
    }
    if (!current) continue;

    const li = line.match(/^-\s+(.*)$/);
    if (!li) {
      // Prose directly under the heading is the section's intro note.
      if (!current.note && current.items.length === 0 && !/^#|^---/.test(line)) {
        current.note = line.replace(/\*\*/g, '').trim();
      }
      continue;
    }

    // `·` chains several checkboxes on one line ("Campari · [ ] sweet vermouth").
    for (const part of li[1].split('·').map((p) => p.trim()).filter(Boolean)) {
      const box = part.match(/^\[( |x)\]\s+(.*)$/i);
      const optional = !box && /^optional\b/i.test(part);
      if (!box && !optional) continue; // "Already owned…" prose lines
      if (box && box[1].toLowerCase() === 'x') continue; // bought → inventory
      current.items.push(
        parseChecklistItem(box ? box[2] : part.replace(/^optional[^:]*:\s*/i, ''), optional),
      );
    }
  }

  return sections.filter((s) => s.items.length > 0);
}

/** Shared line parser — the pantry's running shopping list uses the same item grammar. */
export function parseChecklistItem(text: string, optional: boolean): ChecklistItem {
  const bold = text.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  let name: string;
  let rest: string;
  if (bold) {
    name = bold[1].trim();
    rest = bold[2];
  } else {
    const cut = text.search(/\s*\(/);
    name = (cut === -1 ? text : text.slice(0, cut)).trim();
    rest = cut === -1 ? '' : text.slice(cut);
  }
  const detail = rest
    .replace(/\*\*/g, '')
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[—–-]\s*/, '');
  return detail ? { name, detail, optional } : { name, optional };
}
