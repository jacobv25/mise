import { parsePantry } from '../parse-pantry';

/** Synthetic, but every trap here exists in the real pantry.md. */
const PANTRY = `# Pantry

_Last updated: yesterday_

> **🛒 SHOPPING TRIP NEEDED:** ignore this banner.

## ⏰ USE-FIRST (owner-flagged, in rough priority order)
1. **Zucchini ×1** (second one went into last week's dinner)
2. **Frozen chicken breasts** — "use them or they live in the freezer forever"

## Staples (shelf)
- Olive oil (extra-virgin) — carryover
- Ketchup ⚠️ accent only
- Eggs (4 used last week — count still unknown; check carton)
- Canned beans: white beans ×1, cannellini ×1 — check labels; rinse
  if salted

## Spices & flavor builders (low-sodium toolkit)
- Ground cumin, smoked paprika, dried oregano, chili flakes,
  cinnamon (briefly presumed lost, found again)
- Capers, jar (new) ⚠️ ~250 mg sodium/tbsp — rinse well

## Fridge
**Dairy**
- Milk (low-fat) · plain yogurt · kefir (new)

**Protein**
- ~~Ground turkey~~ — all used up
- **Leftover stew, 3 banked portions** (made recently, fridge — this week's lunches; reheat gently)

## Freezer
- **Ham hock ×1** ⏰ — ⚠️ cured/smoked = serious sodium. The sanctioned play: one hock in a big pot.
- Chocolate ice cream ⚠️ chocolate = rich + sat fat — small-bowl treat

## Running shopping list
- [ ] Corn tortillas, lowest-sodium brand
- [ ] Canned tuna, no-salt-added
`;

const sections = parsePantry(PANTRY);
const byTitle = Object.fromEntries(sections.map((s) => [s.title, s]));
const names = (title: string) => byTitle[title]?.items.map((i) => i.name);

describe('parsePantry', () => {
  test('exports only allowlisted sections — no shopping list, no banner', () => {
    expect(Object.keys(byTitle)).toEqual([
      'Use first',
      'Staples',
      'Spices & flavor',
      'Fridge · Dairy',
      'Fridge · Protein',
      'Freezer',
    ]);
  });

  test('names drop annotations after dashes and long parentheticals', () => {
    expect(names('Use first')).toEqual(['Zucchini ×1', 'Frozen chicken breasts']);
    expect(names('Staples')).toContain('Olive oil (extra-virgin)');
    expect(names('Staples')).toContain('Eggs');
  });

  test('⚠️ without a dash still cuts the annotation and sets warn', () => {
    const ketchup = byTitle['Staples'].items.find((i) => i.name === 'Ketchup');
    expect(ketchup).toBeDefined();
    expect(ketchup!.warn).toBe(true);
  });

  test('· splits multi-item lines; bold subsections become their own sections', () => {
    expect(names('Fridge · Dairy')).toEqual(['Milk (low-fat)', 'plain yogurt', 'kefir (new)']);
  });

  test('comma-splits real list-lines but not names containing a comma', () => {
    expect(names('Spices & flavor')).toEqual(
      expect.arrayContaining(['Ground cumin', 'smoked paprika', 'dried oregano', 'cinnamon']),
    );
    expect(names('Spices & flavor')).toContain('Capers, jar (new)');
  });

  test('struck-through (used up) items are skipped; leftovers keep their name', () => {
    expect(names('Fridge · Protein')).toEqual(['Leftover stew, 3 banked portions']);
  });

  test('use-first flags: whole section and inline ⏰', () => {
    expect(byTitle['Use first'].items.every((i) => i.useFirst)).toBe(true);
    const hock = byTitle['Freezer'].items.find((i) => i.name === 'Ham hock ×1');
    expect(hock!.useFirst).toBe(true);
    expect(hock!.warn).toBe(true);
  });

  test('privacy: annotation prose never reaches the output', () => {
    const json = JSON.stringify(sections);
    expect(json).not.toContain('sanctioned');
    expect(json).not.toContain('rich +');
    expect(json).not.toContain('sat fat');
  });
});
