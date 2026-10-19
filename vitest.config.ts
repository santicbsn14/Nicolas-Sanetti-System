import { configDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Los tests de Supertest prueban rutas del sistema de turnos que se desmontaron
    // (brief 00, ver tag v1-con-turnos) e importaban la instancia `app` de appExpress,
    // que ya no existe. Se excluyen hasta que haya rutas nuevas que testear.
    exclude: [...configDefaults.exclude, 'Source/Tests/Supertest/**'],
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
