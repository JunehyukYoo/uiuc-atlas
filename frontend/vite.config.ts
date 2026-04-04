import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { Plugin } from 'vite'

// leaflet-webgl-heatmap references `L` as a bare global with no imports.
// This plugin injects `import * as L from 'leaflet'` at the top of the
// plugin file so Rollup provides L in scope rather than looking for window.L.
function leafletGlobalPlugin(): Plugin {
  return {
    name: 'inject-leaflet-into-webgl-heatmap',
    transform(code, id) {
      if (id.includes('leaflet-webgl-heatmap')) {
        return `import * as L from 'leaflet';\n${code}`;
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [leafletGlobalPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
