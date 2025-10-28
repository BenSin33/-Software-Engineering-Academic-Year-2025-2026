// Tính khoảng cách giữa 2 điểm (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // km
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Kiểm tra điểm có nằm trong geofence không
function isPointInGeofence(lat, lon, geofence) {
  const distance = calculateDistance(
    lat, 
    lon, 
    geofence.CenterLatitude, 
    geofence.CenterLongitude
  );
  
  return distance * 1000 <= geofence.Radius; // Convert to meters
}

// Tính hướng di chuyển (bearing)
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180 / Math.PI + 360) % 360;
  
  return Math.round(bearing);
}

module.exports = {
  calculateDistance,
  isPointInGeofence,
  calculateBearing
};