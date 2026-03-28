import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import MapClickHandler from "./MapClickHandler";
import type { SubmissionResponse } from "../../../../shared/schemas/submission";

type DraftMarker = {
  lat: number;
  lng: number;
} | null;

type CampusMapProps = {
  center: LatLngTuple;
  draftMarker: DraftMarker;
  submissions: SubmissionResponse[];
  onMapClick: (latlng: { lat: number; lng: number }) => void;
};

function CampusMap({
  center,
  draftMarker,
  submissions,
  onMapClick,
}: CampusMapProps) {
  const maxBounds: LatLngTuple[] = [
    [center["0"] - 0.02, center["1"] - 0.02],
    [center["0"] + 0.02, center["1"] + 0.02],
  ];
  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
      minZoom={14}
      maxZoom={18}
      maxBounds={maxBounds}
    >
      <TileLayer
        // attribution="&copy; OpenStreetMap contributors"
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
      />

      <MapClickHandler onSelect={onMapClick} />

      {draftMarker && (
        <Marker position={[draftMarker.lat, draftMarker.lng]}>
          <Popup>Draft submission</Popup>
        </Marker>
      )}
      {submissions.map((submission) => (
        <Marker
          key={submission.id}
          position={[submission.latitude, submission.longitude]}
        >
          <Popup>
            <div>
              <p>
                <strong>{submission.emotion}</strong>
              </p>
              <p>Intensity: {submission.intensity}</p>
              {submission.reflection && <p>{submission.reflection}</p>}
              {submission.tag && <p>{submission.tag.label}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default CampusMap;
