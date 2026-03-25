import { useState } from 'react';

import { Button } from '@/components/ui/button';

import api from "../api";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';

function HomePage() {
  const [status, setStatus] = useState('Dead');

  const position: LatLngTuple = [40.1075, -88.2272] // Main Quad

  return (
    <>
      <Button onClick={async () => {
            const status = await api.get('/api/health');
            if (status.data) {
              setStatus('Alive');
            } else {
              setStatus('Dead');
            }
          }}>Status: {status}</Button>
      <div style={{ height: '50vh', width: '100%' }}>
        <MapContainer
          center={position}
          zoom={1}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>Test pin</Popup>
          </Marker>
        </MapContainer>
    </div>
    </>
  );
};

export default HomePage;