import "leaflet";

declare module "leaflet" {
  interface WebGLHeatmapOptions {
    size?: number;
    units?: "m" | "px";
    opacity?: number;
    gradientTexture?: HTMLCanvasElement | HTMLImageElement | string | false;
    alphaRange?: number;
    autoresize?: boolean;
  }

  class WebGLHeatMap extends Layer {
    setData(data: [number, number, number?][]): void;
    addDataPoint(lat: number, lng: number, value: number): void;
    clear(): void;
    draw(): void;
    multiply(factor: number): void;
    addTo(map: Map | LayerGroup): this;
    remove(): this;
  }

  function webGLHeatmap(options?: WebGLHeatmapOptions): WebGLHeatMap;
}

declare module "leaflet-webgl-heatmap";
declare module "leaflet-webgl-heatmap/src/webgl-heatmap/webgl-heatmap.js";
