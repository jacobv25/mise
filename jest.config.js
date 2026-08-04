/**
 * Extends the jest-expo preset instead of using `"preset"` in package.json:
 * we need to add a CSS stub (src/constants/theme.ts imports global.css,
 * which Metro understands but jest can't parse) WITHOUT replacing the
 * preset's own moduleNameMapper for image/asset files — jest would
 * override the whole key, so we spread and extend it.
 */
const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,
  moduleNameMapper: {
    // Must precede the preset's tsconfig-path aliases: '@/global.css'
    // matches '^@/(.*)$' first otherwise, and the stub never applies.
    '\\.css$': '<rootDir>/test/css-stub.js',
    ...jestExpoPreset.moduleNameMapper,
  },
};
