'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Sửa lỗi icon mặc định
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

type Coordinate = {
  lat: number;
  lng: number;
};

export default function MapView({ coordinates = [] }: { coordinates?: Coordinate[] }) {
  const [route, setRoute] = useState<L.LatLngExpression[]>([]);

  const orsApiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkxZTJkMDY4NjI0ODQ1NjZiNTdkNTU5ZmQ0OGRlMWY2IiwiaCI6Im11cm11cjY0In0='; // ✅ OpenRouteService key

  useEffect(() => {
    if (!coordinates || coordinates.length < 2) return;

    async function fetchRoute() {
      try {
        // Tạo chuỗi tọa độ [lng,lat] (ORS yêu cầu theo thứ tự này)
        const coordsString = coordinates.map(c => `${c.lng},${c.lat}`).join('|');

        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}&start=${coordinates[0].lng},${coordinates[0].lat}&end=${coordinates[coordinates.length - 1].lng},${coordinates[coordinates.length - 1].lat}`
        );

        if (!response.ok) {
          console.error('Lỗi khi gọi ORS API:', await response.text());
          return;
        }

        const data = await response.json();
        const line = data.features[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
        setRoute(line);
      } catch (error) {
        console.error('Lỗi lấy định tuyến:', error);
      }
    }

    fetchRoute();
  }, [coordinates]);

  const center = (coordinates && coordinates.length > 0)
    ? [coordinates[0].lat, coordinates[0].lng]
    : [10.77653, 106.700981];

  return (
    <MapContainer center={center as L.LatLngExpression} zoom={10} style={{ height: '100%',zIndex:'0', width: '100%', borderRadius: '12px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> & <a href="https://www.openstreetmap.org/">OSM</a>'
        url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=KVeN2HZJbhgfyv2ekxLj`}
      />

      {/* Marker cho từng tọa độ */}
      {(coordinates || []).map((pos, idx) => (
        <Marker key={idx} position={[pos.lat, pos.lng]}>
          <Popup>Điểm {idx + 1}</Popup>
        </Marker>
      ))}

      {/* Đường định tuyến thật */}
      {route.length > 0 && <Polyline positions={route} color="#4285F4" weight={5} />}
    </MapContainer>
  );
}
