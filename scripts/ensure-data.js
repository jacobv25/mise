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
const real = path.join(dataDir, 'recipes.json');
const sample = path.join(dataDir, 'recipes.sample.json');

if (!fs.existsSync(real)) {
  fs.copyFileSync(sample, real);
  console.log('assets/data/recipes.json seeded from sample dataset');
}
