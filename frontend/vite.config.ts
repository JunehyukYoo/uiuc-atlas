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
        // `import * as L` makes L.WebGLHeatMap a named import binding — rolldown
        // forbids assigning to it. Assigning the namespace to a local `const L`
        // makes property mutations plain object assignments in rolldown's view,
        // while still mutating the same shared leaflet object at runtime.
        return `import * as _leaflet from 'leaflet';\nconst L = _leaflet;\n${code}`;
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
