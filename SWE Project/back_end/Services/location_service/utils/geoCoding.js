// 🗺️ services/location_service/utils/geoCoding.js

async function getCoordinatesOSM(address) {
  // const apiKey = process.env.GOOGLE_MAPS_API_KEY; 
  const apiKey = `${process.env.GOOGLE_MAPS_API_KEY}`
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=vi`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.log("⚠️ Không tìm thấy tọa độ cho:", address, "Status:", data.status);
      return null;
    }
  } catch (error) {
    console.error("⚠️ Lỗi khi gọi Google Geocoding API:", error.message);
    return null;
  }
}
module.exports = { getCoordinatesOSM };
