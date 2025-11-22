'use client'
import { useEffect, useState, useMemo } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { v4 as uuidv4 } from 'uuid';
import polylineDecode from '@mapbox/polyline';

type Coordinate = { lat: number; lng: number };

type BusState = {
  id: string;
  routeIndex: number; // index tuyến trong routes
  position: Coordinate;
  stepIndex: number;
};

type MapViewProps = {
  coordinates?: Coordinate[] | Coordinate[][];
  showBuses?: boolean;
};

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '12px' };
const defaultCenter = { lat: 10.77653, lng: 106.700981 };
const updateInterval = 200; // 0.2s để mượt

export default function MapView({ coordinates = [], showBuses = true }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [routes, setRoutes] = useState<Coordinate[][]>([]);
  const [busStates, setBusStates] = useState<BusState[]>([]);

  const normalizedRoutes: Coordinate[][] = Array.isArray(coordinates[0])
    ? (coordinates as Coordinate[][])
    : [coordinates as Coordinate[]];

  const busIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    return {
      url: '/file.svg', 
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20),
    };
  }, [isLoaded]);

  // fetch routes từ ORS
  const fetchRoutes = async () => {
    const newRoutes: Coordinate[][] = [];

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
          const decoded = polylineDecode.decode(data.routes[0].geometry);
          line = decoded.map(([lat, lng]) => ({ lat, lng }));
        } else if (data.routes[0].geometry?.coordinates) {
          line = data.routes[0].geometry.coordinates.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
        }

        newRoutes.push(line);
      } catch (err) {
        console.error(err);
      }
    }

    setRoutes(newRoutes);

    // Khởi tạo busStates: mỗi tuyến 1 bus
    if (showBuses) {
      setBusStates(prev => {
        return newRoutes.map((route, index) => {
          const existing = prev.find(b => b.routeIndex === index);
          return existing || { id: uuidv4(), routeIndex: index, position: route[0], stepIndex: 0 };
        });
      });
    } else {
      setBusStates([]);
    }
  };

  useEffect(() => {
    fetchRoutes();
    const interval = setInterval(fetchRoutes, 15000);
    return () => clearInterval(interval);
  }, [coordinates, showBuses]);

  // di chuyển bus
  useEffect(() => {
    if (!showBuses || routes.length === 0) return;

    const interval = setInterval(() => {
      setBusStates(prev =>
        prev.map(bus => {
          const route = routes[bus.routeIndex];
          if (!route || route.length < 2) return bus;
          const nextStep = (bus.stepIndex + 1) % route.length;
          return { ...bus, position: route[nextStep], stepIndex: nextStep };
        })
      );
    }, updateInterval);

    return () => clearInterval(interval);
  }, [routes, showBuses]);

  if (!isLoaded) return <div>Loading map...</div>;

  const center = normalizedRoutes[0]?.[0] || defaultCenter;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={13}>
      {/* route markers */}
      {normalizedRoutes.map((route, i) =>
        route.map((pos, j) => <Marker key={`marker-${i}-${j}`} position={pos} />)
      )}

      {/* polylines */}
      {routes.map((r, i) => (
        <Polyline key={`route-${i}`} path={r} options={{ strokeColor: '#4285F4', strokeWeight: 5 }} />
      ))}

      {/* buses */}
      {showBuses &&
        busStates.map(bus => <Marker key={bus.id} position={bus.position} icon={busIcon} />)}
    </GoogleMap>
  );
}
