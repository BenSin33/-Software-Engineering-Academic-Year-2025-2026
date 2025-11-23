'use client';
import { useEffect, useState, useMemo } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { v4 as uuidv4 } from 'uuid';
import polylineDecode from '@mapbox/polyline';

type Coordinate = { lat: number; lng: number };
type BusState = { id: string; routeKey: string; position: Coordinate; stepIndex: number };
type MapViewProps = { coordinates?: Coordinate[] | Coordinate[][]; showBuses?: boolean };

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '12px' };
const defaultCenter = { lat: 10.77653, lng: 106.700981 };
const updateInterval = 300;

function hashRoute(route: Coordinate[]) {
  return route.map(p => `${p.lat.toFixed(6)}_${p.lng.toFixed(6)}`).join('|');
}

// Hàm sinh màu theo index
function getColor(index: number) {
  const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF5722', '#9C27B0'];
  return colors[index % colors.length];
}

export default function MapView({ coordinates = [], showBuses = true }: MapViewProps) {
  console.log('structure: ',coordinates)
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}` });

  const [routes, setRoutes] = useState<{ key: string; path: Coordinate[] }[]>([]);
  const [busStates, setBusStates] = useState<BusState[]>([]);

  const normalizedRoutes: Coordinate[][] = Array.isArray(coordinates[0])
    ? (coordinates as Coordinate[][])
    : [coordinates as Coordinate[]];

  const busIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    return { url: '/bus.svg', scaledSize: new window.google.maps.Size(40, 40), anchor: new window.google.maps.Point(20, 20) };
  }, [isLoaded]);

  /** Fetch geometry từ API */
  const fetchRoutesFromAPI = async () => {
    const newRoutes: { key: string; path: Coordinate[] }[] = [];

    for (const route of normalizedRoutes) {
      if (route.length < 2) continue;
      try {
        const res = await fetch('http://localhost:5000/ORS/drivingCar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinates: route.map(p => [p.lng, p.lat]) }),
        });
        if (!res.ok) continue;

        const data = await res.json();
        let line: Coordinate[] = [];
        if (typeof data.routes[0].geometry === 'string') {
          line = polylineDecode.decode(data.routes[0].geometry).map(([lat, lng]) => ({ lat, lng }));
        } else if (data.routes[0].geometry?.coordinates) {
          line = data.routes[0].geometry.coordinates.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
        }
        newRoutes.push({ key: hashRoute(line), path: line });
      } catch (err) {
        console.error('Fetch route error:', err);
      }
    }

    const isSame = routes.length === newRoutes.length &&
      routes.every((r, i) => r.key === newRoutes[i].key);

    if (!isSame) {
      setRoutes(newRoutes);

      setBusStates(prevBus => {
        const busMap = new Map(prevBus.map(b => [b.routeKey, b]));
        return newRoutes.map(r => {
          const oldBus = busMap.get(r.key);
          return oldBus
            ? { ...oldBus, position: oldBus.position, stepIndex: oldBus.stepIndex }
            : { id: uuidv4(), routeKey: r.key, position: r.path[0], stepIndex: 0 };
        });
      });
    }
  };

  useEffect(() => {
    if (normalizedRoutes.length === 0) return;
    fetchRoutesFromAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedRoutes]);

  /** Di chuyển bus */
  useEffect(() => {
    if (!showBuses || routes.length === 0 || busStates.length === 0) return;
    const interval = setInterval(() => {
      setBusStates(prev =>
        prev.map(bus => {
          const route = routes.find(r => r.key === bus.routeKey);
          if (!route || route.path.length < 2) return bus;
          const nextStep = (bus.stepIndex + 1) % route.path.length;
          return { ...bus, stepIndex: nextStep, position: route.path[nextStep] };
        })
      );
    }, updateInterval);
    return () => clearInterval(interval);
  }, [routes, busStates, showBuses]);

  if (!isLoaded) return <div>Loading map...</div>;
  const center = routes[0]?.path[0] || defaultCenter;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={13}>
      {normalizedRoutes.map((route, i) => route.map((pos, j) => <Marker key={`marker-${i}-${j}`} position={pos} />))}
      {routes.map((r, i) => (
        <Polyline
          key={`route-${i}`}
          path={r.path}
          options={{ strokeColor: getColor(i), strokeWeight: 5 }}
        />
      ))}
      {showBuses && busStates.map(bus => <Marker key={bus.id} position={bus.position} icon={busIcon} />)}
    </GoogleMap>
  );
}

