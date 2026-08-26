import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Remote-DB suites (Neon pooler) occasionally exceed the 5s default.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
})
