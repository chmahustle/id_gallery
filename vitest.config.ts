import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
    /* тесты сервера работают с одной тестовой базой — по очереди */
    fileParallelism: false,
  },
})
