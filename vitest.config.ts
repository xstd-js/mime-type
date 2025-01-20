import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: 'src',
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/types/**/*.ts'],
      thresholds: {
        100: true,
      },
    },
  },
});
