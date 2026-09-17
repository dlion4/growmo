import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tanstackStart(), viteReact()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    // Allow Arena/E2B live-preview proxy hosts
    allowedHosts: true as unknown as string[],
  },
})

export default config
