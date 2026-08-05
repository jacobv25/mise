import { parseBar } from '../parse-bar';

/** Synthetic, but every trap here exists in the real bar.md. */
const BAR = `# Bar

_The cocktail sibling of pantry.md — inventory + shopping list._

## Health guardrails (same spirit as the kitchen rules)
- **Moderation is the whole game** — private framing that must never export.
- **Fresh citrus always** — squeezed that day; skip bottled mixers.

## Current inventory
- **Spirits:** none yet

## Starter shopping list — Phase 1: the sour lane (regional tastes first)
One spirit + one liqueur unlocks the entire margarita/daiquiri family. ~$70–90 total.
- [ ] **Blanco tequila, 100% agave** (~$25–35 — must say "100% agave" on the label)
- [x] **Orange liqueur** (already bought last week)
- [ ] Granulated sugar IF not on shelf (simple syrup is homemade — never buy it)
- Optional add-on: **white rum** (~$18, or similar) → daiquiris, the purest
  balance-practice drink there is

## Phase 2 (later): the Italian lane
- [ ] Campari · [ ] sweet vermouth (small bottle — FRIDGE after opening, ~1 month)
- [ ] Prosecco (occasion buy) → negroni, americano, spritz — the aperitivo family

## Tools (~$30–40 covers all of it)
- [ ] **Jigger** with ¼ / ½ / ¾ / 1 / 1½ / 2 oz markings — the measuring cups of the bar
- [ ] Big-cube ice tray (2" cubes — slower melt, better drinks)
- Already owned from the kitchen: citrus squeezing, paring knife, the small pan

## Storage notes
- Spirits & liqueurs: shelf, room temp, last ~forever

---
**Note for agents:** private coordination footer, never exported.
`;

const sections = parseBar(BAR);
const byTitle = Object.fromEntries(sections.map((s) => [s.title, s]));
const names = (title: string) => byTitle[title]?.items.map((i) => i.name);

describe('parseBar', () => {
  test('exports only the shopping-run sections — no guardrails, inventory, or footer', () => {
    expect(Object.keys(byTitle)).toEqual([
      'Phase 1 · The sour lane',
      'Phase 2 · The Italian lane',
      'Tools',
    ]);
  });

  test('prose under the heading becomes the section note', () => {
    expect(byTitle['Phase 1 · The sour lane'].note).toBe(
      'One spirit + one liqueur unlocks the entire margarita/daiquiri family. ~$70–90 total.',
    );
    expect(byTitle['Tools'].note).toBeUndefined();
  });

  test('bold names keep their annotation as detail', () => {
    const tequila = byTitle['Phase 1 · The sour lane'].items[0];
    expect(tequila.name).toBe('Blanco tequila, 100% agave');
    expect(tequila.detail).toBe('~$25–35 — must say "100% agave" on the label');
  });

  test('checked items are skipped — they live in inventory now', () => {
    expect(names('Phase 1 · The sour lane')).not.toContain('Orange liqueur');
  });

  test('paren-less names cut at the first parenthetical', () => {
    const sugar = byTitle['Phase 1 · The sour lane'].items[1];
    expect(sugar.name).toBe('Granulated sugar IF not on shelf');
    expect(sugar.detail).toBe('simple syrup is homemade — never buy it');
  });

  test('optional add-on lines export with the flag and joined wrapped detail', () => {
    const rum = byTitle['Phase 1 · The sour lane'].items.find((i) => i.name === 'white rum');
    expect(rum).toBeDefined();
    expect(rum!.optional).toBe(true);
    expect(rum!.detail).toBe(
      '~$18, or similar → daiquiris, the purest balance-practice drink there is',
    );
  });

  test('· chains split into separate items; trailing prose lands in detail', () => {
    expect(names('Phase 2 · The Italian lane')).toEqual(['Campari', 'sweet vermouth', 'Prosecco']);
    const prosecco = byTitle['Phase 2 · The Italian lane'].items[2];
    expect(prosecco.detail).toBe('occasion buy → negroni, americano, spritz — the aperitivo family');
  });

  test('plain prose bullets ("Already owned…") are skipped', () => {
    expect(names('Tools')).toEqual(['Jigger', 'Big-cube ice tray']);
  });

  test('privacy: guardrail and footer prose never reaches the output', () => {
    const json = JSON.stringify(sections);
    expect(json).not.toContain('Moderation');
    expect(json).not.toContain('private framing');
    expect(json).not.toContain('Note for agents');
  });
});
