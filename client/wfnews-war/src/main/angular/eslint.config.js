// eslint.config.js
import angularEslintPlugin from '@angular-eslint/eslint-plugin';
import angularEslintPluginTemplate from '@angular-eslint/eslint-plugin-template';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. Global ignores
  {
    ignores: [
        "projects/**/*",
        "dist/",
        ".angular/",
        "**/node_modules/**",
    ]
  },

  // 2. Angular TypeScript compatibility configurations
  // These apply to TypeScript files and include necessary parsers, plugins.
  angularEslintPlugin.configs.ngCliCompat,
  angularEslintPlugin.configs.ngCliCompatFormattingAddOn,

  // 3. Your specific overrides and additions for TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ["tsconfig.json", "e2e/tsconfig.json"],
        createDefaultProgram: true,
      },
    },
    plugins: {
      // @angular-eslint and @typescript-eslint plugins are typically included by ngCliCompat.
      // Add other plugins explicitly if needed.
      'jsdoc': jsdocPlugin,
    },
    // Processor for handling inline templates in Angular components
    processor: angularEslintPluginTemplate.processors.inlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        { "type": "element", "style": "kebab-case" }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        { "type": "attribute", "prefix": "wfnews", "style": "camelCase" }
      ],
      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/explicit-member-accessibility": [
        "off",
        { "accessibility": "explicit" }
      ],
      "brace-style": ["error", "1tbs"],
      "id-match": "off",
      "no-trailing-spaces": "off",
      "no-underscore-dangle": "off",
      "valid-typeof": "error",
      "jsdoc/newline-after-description": "off",
    },
  },

  // 4. Configuration for files within src/stories (from stories/.eslintrc.json)
  // This assumes eslint.config.js is in 'client/wfnews-war/src/main/angular/'
  // and stories is 'client/wfnews-war/src/main/angular/src/stories/'
  {
    files: ['src/stories/**/*.ts'],
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { "disallowTypeAnnotations": false }]
    }
  },

  // 5. Angular HTML template configuration
  // This applies to HTML files.
  angularEslintPluginTemplate.configs.recommended,

  // 6. Your specific overrides for HTML files (if any)
  {
    files: ['**/*.html'],
    rules: {
      // Add any HTML-specific rule overrides here if needed.
      // Your old .eslintrc.json had an empty rules object for HTML.
    }
  }
);
