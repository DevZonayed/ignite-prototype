/**
 * Unit tests live beside the code as `*.spec.ts`; the end-to-end suite lives in
 * `test/` and boots the real Nest application against an in-process sql.js
 * database, so it needs no Postgres and leaves nothing behind.
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coveragePathIgnorePatterns: ['src/database/seeds/', 'src/database/migrations/'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  // The e2e suite builds a whole Nest app per file; the default 5s is not enough.
  testTimeout: 30000,
};
