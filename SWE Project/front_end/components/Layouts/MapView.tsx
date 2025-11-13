'use client'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import polyline from '@mapbox/polyline';
import objectHash from 'object-hash';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

type Coordinate = { lat: number; lng: number };

type BusState = {
  routeId: string;
  position: L.LatLngExpression;
  startTime: number;
  stepIndex: number;
};

type MapViewProps = {
  coordinates?: Coordinate[] | Coordinate[][];
  showBuses?: boolean; // mới: quyết định có hiển thị bus
};

const busIcon = L.icon({
  iconUrl: '/bus.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function hashRoute(route: L.LatLngExpression[]) {
  return objectHash(route);
}

export default function MapView({ coordinates = [], showBuses = true }: MapViewProps) {
  const [routes, setRoutes] = useState<{ routeId: string; path: L.LatLngExpression[] }[]>([]);
  const [busStates, setBusStates] = useState<BusState[]>([]);
  const updateInterval = 1000;

  const normalizedRoutes: Coordinate[][] = Array.isArray(coordinates[0])
    ? (coordinates as Coordinate[][])
    : [coordinates as Coordinate[]];

  const fetchRoutes = async () => {
    const allRoutes: { routeId: string; path: L.LatLngExpression[] }[] = [];

    for (const route of normalizedRoutes) {
      if (route.length < 2) continue;

      try {
        const body = { coordinates: route.map(p => [p.lng, p.lat]) };
        const res = await fetch('http://localhost:5000/ORS/drivingCar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) continue;
        const data = await res.json();

        let line: L.LatLngExpression[] = [];
        if (typeof data.routes[0].geometry === 'string') {
          const decoded = polyline.decode(data.routes[0].geometry);
          line = decoded.map(([lat, lng]) => [lat, lng]);
        } else if (data.routes[0].geometry?.coordinates) {
          line = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
        }

        allRoutes.push({ routeId: hashRoute(line), path: line });
      } catch (err) {
        console.error(err);
      }
    }

    setRoutes(allRoutes);

    // Chỉ tạo busState nếu showBuses = true
    if (showBuses) {
      setBusStates(prevBusStates => {
        const newBusStates: BusState[] = [];

        allRoutes.forEach(route => {
          const existingBus = prevBusStates.find(b => b.routeId === route.routeId);
          if (existingBus) {
            newBusStates.push(existingBus);
          } else {
            newBusStates.push({
              routeId: route.routeId,
              position: route.path[0],
              startTime: Date.now(),
              stepIndex: 0,
            });
          }
        });

        return newBusStates;
      });
    } else {
      setBusStates([]); // không hiển thị bus
    }
  };

  useEffect(() => {
    fetchRoutes();
    const interval = setInterval(fetchRoutes, 15000);
    return () => clearInterval(interval);
  }, [coordinates, showBuses]);

  useEffect(() => {
    if (!showBuses || routes.length === 0) return;

    const interval = setInterval(() => {
      setBusStates(prev =>
        prev.map(bus => {
          const route = routes.find(r => r.routeId === bus.routeId);
          if (!route || route.path.length === 0) return bus;

          const elapsed = Date.now() - bus.startTime;
          const step = Math.floor(elapsed / updateInterval);
          const newStep = Math.min(step, route.path.length - 1);

          return { ...bus, position: route.path[newStep], stepIndex: newStep };
        })
      );
    }, updateInterval);

    return () => clearInterval(interval);
  }, [routes, showBuses]);

  const center =
    normalizedRoutes[0].length > 0
      ? [normalizedRoutes[0][0].lat, normalizedRoutes[0][0].lng]
      : [10.77653, 106.700981];

  return (
    <MapContainer
      center={center as L.LatLngExpression}
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> & <a href="https://www.openstreetmap.org/">OSM</a>'
        url='https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=KVeN2HZJbhgfyv2ekxLj'
      />

      {/* Marker điểm gốc tuyến */}
      {normalizedRoutes.map((route, i) =>
        route.map((pos, j) => (
          <Marker key={`marker-${i}-${j}`} position={[pos.lat, pos.lng]}>
            <Popup>Tuyến {i + 1} - Điểm {j + 1}</Popup>
          </Marker>
        ))
      )}

      {/* Polyline */}
      {routes.map((r, i) => (
        <Polyline key={`route-${i}`} positions={r.path} color="#4285F4" weight={5} />
      ))}

      {/* Marker bus */}
      {showBuses &&
        busStates.map(bus => (
          <Marker key={`bus-${bus.routeId}`} position={bus.position} icon={busIcon} />
        ))}
    </MapContainer>
  );
}
