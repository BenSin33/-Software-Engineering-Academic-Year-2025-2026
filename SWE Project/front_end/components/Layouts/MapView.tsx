'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// 🔧 Fix lỗi 404 hình ảnh marker mặc định
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
  });
  
export default function MapView() {
  const [route, setRoute] = useState<L.LatLngExpression[]>([]);

  const start = [106.700981, 10.77653]; // TP.HCM
  const end = [105.84117, 21.0245];     // Hà Nội

  const orsApiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkxZTJkMDY4NjI0ODQ1NjZiNTdkNTU5ZmQ0OGRlMWY2IiwiaCI6Im11cm11cjY0In0='; // 🔑 Thay bằng key thật
  const maptilerKey = 'KVeN2HZJbhgfyv2ekxLj';         // 🔑 Key MapTiler

  useEffect(() => {
    async function fetchRoute() {
      const res = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`
      );
      if (!res.ok) {
        console.error('Lỗi khi gọi API:', await res.text());
        return;
      }
      const data = await res.json();
      const coords = data.features[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      setRoute(coords);
    }

    fetchRoute();
  }, []);

  return (
    <MapContainer center={[16.047079, 108.20623]} zoom={6} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> & <a href="https://www.openstreetmap.org/">OSM</a>'
        url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${maptilerKey}`}
      />
      <Marker position={[10.77653, 106.700981]}>
        <Popup>TP.HCM</Popup>
      </Marker>
      <Marker position={[21.0245, 105.84117]}>
        <Popup>Hà Nội</Popup>
      </Marker>
      {route.length > 0 && <Polyline positions={route} color="#4285F4" weight={4} />}
    </MapContainer>
  );
}