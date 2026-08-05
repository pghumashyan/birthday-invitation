import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Custom domain on GitHub Pages -> site lives at the root.
  // If you ever deploy to username.github.io/birthday instead, change this to '/birthday/'.
  base: '/',
  plugins: [react(), tailwindcss()],
})
