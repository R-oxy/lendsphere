/**
 * @file cucumber.js
 * @description Cucumber configuration file for BDD tests.
 * Uses ESM syntax (export default) to match the project's "type": "module".
 * Specifies the location of feature files and uses "import" for step definitions.
 */

export default {
  paths: ['tests/features/*.feature'],
  import: ['tests/steps/*.ts'],
  format: ['progress', 'html:cucumber-report.html'],
  publishQuiet: true,
};
