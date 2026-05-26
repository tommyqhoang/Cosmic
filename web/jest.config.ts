import type { Config } from 'jest'
import nextJest from 'next/jest.js'

// next/jest wires up SWC transforms, tsconfig path aliases (@/*), and env so
// tests transpile exactly like the app does.
const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  // jsdom by default for component tests; API/lib tests opt into node via a
  // `@jest-environment node` docblock at the top of the file.
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts', '<rootDir>/__tests__/**/*.test.tsx'],
  // E2E lives under e2e/ and is run by Playwright, not Jest.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/', '<rootDir>/.next/'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  clearMocks: true,
  collectCoverageFrom: [
    'app/api/**/*.ts',
    'lib/**/*.ts',
    'components/**/*.tsx',
    '!**/*.d.ts',
  ],
}

export default createJestConfig(config)
