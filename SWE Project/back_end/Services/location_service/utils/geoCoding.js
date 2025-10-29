// 🗺️ services/location_service/utils/geoCoding.js
async function getCoordinatesOSM(address) {
  const apiKey = "94d6121119b649b4972adf740c394a43";
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}&language=vi&countrycode=vn&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { lat, lng };
    } else {
      console.log("❌ Không tìm thấy tọa độ cho:", address);
      return null;
    }
  } catch (error) {
    console.error("⚠️ Lỗi khi gọi OpenCage API:", error.message);
    return null;
  }
}

module.exports = { getCoordinatesOSM };
