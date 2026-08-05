/**
 * Postinstall: `assets/data/recipes.json` is a gitignored build artifact
 * (see scripts/export-data.ts), but the app imports it statically — so a
 * fresh clone needs *something* there before Metro can bundle. Seed it from
 * the committed sample; a later `npm run export-data` overwrites it with
 * real data.
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'assets', 'data');

for (const name of ['recipes', 'pantry', 'bar']) {
  const real = path.join(dataDir, `${name}.json`);
  const sample = path.join(dataDir, `${name}.sample.json`);
  if (!fs.existsSync(real)) {
    fs.copyFileSync(sample, real);
    console.log(`assets/data/${name}.json seeded from sample dataset`);
  }
}
