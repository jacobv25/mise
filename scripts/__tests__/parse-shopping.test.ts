import { parseShopping } from '../parse-shopping';

/** Shaped like the real pantry.md — the shopping list is one section deep in a larger file. */
const PANTRY_MD = `# Pantry

_Last updated: prose that must not export._

> **🛒 SHOPPING TRIP NEEDED:** banner prose.

## Staples (shelf)
- Olive oil (extra-virgin) — carryover

## Running shopping list
- [ ] **Half-sheet pan** (correction: the "bought" note was wrong — never owned)
- [ ] **Eggs, 1 dozen** (carton likely empty; the fry rep is waiting on these
  too)
- [ ] Garlic powder + onion powder (still out — jarred chopped garlic covering meanwhile)
- [ ] Caraway seeds (optional)
- [ ] 8" nonstick egg pan (optional, ~$15 — easy-mode fried eggs)
- [x] ~~Rosemary~~ — solved with a live plant 🌿

## Gone / unaccounted since last inventory
- Salmon, lime crema — history prose that must not export.
`;

describe('parseShopping', () => {
  const sections = parseShopping(PANTRY_MD);
  const [kitchen] = sections;

  test('exports only the running shopping list, as one section', () => {
    expect(sections).toHaveLength(1);
    expect(kitchen.title).toBe('Kitchen run');
    const json = JSON.stringify(sections);
    expect(json).not.toContain('Olive oil');
    expect(json).not.toContain('Salmon');
    expect(json).not.toContain('SHOPPING TRIP');
  });

  test('bold names keep their annotation as detail, wrapped lines fold in', () => {
    expect(kitchen.items[0]).toEqual({
      name: 'Half-sheet pan',
      detail: 'correction: the "bought" note was wrong — never owned',
      optional: false,
    });
    expect(kitchen.items[1].name).toBe('Eggs, 1 dozen');
    expect(kitchen.items[1].detail).toContain('the fry rep is waiting on these too');
  });

  test('plain lines cut at the first parenthetical', () => {
    expect(kitchen.items[2]).toEqual({
      name: 'Garlic powder + onion powder',
      detail: 'still out — jarred chopped garlic covering meanwhile',
      optional: false,
    });
  });

  test('"(optional…)" flags the item and is trimmed from the detail', () => {
    const caraway = kitchen.items.find((i) => i.name === 'Caraway seeds');
    expect(caraway).toEqual({ name: 'Caraway seeds', optional: true });
    const eggPan = kitchen.items.find((i) => i.name === '8" nonstick egg pan');
    expect(eggPan?.optional).toBe(true);
    expect(eggPan?.detail).toBe('~$15 — easy-mode fried eggs');
  });

  test('checked items are bought — they stay out of the list', () => {
    expect(JSON.stringify(kitchen.items)).not.toContain('Rosemary');
  });
});
