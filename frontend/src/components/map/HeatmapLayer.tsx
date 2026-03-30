import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { heatLayer, type HeatLayer } from "leaflet";
import "leaflet.heat";
import type { SubmissionResponse } from "../../../../shared/schemas/submission";
import { MAX_ZOOM } from "./CampusMap";

import { EMOTION_META } from "../../../../shared/emotions";

const EMOTION_GRADIENTS = Object.fromEntries(
  Object.entries(EMOTION_META).map(([slug, { color }]) => {
    // Convert hex to rgb components for rgba usage
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return [
      slug,
      {
        0.0: `rgba(${r},${g},${b},0)`,
        0.4: `rgba(${r},${g},${b},0.4)`,
        1.0: `rgba(${r},${g},${b},0.9)`,
      },
    ];
  }),
);

type Props = {
  submissions: SubmissionResponse[];
  activeEmotions: Set<string>; // which emotions to show
};

export function HeatmapLayer({ submissions, activeEmotions }: Props) {
  const map = useMap();
  const layersRef = useRef<Record<string, HeatLayer>>({});

  useEffect(() => {
    // Group submissions by emotion up front
    const grouped: Record<string, [number, number, number][]> = {};
    for (const s of submissions) {
      (grouped[s.emotion] ??= []).push([
        s.latitude,
        s.longitude,
        Math.pow((s.intensity - 1) / 4, 1.5), // normalize intensity to [0,1] for heatmap with curve
      ]);
    }

    // Clean up any existing layers
    Object.values(layersRef.current).forEach((l) => l.remove());
    layersRef.current = {};

    // Create each layer with data already included, add if active
    for (const [emotion, gradient] of Object.entries(EMOTION_GRADIENTS)) {
      const points = grouped[emotion] ?? [];
      const layer = heatLayer(points, {
        radius: 30,
        blur: 25,
        minOpacity: 0.5,
        maxZoom: MAX_ZOOM,
        max: 3.5, // cap intensity to avoid opaque blobs
        gradient,
      });
      layersRef.current[emotion] = layer;
      if (activeEmotions.has(emotion)) {
        layer.addTo(map);
      }
    }

    return () => {
      Object.values(layersRef.current).forEach((l) => l.remove());
    };
  }, [map, submissions, activeEmotions]);

  useEffect(() => {
    if (!map) return;

    function updateRadius() {
      const zoom = map.getZoom();
      // Convert a fixed meter radius to pixels at current zoom
      const metersPerPixel =
        (40075016.686 * Math.cos((40.1075 * Math.PI) / 180)) /
        Math.pow(2, zoom + 8);
      const radiusInPixels = Math.round(50 / metersPerPixel); // 30 = meters radius you want

      Object.values(layersRef.current).forEach((layer) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (layer as any).setOptions({ radius: radiusInPixels });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((layer as any)._map) layer.redraw();
      });
    }

    map.on("zoom", updateRadius);
    updateRadius(); // set initial radius

    return () => {
      map.off("zoom", updateRadius);
    };
  }, [map]);

  return null;
}
