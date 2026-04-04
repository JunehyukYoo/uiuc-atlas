import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { SubmissionResponse } from "../../../../shared/schemas/submission";
import { EMOTION_META } from "../../../../shared/emotions";
import type { HeatmapConfig } from "@/components/sidebar/HeatmapControls";

// Build a 256x1 gradient canvas for an emotion:
// intensity 0 → washed-out color, intensity 1 → full color
function buildGradientCanvas(
  r: number,
  g: number,
  b: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(
    0,
    `rgb(${Math.round(r * 0.4)},${Math.round(g * 0.4)},${Math.round(b * 0.4)})`,
  );
  grad.addColorStop(1, `rgb(${r},${g},${b})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1);
  return canvas;
}

const GRADIENT_CANVASES = Object.fromEntries(
  Object.entries(EMOTION_META).map(([slug, { color }]) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return [slug, buildGradientCanvas(r, g, b)];
  }),
);

type Props = {
  submissions: SubmissionResponse[];
  activeEmotions: Set<string>;
  config: HeatmapConfig;
};

async function ensureHeatmapPluginLoaded() {
  if (typeof window === "undefined") return;

  window.L = L;

  await import("leaflet-webgl-heatmap/src/webgl-heatmap/webgl-heatmap.js");
  await import("leaflet-webgl-heatmap");

  if (typeof L.webGLHeatmap !== "function") {
    throw new Error("leaflet-webgl-heatmap failed to register on Leaflet");
  }
}

export function HeatmapLayer({ submissions, activeEmotions, config }: Props) {
  const map = useMap();
  const layersRef = useRef<Record<string, L.WebGLHeatMap>>({});

  useEffect(() => {
    let cancelled = false;

    async function init() {
      await ensureHeatmapPluginLoaded();
      if (cancelled) return;

      const grouped: Record<string, [number, number, number][]> = {};
      for (const s of submissions) {
        (grouped[s.emotion] ??= []).push([
          s.latitude,
          s.longitude,
          (s.intensity - 1) / 4,
        ]);
      }

      Object.values(layersRef.current).forEach((l) => l.remove());
      layersRef.current = {};

      for (const slug of Object.keys(EMOTION_META)) {
        const layer = L.webGLHeatmap({
          size: config.sizeMeters,
          units: "m",
          opacity: config.opacity,
          alphaRange: config.alphaRange,
          gradientTexture: GRADIENT_CANVASES[slug],
          autoresize: true,
        });

        layer.setData(grouped[slug] ?? []);
        layersRef.current[slug] = layer;

        if (activeEmotions.has(slug)) {
          layer.addTo(map);
        }
      }
    }

    init().catch((err) => {
      console.error("Heatmap init failed:", err);
    });

    return () => {
      cancelled = true;
      Object.values(layersRef.current).forEach((l) => l.remove());
      layersRef.current = {};
    };
  }, [map, submissions, activeEmotions, config]);

  return null;
}
