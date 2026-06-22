import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
  // Don't use the @dcloudio/vite-plugin-uni — pure logic tests don't need it
})
