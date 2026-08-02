/**
 * Markdown → Recipe parser for the `~/cooking` workspace files.
 *
 * The authoritative contract is the machine-readable comment block at the
 * bottom of `~/cooking/recipes/TEMPLATE.md`. In short:
 *  - headings keyed on "## Nutrition" / "## Mise en place" / "## Steps"
 *    (case-insensitive, suffixes allowed);
 *  - bowl lines use circled digits ①②③…, and the paren arrow group must
 *    contain "step N" — the first "step N" after the "→" is the target;
 *  - nutrition = first number after "**Sodium:**" / "**Protein:**";
 *  - heat tokens are ALL-CAPS from a fixed set, found inside the bold
 *    step lead-in (plus lowercase "no heat").
 *
 * Pure function, no filesystem access — `export-data.ts` does the I/O.
 * Personal/health content (Personal notes, personal-notes lines, sodium
 * rationale) is excluded by construction: this parser only extracts an
 * allowlist of fields and never copies whole sections through.
 */

import type { Bowl, Recipe, RecipeStatus, StationExtra, Step } from '../src/types/recipe';

const CIRCLED_DIGITS = '①②③④⑤⑥⑦⑧⑨⑩';

// Order matters: longer tokens first so MEDIUM-HIGH wins over MEDIUM/HIGH.
const HEAT_TOKEN_RE =
  /OVEN\s+\d+\s*°?F|MEDIUM-HIGH|MEDIUM-LOW|OFF HEAT|MEDIUM|HIGH|LOW|no heat/;

const SECTION_KEYS = [
  { key: 'nutrition', re: /^##\s*nutrition/i },
  { key: 'mise', re: /^##\s*mise en place/i },
  { key: 'steps', re: /^##\s*steps/i },
  { key: 'ingredients', re: /^##\s*ingredients/i },
] as const;

type SectionKey = (typeof SECTION_KEYS)[number]['key'];

export interface ParseResult {
  recipe: Recipe;
  warnings: string[];
}

export function parseRecipe(
  markdown: string,
  { id, status }: { id: string; status: RecipeStatus },
): ParseResult {
  const warnings: string[] = [];
  const warn = (msg: string) => warnings.push(`${id}: ${msg}`);

  // Comments can hold anything (template examples, dietary references) — drop them first.
  const source = markdown.replace(/<!--[\s\S]*?-->/g, '');

  const title = source.match(/^#\s+(.+)$/m)?.[1].trim() ?? id;
  if (title === id) warn('no "# Title" heading found, using filename');

  const cuisine = matchMetaBullet(source, 'Cuisine');
  const sourceAttribution = matchMetaBullet(source, 'Source');
  let time: string | null = null;
  let serves: string | null = null;
  const timeLine = matchMetaBullet(source, 'Time');
  if (timeLine) {
    const [timePart, servesPart] = timeLine.split(/\*\*Serves:\*\*/);
    time = timePart.trim() || null;
    serves = servesPart?.trim() ?? null;
  }

  const sections = bucketSections(source);

  // Nutrition — numbers only; the rationale/health lines in the same
  // section are deliberately never extracted.
  const nutritionText = (sections.nutrition ?? []).join('\n');
  const sodiumMg = firstNumberAfter(nutritionText, /\*\*Sodium:\*\*/);
  const proteinG = firstNumberAfter(nutritionText, /\*\*Protein:\*\*/);
  const calories = firstNumberAfter(nutritionText, /\*\*Calories:\*\*/);
  if (sodiumMg === null) warn('no machine-readable "**Sodium:**" value');
  if (proteinG === null) warn('no machine-readable "**Protein:**" value');

  const { tools, bowls, stationExtras } = parseMise(sections.mise ?? [], warn);
  const steps = parseSteps(sections.steps ?? [], warn);
  const ingredients = parseIngredients(sections.ingredients ?? []);

  const stepNumbers = new Set(steps.map((s) => s.number));
  for (const bowl of bowls) {
    if (bowl.targetStep !== null && !stepNumbers.has(bowl.targetStep)) {
      warn(`Bowl ${bowl.index} targets step ${bowl.targetStep}, which is not a numbered step`);
    }
  }

  return {
    recipe: {
      id,
      title,
      status,
      cuisine,
      time,
      serves,
      source: sourceAttribution,
      sodiumMg,
      proteinG,
      calories,
      tools,
      bowls,
      stationExtras,
      ingredients,
      steps,
    },
    warnings,
  };
}

function matchMetaBullet(source: string, label: string): string | null {
  return source.match(new RegExp(`^-\\s*\\*\\*${label}:\\*\\*\\s*(.+)$`, 'm'))?.[1].trim() ?? null;
}

/** Collect the lines under each heading the contract keys on; other sections are ignored. */
function bucketSections(source: string): Partial<Record<SectionKey, string[]>> {
  const sections: Partial<Record<SectionKey, string[]>> = {};
  let current: string[] | null = null;
  for (const line of source.split('\n')) {
    if (/^#{1,6}\s/.test(line)) {
      const match = SECTION_KEYS.find((s) => s.re.test(line));
      current = match ? (sections[match.key] = []) : null;
    } else if (current) {
      current.push(line);
    }
  }
  return sections;
}

/**
 * Rejoin soft-wrapped list items: a line that doesn't start a new bullet,
 * numbered item, or bold-label paragraph continues the previous item.
 */
function joinItems(lines: string[]): string[] {
  const items: string[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    // Anchored on the raw line: indented (or plain-text) wrap lines fail
    // the test and are folded into the item above.
    const startsNew = /^(-\s|\d+\.\s|\*\*)/.test(line);
    if (startsNew || items.length === 0) {
      items.push(line.trim());
    } else {
      items[items.length - 1] += ` ${line.trim()}`;
    }
  }
  return items;
}

function firstNumberAfter(text: string, marker: RegExp): number | null {
  const m = marker.exec(text);
  if (!m) return null;
  const rest = text.slice(m.index + m[0].length);
  const num = rest.match(/\d[\d,]*(?:\.\d+)?/);
  return num ? Number(num[0].replace(/,/g, '')) : null;
}

function stripBold(text: string): string {
  return text.replace(/\*\*/g, '').trim();
}

function splitDotList(text: string): string[] {
  return text
    .split('·')
    .map((item) => stripBold(item))
    .filter(Boolean);
}

function parseMise(
  lines: string[],
  warn: (msg: string) => void,
): { tools: string[]; bowls: Bowl[]; stationExtras: StationExtra[] } {
  const tools: string[] = [];
  const bowls: Bowl[] = [];
  const stationExtras: StationExtra[] = [];

  for (const item of joinItems(lines)) {
    const toolsMatch = item.match(/^\*\*Tools[^:]*:\*\*\s*(.*)$/i);
    if (toolsMatch) {
      tools.push(...splitDotList(toolsMatch[1]));
      continue;
    }

    const bowlMatch = item.match(/^-\s*\*\*Bowl\s*([①②③④⑤⑥⑦⑧⑨⑩])\s*[—–-]\s*(.+?):\*\*\s*(.*)$/);
    if (bowlMatch) {
      const [, digit, label, itemsText] = bowlMatch;
      const index = CIRCLED_DIGITS.indexOf(digit) + 1;
      const arrowGroup = label.match(/\(([^()]*→[^()]*)\)/);
      const name = stripBold(
        (arrowGroup ? label.replace(arrowGroup[0], ' ') : label).replace(/\s+/g, ' ').trim(),
      ).replace(/[,;]$/, '');
      let arrowText = '';
      let targetStep: number | null = null;
      if (arrowGroup) {
        arrowText = arrowGroup[1].trim();
        // The target is the first "step N" after the arrow itself; fall back
        // to the first "step N" anywhere in the group.
        const afterArrow = arrowText.slice(arrowText.indexOf('→') + 1);
        targetStep = firstStepNumber(afterArrow) ?? firstStepNumber(arrowText);
      }
      if (targetStep === null) {
        warn(`Bowl ${index} ("${name}") has no "step N" target in its arrow text`);
      }
      bowls.push({ index, name, arrowText, targetStep, items: splitDotList(itemsText) });
      continue;
    }

    // Non-bowl station cards: "- **Stove-side:**", "- **Side/garnish plate (→ step 8):**", …
    const extraMatch = item.match(/^-\s*\*\*([^:]+?):\*\*\s*(.*)$/);
    if (extraMatch) {
      const [, rawLabel, itemsText] = extraMatch;
      const arrowGroup = rawLabel.match(/\(([^()]*)\)/);
      const label = stripBold(
        (arrowGroup ? rawLabel.replace(arrowGroup[0], ' ') : rawLabel).replace(/\s+/g, ' ').trim(),
      );
      const arrowText = arrowGroup ? arrowGroup[1].replace(/^→\s*/, '').trim() : null;
      stationExtras.push({ label, arrowText, items: splitDotList(itemsText) });
    }
  }

  return { tools, bowls, stationExtras };
}

function firstStepNumber(text: string): number | null {
  const m = text.match(/step\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

function parseSteps(lines: string[], warn: (msg: string) => void): Step[] {
  const steps: Step[] = [];
  for (const item of joinItems(lines)) {
    const stepMatch = item.match(/^(\d+)\.\s+(.*)$/);
    if (!stepMatch) continue;
    const number = Number(stepMatch[1]);
    const text = stepMatch[2].trim();
    const leadIn = text.match(/^\*\*(.+?)\*\*/)?.[1].trim() ?? null;
    // The token lives inside the bold lead-in, not bolded alone.
    const heat = leadIn?.match(HEAT_TOKEN_RE)?.[0].replace(/\s+/g, ' ') ?? null;
    steps.push({ number, text, leadIn, heat });
  }
  if (steps.length === 0) warn('no numbered steps found');
  return steps;
}

function parseIngredients(lines: string[]): string[] {
  return joinItems(lines)
    .filter((item) => item.startsWith('- '))
    .map((item) => stripBold(item.slice(2)));
}
