import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { divIcon } from "leaflet";

import type {
  Emotion,
  SubmissionResponse,
} from "../../../../shared/schemas/submission";

import { HeatmapLayer } from "./HeatmapLayer";
import MapClickHandler from "./MapClickHandler";

import { EMOTION_META } from "../../../../shared/emotions";

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

function CampusMap({
  center,
  draftMarker,
  submissions,
  viewMode,
  activeEmotions,
  onMapClick,
  onSubmissionClick,
}: CampusMapProps) {
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
          <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"
            style="transition: transform 0.15s ease; transform-origin: bottom center;"
          >
            <path
              d="M12 2 C6 2 2 7 2 13 C2 21 12 30 12 30 C12 30 22 21 22 13 C22 7 18 2 12 2 Z"
              fill="#94a3b8"
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
        />
      )}
    </MapContainer>
  );
}

export default CampusMap;
