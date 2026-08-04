/**
 * `~/cooking/pantry.md` → sectioned pantry checklist.
 *
 * The pantry file is a living personal document — free-form prose, owner
 * notes, and health context mixed into item lines. Unlike the recipe
 * parser (which extracts structured fields), this one keeps ONLY item
 * names plus two presentation flags, and drops every annotation:
 *  - name = text before the first " — " (spaced dash); long parentheticals
 *    are stripped, short ones (e.g. "(low-fat)") kept;
 *  - ⚠️ anywhere on the line → `warn` (sodium/label caution);
 *  - ⏰ or membership in the USE-FIRST section → `useFirst`;
 *  - struck-through items (~~used up~~) are skipped;
 *  - only an allowlist of sections exports — shopping list, equipment
 *    notes, and history sections never leave the file.
 */

import type { PantrySection } from '../src/types/pantry';

export type { PantryItem, PantrySection } from '../src/types/pantry';

/** Section headings we export, in display order, with app-facing titles. */
const SECTIONS: { re: RegExp; title: string; splitCommas?: boolean }[] = [
  { re: /use-first/i, title: 'Use first' },
  { re: /^staples/i, title: 'Staples' },
  { re: /^spices/i, title: 'Spices & flavor', splitCommas: true },
  { re: /^fresh herbs/i, title: 'Herbs' },
  { re: /^fridge/i, title: 'Fridge' },
  { re: /^freezer/i, title: 'Freezer' },
];

type SectionDef = (typeof SECTIONS)[number];

export function parsePantry(markdown: string): PantrySection[] {
  const source = markdown.replace(/<!--[\s\S]*?-->/g, '');
  const sections: PantrySection[] = [];
  let current: PantrySection | null = null;
  let currentDef: SectionDef | null = null;
  let subsection = '';

  for (const line of joinWrappedLines(source.split('\n'))) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      const name = heading[1].replace(/[⏰⚠️🛒]/gu, '').trim();
      const found = SECTIONS.find((s) => s.re.test(name)) ?? null;
      subsection = '';
      currentDef = found;
      current = found ? { title: found.title, items: [] } : null;
      if (current) sections.push(current);
      continue;
    }
    if (!current || !currentDef) continue;

    // Bold-only lines inside a section are subsections ("**Dairy**" in Fridge).
    const sub = line.match(/^\*\*([^*]+)\*\*\s*$/);
    if (sub) {
      subsection = sub[1].trim();
      continue;
    }

    const item = line.match(/^(?:-|\d+\.)\s+(.*)$/);
    if (!item) continue;
    const raw = item[1];
    if (raw.startsWith('[')) continue; // checkbox lines live in skipped sections; be safe
    if (/^~~.*~~/.test(raw.trim())) continue; // used up

    const def = currentDef;
    const target = subsection ? ensureSection(sections, `${def.title} · ${subsection}`) : current;

    for (const name of splitItems(raw, def.splitCommas)) {
      target.items.push({
        name,
        warn: raw.includes('⚠️'),
        useFirst: def.title === 'Use first' || raw.includes('⏰'),
      });
    }
  }

  // Drop the parent "Fridge" shell if everything landed in subsections.
  return sections.filter((s) => s.items.length > 0);
}

function ensureSection(sections: PantrySection[], title: string): PantrySection {
  const existing = sections.find((s) => s.title === title);
  if (existing) return existing;
  const created: PantrySection = { title, items: [] };
  sections.push(created);
  return created;
}

/** Indented continuations fold into the line above (same rule as recipes). */
function joinWrappedLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^\s/.test(line) && out.length > 0 && !/^#/.test(out[out.length - 1])) {
      out[out.length - 1] += ` ${line.trim()}`;
    } else {
      out.push(line.trimEnd());
    }
  }
  return out;
}

function splitItems(raw: string, splitCommas = false): string[] {
  // Order matters: long parentheticals are prose and can hide dashes
  // ("Eggs (4 used… — check carton)"), so strip them before cutting.
  // Short ones ("(low-fat)") are part of the name.
  let head = raw.replace(/\s*\(([^)]{26,})\)/g, '');
  // Annotation prose starts at a spaced dash OR at a flag emoji
  // ("Ketchup ⚠️ accent only" has no dash).
  head = head.split(/\s—\s/)[0];
  head = head.split(/[⚠⏰]/u)[0];
  head = head.replace(/[️★✅🌿]/gu, '');
  // Comma-splitting is for list-lines ("cumin, paprika, oregano, …"), not
  // names that merely contain a comma ("Capers, jar").
  const parts =
    splitCommas && (head.match(/,/g)?.length ?? 0) >= 3 ? head.split(/[·,]/) : head.split('·');
  return parts
    .map((p) => p.replace(/\*\*/g, '').replace(/~~.*~~/g, '').trim().replace(/[:;,]$/, ''))
    .filter((p) => p.length > 1);
}
