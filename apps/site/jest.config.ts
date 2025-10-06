import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@core/(.*)$': '<rootDir>/../../packages/core/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}'
  ],
  coverageDirectory: '<rootDir>/coverage',
  reporters: ['default'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.json' }]
  },
};

export default config;
