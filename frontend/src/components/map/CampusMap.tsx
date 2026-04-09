import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L, { divIcon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import type {
  Emotion,
  SubmissionResponse,
} from "../../../../shared/schemas/submission";

import { HeatmapLayer } from "./HeatmapLayer";
import { CampusBuildingOverlay } from "./CampusBuildingOverlay";
import MapClickHandler from "./MapClickHandler";

import { EMOTION_META } from "../../../../shared/emotions";
import { type HeatmapConfig } from "@/components/sidebar/HeatmapControls";

type DraftMarker = {
  lat: number;
  lng: number;
} | null;

type CampusMapProps = {
  center: LatLngTuple;
  draftMarker: DraftMarker;
  submissions: SubmissionResponse[];
  viewMode: "pins" | "heatmap";
  activeEmotions: Set<Emotion>;
  heatmapConfig: HeatmapConfig;
  onMapClick: (latlng: LatLngTuple) => void;
  onSubmissionClick: (submission: SubmissionResponse) => void;
};

function createEmotionIcon(emotion: Emotion) {
  const color = EMOTION_META[emotion].color;
  const id = `pin-${emotion}`;
  return divIcon({
    className: "",
    html: `
      <style>
        #${id}:hover svg {
          transform: scale(1.3);
          filter: brightness(1.2) drop-shadow(0 2px 6px ${color}99);
        }
      </style>
      <div id="${id}" style="width: 24px; height: 32px; cursor: pointer;">
        <svg
          width="24" height="32" viewBox="0 0 24 32"
          xmlns="http://www.w3.org/2000/svg"
          style="transition: transform 0.15s ease, filter 0.15s ease; transform-origin: bottom center;"
        >
          <path
            d="M12 2 C6 2 2 7 2 13 C2 21 12 30 12 30 C12 30 22 21 22 13 C22 7 18 2 12 2 Z"
            fill="${color}"
            stroke="white"
            stroke-width="1.5"
          />
          <circle cx="12" cy="13" r="4" fill="white" opacity="0.4"/>
        </svg>
      </div>
    `,
    iconSize: [24, 32],
    iconAnchor: [12, 30],
    popupAnchor: [0, -32],
  });
}

// LEAFLET MAP CONFIG
export const MIN_ZOOM = 15;
export const MAX_ZOOM = 18;

function BuildingOverlayToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  const map = useMap();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const control = L.control({ position: "topright" });
    let el: HTMLElement;
    control.onAdd = () => {
      el = L.DomUtil.create("div");
      L.DomEvent.disableClickPropagation(el);
      return el;
    };
    control.addTo(map);
    setContainer(el!);
    return () => { control.remove(); };
  }, [map]);

  if (!container) return null;

  return createPortal(
    <div className="leaflet-bar">
      <a
        href="#"
        role="button"
        title={show ? "Hide building overlay" : "Show building overlay"}
        onClick={(e) => { e.preventDefault(); e.currentTarget.blur(); onToggle(); }}
        style={{
          width: 30,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 1,
          background: show ? "var(--card-foreground)" : undefined,
          color: show ? "var(--card)" : undefined,
          transition: "background 0.15s ease, color 0.15s ease",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="12.01" />
          <line x1="12" y1="16" x2="12" y2="16.01" />
          <line x1="8"  y1="12" x2="8"  y2="12.01" />
          <line x1="8"  y1="16" x2="8"  y2="16.01" />
          <line x1="16" y1="12" x2="16" y2="12.01" />
          <line x1="16" y1="16" x2="16" y2="16.01" />
        </svg>
      </a>
    </div>,
    container,
  );
}

function CampusMap({
  center,
  draftMarker,
  submissions,
  viewMode,
  activeEmotions,
  heatmapConfig,
  onMapClick,
  onSubmissionClick,
}: CampusMapProps) {
  const [showBuildingOverlay, setShowBuildingOverlay] = useState(true);
  const maxBounds: LatLngTuple[] = [
    [center["0"] - 0.02, center["1"] - 0.02],
    [center["0"] + 0.02, center["1"] + 0.02],
  ];
  const jawgAccessToken = import.meta.env.VITE_JAWG_ACCESS_TOKEN;
  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: "100%", width: "100%", overflow: "hidden" }}
      scrollWheelZoom
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={maxBounds}
    >
      <TileLayer
        // attribution="&copy; OpenStreetMap contributors"
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        url={`https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=${jawgAccessToken}`}
      />
      <MapClickHandler
        onSelect={(latlng) => onMapClick([latlng.lat, latlng.lng])}
      />

      {/* Pins mode: show markers for each submission + draft marker */}
      {viewMode === "pins" && draftMarker && (
        <Marker
          position={[draftMarker.lat, draftMarker.lng]}
          icon={divIcon({
            className: "",
            html: `
        <div style="width: 24px; height: 32px; cursor: pointer;">
          <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2 C6 2 2 7 2 13 C2 21 12 30 12 30 C12 30 22 21 22 13 C22 7 18 2 12 2 Z"
              fill="#64748b"
              fill-opacity="0.8"
              stroke="white"
              stroke-width="1.5"
              stroke-dasharray="3.5 2.5"
            />
            <line x1="9" y1="13" x2="15" y2="13" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="12" y1="10" x2="12" y2="16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      `,
            iconSize: [24, 32],
            iconAnchor: [12, 30],
            popupAnchor: [0, -32],
          })}
        />
      )}
      {viewMode === "pins" && (
        <MarkerClusterGroup
          chunkedLoading
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction={(cluster: any) => {
            return divIcon({
              className: "",
              html: `<div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #ffffff22;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 13px;
          font-weight: 500;
          backdrop-filter: blur(4px);
        ">${cluster.getChildCount()}</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
          }}
        >
          {submissions.map((submission) => (
            <Marker
              key={submission.id}
              position={[submission.latitude, submission.longitude]}
              icon={createEmotionIcon(submission.emotion as Emotion)}
              eventHandlers={{
                click() {
                  onSubmissionClick(submission);
                },
              }}
            />
          ))}
        </MarkerClusterGroup>
      )}

      {/* Heatmap mode: show heatmap layer */}
      {viewMode === "heatmap" && (
        <HeatmapLayer
          submissions={submissions}
          activeEmotions={activeEmotions}
          config={heatmapConfig}
        />
      )}

      {/* Building overlay toggle control */}
      <BuildingOverlayToggle
        show={showBuildingOverlay}
        onToggle={() => setShowBuildingOverlay((v) => !v)}
      />

      {/* Building overlays: visible in both modes */}
      {showBuildingOverlay && <CampusBuildingOverlay submissions={submissions} />}
    </MapContainer>
  );
}

export default CampusMap;
