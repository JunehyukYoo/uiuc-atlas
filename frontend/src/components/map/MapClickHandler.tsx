import { useMapEvents } from "react-leaflet";

type MapClickHandlerProps = {
  onSelect: (latlng: { lat: number; lng: number }) => void;
};

function MapClickHandler({ onSelect }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default MapClickHandler;
