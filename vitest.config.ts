import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Vitest übernimmt die Vite-Konfiguration (inkl. "@"-Alias) und ergänzt die Testumgebung.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.spec.ts'],
      exclude: [...configDefaults.exclude],
      root: fileURLToPath(new URL('./', import.meta.url)),
      // Jeden Testnamen ausgeben – im Vortrag sieht man so, WAS geprüft wird
      reporters: ['verbose'],
    },
  }),
)
