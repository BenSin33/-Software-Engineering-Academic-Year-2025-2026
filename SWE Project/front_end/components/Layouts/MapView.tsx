'use client';

import React, { memo } from 'react';
// Đã import thêm DirectionsService, DirectionsRenderer, và Libraries
import { GoogleMap, Marker, useJsApiLoader, DirectionsService, DirectionsRenderer, Libraries } from '@react-google-maps/api';

// Định nghĩa kiểu dữ liệu Props
interface MapViewProps {
    coordinates?: { lat: number; lng: number }[]; // Mảng Tọa độ Waypoints/Điểm dừng
    currentPoint?: { lat: number; lng: number };  // Vị trí xe (Real-time)
    startPoint?: { lat: number; lng: number };    // Điểm A
    endPoint?: { lat: number; lng: number };      // Điểm B
}

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '12px' };
const defaultCenter = { lat: 10.762622, lng: 106.660172 }; // Mặc định TP.HCM

// Khắc phục lỗi TypeScript bằng cách sử dụng kiểu Libraries import từ thư viện
const libraries: Libraries = ['places']; 

function MapView({ coordinates = [], currentPoint, startPoint, endPoint }: MapViewProps) {
    
    // State để lưu trữ kết quả lộ trình từ DirectionsService
    const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);

    // Load Google Maps Script
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: libraries,
    });

    const [map, setMap] = React.useState<google.maps.Map | null>(null);

    const onLoad = React.useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    // --- LOGIC GỌI DIRECTIONS SERVICE ---
    const calculateRoute = React.useCallback(() => {
        // Chỉ tính toán nếu có đủ điểm bắt đầu và kết thúc
        if (!startPoint || !endPoint) {
            setDirections(null);
            return;
        }
        
        // Tạo Waypoints từ các tọa độ còn lại (trừ điểm đầu và điểm cuối)
        // Lưu ý: Dù coordinatesArray đã được chuẩn hóa trong page.tsx, 
        // ta vẫn cần lọc để tránh trùng lặp nếu startPoint/endPoint nằm trong mảng.
        const waypoints = coordinates
            // Lọc ra các điểm không phải điểm đầu hoặc điểm cuối
            .filter(coord => coord !== startPoint && coord !== endPoint) 
            .map(coord => ({
                location: coord,
                stopover: true // Đánh dấu đây là điểm dừng
            }));

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: startPoint,
                destination: endPoint,
                waypoints: waypoints,
                travelMode: google.maps.TravelMode.DRIVING, // Lộ trình ô tô
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    console.log("[MAP] Directions Service thành công.");
                } else {
                    console.error('Directions request failed due to ' + status);
                    setDirections(null);
                }
            }
        );
    }, [coordinates, startPoint, endPoint]);

    // Gọi hàm tính toán lộ trình khi các điểm (Props) thay đổi
    React.useEffect(() => {
        if (isLoaded) {
            calculateRoute();
        }
    }, [isLoaded, calculateRoute]); 

    // Tự động zoom bản đồ
    React.useEffect(() => {
        if (map && directions) {
            map.fitBounds(directions.routes[0].bounds);
        } else if (map && startPoint) {
             map.setCenter(startPoint);
             map.setZoom(14);
        }
    }, [map, directions, startPoint]);


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
            {/* 1. HIỂN THỊ LỘ TRÌNH THỰC TẾ */}
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        suppressMarkers: true, // Không dùng Markers mặc định của DirectionsRenderer
                        polylineOptions: {
                            strokeColor: "#2563EB", 
                            strokeWeight: 5,
                            strokeOpacity: 0.8,
                        },
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
                        url: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", 
                        scaledSize: new window.google.maps.Size(45, 45),
                        anchor: new window.google.maps.Point(22, 22)
                    }}
                    title="Vị trí hiện tại"
                    zIndex={999}
                />
            )}
        </GoogleMap>
    );
}

export default memo(MapView);