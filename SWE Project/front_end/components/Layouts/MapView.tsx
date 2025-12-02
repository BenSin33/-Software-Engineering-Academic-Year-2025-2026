'use client';

import React, { memo } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';

// Định nghĩa kiểu dữ liệu Props nhận vào từ TrackingPage
interface MapViewProps {
  coordinates?: { lat: number; lng: number }[]; // Đường vẽ (Polyline)
  currentPoint?: { lat: number; lng: number };  // Vị trí xe (Real-time)
  startPoint?: { lat: number; lng: number };    // Điểm A
  endPoint?: { lat: number; lng: number };      // Điểm B
}

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '12px' };
const defaultCenter = { lat: 10.762622, lng: 106.660172 }; // Mặc định TP.HCM

function MapView({ coordinates = [], currentPoint, startPoint, endPoint }: MapViewProps) {
  
  // Load Google Maps Script
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    // ⚠️ Đảm bảo bạn đã có API Key trong file .env.local
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" 
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Tự động zoom bản đồ để thấy toàn bộ lộ trình
  React.useEffect(() => {
    if (map && coordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      if (currentPoint) bounds.extend(currentPoint);
      map.fitBounds(bounds);
    }
  }, [map, coordinates, currentPoint]);

  if (!isLoaded) return <div className="flex justify-center items-center h-full bg-gray-100">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={currentPoint || startPoint || defaultCenter}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {/* 1. Vẽ đường đi (Polyline) màu xanh */}
      {coordinates.length > 0 && (
        <Polyline
          path={coordinates}
          options={{
            strokeColor: "#2563EB", // Màu xanh dương
            strokeWeight: 5,
            strokeOpacity: 0.8,
          }}
        />
      )}

      {/* 2. Điểm Bắt đầu (A) */}
      {startPoint && (
        <Marker
          position={startPoint}
          label={{ text: "A", color: "white", fontWeight: "bold" }}
          title="Điểm Bắt Đầu"
        />
      )}

      {/* 3. Điểm Kết thúc (B) */}
      {endPoint && (
        <Marker
          position={endPoint}
          label={{ text: "B", color: "white", fontWeight: "bold" }}
          title="Điểm Đến"
        />
      )}

      {/* 4. Xe Bus đang chạy (C) */}
      {currentPoint && (
        <Marker
          position={currentPoint}
          icon={{
            // Icon xe buýt (bạn có thể thay bằng link ảnh khác)
            url: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", 
            scaledSize: new window.google.maps.Size(45, 45),
            anchor: new window.google.maps.Point(22, 22)
          }}
          title="Vị trí hiện tại"
          zIndex={999} // Luôn hiện trên cùng
        />
      )}
    </GoogleMap>
  );
}

export default memo(MapView);