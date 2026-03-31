const config: import('jest').Config = {
  preset: 'ts-jest',
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
  testEnvironment: 'jsdom',
=======
  testEnvironment: 'node',
>>>>>>> theirs
=======
  testEnvironment: 'node',
>>>>>>> theirs
=======
  testEnvironment: 'node',
>>>>>>> theirs
=======
  testEnvironment: 'node',
>>>>>>> theirs
=======
  testEnvironment: 'node',
>>>>>>> theirs
=======
  testEnvironment: 'node',
>>>>>>> theirs
=======
  testEnvironment: 'node',
>>>>>>> theirs
=======
  testEnvironment: 'node',
>>>>>>> theirs
  roots: ['<rootDir>/__tests__'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@facesmith/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@core/(.*)$': '<rootDir>/../../packages/core/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}'
  ],
  coverageDirectory: '<rootDir>/coverage',
  reporters: ['default'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.json'
      }
    ]
  }
};

export = config;
