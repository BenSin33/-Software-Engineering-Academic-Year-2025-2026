'use client'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import busIcon from '../../public/busIcon.svg';
import polyline from '@mapbox/polyline'; // ✅ Thêm dòng này

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const busMarker = L.icon([{
  iconURL: busIcon,
  iconSize: [40, 40],      
  iconAnchor: [20, 20],
}])

type Coordinate = { lat: number; lng: number };
type MapViewProps = { coordinates?: Coordinate[] | Coordinate[][] };

export default function MapView({ coordinates = [] }: MapViewProps) {
  const [routes, setRoutes] = useState<L.LatLngExpression[][]>([]);
  const getCurrentTime = ()=>{
    
  }
  useEffect(() => {
    if (!coordinates || (coordinates as any).length === 0) return;

    const normalizedRoutes: Coordinate[][] = Array.isArray(coordinates[0])
      ? (coordinates as Coordinate[][])
      : [coordinates as Coordinate[]];
    console.log('allroutes: ',routes)
    async function fetchRoutes() {
      const allRoutes: L.LatLngExpression[][] = [];

      for (const route of normalizedRoutes) {
        if (route.length < 2) continue;

        try {
          const body = {
            coordinates: route.map((pos) => [pos.lng, pos.lat]),
          };

          const response = await fetch(
            'http://localhost:5000/ORS/drivingCar',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            }
          );

          if (!response.ok) {
            console.error('Lỗi khi gọi ORS API:', await response.text());
            continue;
          }

          const data = await response.json();
          console.log('nisa: ', data);

          let line: L.LatLngExpression[] = [];

          // ✅ Nếu ORS trả về geometry dạng chuỗi — decode
          if (typeof data.routes[0].geometry === 'string') {
            const decoded = polyline.decode(data.routes[0].geometry);
            line = decoded.map(([lat, lng]) => [lat, lng]);
          } 
          // ✅ Nếu geometry là object có coordinates
          else if (data.routes[0].geometry?.coordinates) {
            line = data.routes[0].geometry.coordinates.map(
              (c: number[]) => [c[1], c[0]]
            );
          }
          console.log('line: ',line);
          allRoutes.push(line);
        } catch (error) {
          console.error('Lỗi lấy định tuyến:', error);
        }
      }

      setRoutes(allRoutes);
    }

    fetchRoutes();
  }, [coordinates]);

  const firstRoute = Array.isArray(coordinates[0])
    ? (coordinates as Coordinate[][])[0]
    : (coordinates as Coordinate[]);
  const center =
    firstRoute.length > 0
      ? [firstRoute[0].lat, firstRoute[0].lng]
      : [10.77653, 106.700981];

  return (
    <MapContainer
      center={center as L.LatLngExpression}
      zoom={12}
      style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> & <a href="https://www.openstreetmap.org/">OSM</a>'
        url='https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=KVeN2HZJbhgfyv2ekxLj'
      />

      { Array.isArray(coordinates[0])
        ? (coordinates as Coordinate[][]).map((route, i) =>
            route.map((pos, j) => (
              <Marker key={`marker-${i}-${j}`} position={[pos.lat, pos.lng]}>
                <Popup>
                  Tuyến {i + 1} - Điểm {j + 1}
                </Popup>
              </Marker>
            ))
          )
        : (coordinates as Coordinate[]).map((pos, i) => (
            <Marker key={`marker-single-${i}`} position={[pos.lat, pos.lng]}>
              <Popup>Điểm {i + 1}</Popup>
            </Marker>
          ))}
        {/* <Marker position = {}>

        </Marker> */}
      {routes.map((r, i) => (
        <Polyline
          key={`route-${i}`}
          positions={r}
          color={i % 2 === 0 ? '#4285F4' : '#FF6347'}
          weight={5}
        />
      ))}
    </MapContainer>
  );
}
