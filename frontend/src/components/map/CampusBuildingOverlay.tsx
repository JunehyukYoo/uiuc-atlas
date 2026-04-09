import { useRef } from "react";
import { Polygon, Tooltip } from "react-leaflet";

import L from "leaflet";
import type { SubmissionResponse } from "../../../../shared/schemas/submission";
import { EMOTION_META, EMOTIONS } from "../../../../shared/emotions";

type GeoJSONFeatureCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: { id?: string; name?: string } | null;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }[];
};

type Building = {
  id: string;
  name: string;
  positions: [number, number][]; // [lat, lng] for Leaflet
};

const buildingModules = import.meta.glob("../../assets/buildings/*.geojson", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function loadBuildings(): Building[] {
  const buildings: Building[] = [];
  for (const raw of Object.values(buildingModules)) {
    const featureCollection = JSON.parse(raw) as GeoJSONFeatureCollection;
    for (const feature of featureCollection.features) {
      if (feature.geometry.type !== "Polygon") continue;
      const props = feature.properties ?? {};
      const id = props.id ?? "unknown";
      const name = props.name ?? id;
      // GeoJSON is [lng, lat]; Leaflet expects [lat, lng]
      const positions = feature.geometry.coordinates[0].map(
        (coord) => [coord[1], coord[0]] as [number, number],
      );
      buildings.push({ id, name, positions });
    }
  }
  return buildings;
}

const CAMPUS_BUILDINGS = loadBuildings();

const BUILDING_COLOR = "#ffffff";

// Shades from dim → bright representing intensity 1 → 5
const INTENSITY_COLORS = [
  "#475569",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#f1f5f9",
];

function pointInPolygon(
  lat: number,
  lng: number,
  positions: [number, number][],
): boolean {
  let inside = false;
  for (let i = 0, j = positions.length - 1; i < positions.length; j = i++) {
    const [latI, lngI] = positions[i];
    const [latJ, lngJ] = positions[j];
    const intersect =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;
    if (intersect) inside = !inside;
  }
  return inside;
}

function IntensityPieChart({
  submissions,
}: {
  submissions: SubmissionResponse[];
}) {
  const counts = [1, 2, 3, 4, 5].map((level) => ({
    level,
    count: submissions.filter((s) => s.intensity === level).length,
    color: INTENSITY_COLORS[level - 1],
  }));

  const total = submissions.length;
  if (total === 0) return null;

  const size = 60;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  let angle = -Math.PI / 2;
  const slices = counts
    .filter(({ count }) => count > 0)
    .map(({ count, color }) => {
      const sweep = (count / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      angle += sweep;
      const x2 = cx + r * Math.cos(angle);
      const y2 = cy + r * Math.sin(angle);
      const largeArc = sweep > Math.PI ? 1 : 0;
      const d =
        count === total
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      return { d, color };
    });

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}
    >
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={slice.color} />
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {counts
          .filter(({ count }) => count > 0)
          .map(({ level, count, color }) => (
            <div
              key={level}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                Intensity {level}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--popover-foreground)",
                  paddingLeft: 8,
                }}
              >
                {count}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function getSubmissionsInBuilding(
  submissions: SubmissionResponse[],
  building: Building,
) {
  return submissions.filter((s) =>
    pointInPolygon(s.latitude, s.longitude, building.positions),
  );
}

function BuildingPolygon({
  building,
  submissions,
}: {
  building: Building;
  submissions: SubmissionResponse[];
}) {
  const polygonRef = useRef<L.Polygon | null>(null);

  const nearby = getSubmissionsInBuilding(submissions, building);
  const topEmotions = EMOTIONS.map((e) => {
    const group = nearby.filter((s) => s.emotion === e);
    const count = group.length;
    const avgIntensity =
      count > 0 ? group.reduce((sum, s) => sum + s.intensity, 0) / count : 0;
    return { emotion: e, count, avgIntensity };
  })
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <Polygon
      ref={polygonRef}
      positions={building.positions}
      pathOptions={{
        color: BUILDING_COLOR,
        fillColor: BUILDING_COLOR,
        fillOpacity: 0.08,
        weight: 1.5,
        opacity: 0.45,
      }}
      eventHandlers={{
        mouseover: () => {
          polygonRef.current?.setStyle({
            fillOpacity: 0.2,
            weight: 2,
            opacity: 0.75,
          });
        },
        mouseout: () => {
          polygonRef.current?.setStyle({
            fillOpacity: 0.08,
            weight: 1.5,
            opacity: 0.45,
          });
        },
      }}
    >
      <Tooltip sticky direction="top" offset={[0, -4]} opacity={1}>
        <div
          style={{
            minWidth: 170,
            padding: "2px 0",
            fontFamily: "var(--font-sans)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              marginBottom: nearby.length > 0 ? 8 : 0,
              color: "var(--popover-foreground)",
            }}
          >
            {building.name}
          </div>
          {nearby.length === 0 ? null : (
            <>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  marginBottom: 7,
                }}
              >
                {nearby.length} pin{nearby.length !== 1 ? "s" : ""} here
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {topEmotions.map(({ emotion, count, avgIntensity }) => (
                  <div
                    key={emotion}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: EMOTION_META[emotion].color,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--popover-foreground)",
                      }}
                    >
                      {EMOTION_META[emotion].label}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        paddingLeft: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--muted-foreground)",
                        }}
                      >
                        avg {avgIntensity.toFixed(1)}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--popover-foreground)",
                        }}
                      >
                        ×{count}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  marginTop: 8,
                  paddingTop: 2,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                    marginBottom: 2,
                  }}
                >
                  Intensity distribution
                </div>
                <IntensityPieChart submissions={nearby} />
              </div>
            </>
          )}
        </div>
      </Tooltip>
    </Polygon>
  );
}

type Props = { submissions: SubmissionResponse[] };

export function CampusBuildingOverlay({ submissions }: Props) {
  return (
    <>
      {CAMPUS_BUILDINGS.map((building) => (
        <BuildingPolygon
          key={building.id}
          building={building}
          submissions={submissions}
        />
      ))}
    </>
  );
}
