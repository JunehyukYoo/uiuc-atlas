// leaflet-webgl-heatmap uses the global `L` variable (no module imports).
// In production Rollup bundles, `L` in that plugin becomes window.L,
// which is never set by Leaflet's ESM build. We set it here.
// This file must be imported BEFORE any leaflet plugin imports.
import * as L from "leaflet";
(window as unknown as { L: typeof L }).L = L;
