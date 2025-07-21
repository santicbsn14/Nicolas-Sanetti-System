import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['Source/**/*.ts'],
      exclude: [
        'Source/**/*.test.ts',
        'Source/**/*.spec.ts',
        'Source/**/*.d.ts',
        'node_modules/**',
      ],
    },
  },})
