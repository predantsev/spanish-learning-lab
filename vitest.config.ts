import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'domain', include: ['tests/domain/**/*.test.ts'], environment: 'node' } },
      { test: { name: 'contract', include: ['tests/contract/**/*.test.ts'], environment: 'node' } },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          testTimeout: 30000,
          pool: 'forks',
        },
      },
    ],
  },
});
