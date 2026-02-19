import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react()]

  if (process.env.COVERAGE) {
    const { default: istanbul } = await import('vite-plugin-istanbul')
    plugins.push(
      istanbul({
        include: 'src/**/*.{js,jsx}',
        exclude: ['node_modules', 'tests'],
        extension: ['.js', '.jsx'],
        requireEnv: false,
      })
    )
  }

  return { plugins }
})
