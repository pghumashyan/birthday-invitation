import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative asset paths, so the same build works at BOTH
  //   https://pghumashyan.github.io/birthday-invitation/   (project URL)
  //   https://your-domain.com/                             (custom domain)
  // An absolute '/' base breaks the project URL, and '/birthday-invitation/'
  // breaks the custom domain. './' needs no change when the domain goes live.
  // Safe here because this is a single page with no client-side routing.
  base: './',
  plugins: [react(), tailwindcss()],
})
