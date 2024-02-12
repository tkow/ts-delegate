/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  globalSetup: "./jest/setup.ts",
  testEnvironment: 'node',
  collectCoverageFrom: ['src/*.ts'],
  collectCoverage: true,
};
