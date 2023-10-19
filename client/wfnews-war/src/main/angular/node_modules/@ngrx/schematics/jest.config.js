"use strict";
exports.__esModule = true;
/* eslint-disable */
exports["default"] = {
    displayName: 'Schematics',
    preset: '../../jest.preset.js',
    coverageDirectory: '../../coverage/modules/schematics',
    globals: { 'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' } },
    testEnvironment: 'node',
    transformIgnorePatterns: ['node_modules/(?!@angular|tslib)'],
    moduleNameMapper: {
        tslib: '<rootDir>/../../node_modules/tslib/tslib.js'
    }
};
//# sourceMappingURL=jest.config.js.map