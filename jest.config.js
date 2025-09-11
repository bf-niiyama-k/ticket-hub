/** @type {import('jest').Config} */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: './',
})

const customJestConfig = {
  // テスト環境をjsdomに設定（React用）
  testEnvironment: 'jsdom',

  // セットアップファイルを指定
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // モジュールパスのマッピング（Next.jsの@エイリアス対応）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },

  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js|jsx)',
    '**/*.(test|spec).+(ts|tsx|js|jsx)',
  ],

  // カバレッジ設定
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/globals.css',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // カバレッジプロバイダー
  coverageProvider: 'v8',

  // 無視するパス
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],

  // 変換無視パターン
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$|@supabase))',
  ],

  // モジュールディレクトリ
  moduleDirectories: ['node_modules', '<rootDir>/'],

  // タイムアウト設定
  testTimeout: 10000,

  // 詳細出力
  verbose: true,
}

module.exports = createJestConfig(customJestConfig)
