// 🗺️ controllers/locationController.js
const geoCoding = require("../utils/geoCoding");

// Tạo hàm delay để tránh bị giới hạn tốc độ API
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCoordinatesArray(req, res) {
  const addressArr = req.body; // Mảng địa chỉ gửi từ frontend
  const coordinates = [];

  console.log("📍 Nhận được danh sách địa chỉ:", addressArr);

  if (!Array.isArray(addressArr) || addressArr.length === 0) {
    return res.status(400).json({
      message: "Dữ liệu đầu vào không hợp lệ. Cần truyền vào mảng các địa chỉ.",
    });
  }

  try {
    for (const address of addressArr) {
      console.log(`🔍 Đang xử lý: ${address}`);
      const coordinate = await geoCoding.getCoordinatesOSM(address);

      if (coordinate) {
        console.log(`✅ Thành công: ${address} →`, coordinate);
        coordinates.push(coordinate);
      } else {
        console.log(`❌ Không tìm thấy tọa độ cho: ${address}`);
      }

      // Bắt buộc delay để tránh vượt giới hạn rate limit của OpenCage
      await delay(1000);
    }

    console.log("📦 Tất cả tọa độ:", coordinates);

    return res.status(200).json({
      message: "Chuyển tọa độ thành công",
      coordinates,
    });
  } catch (err) {
    console.error("💥 Lỗi khi chuyển đổi tọa độ:", err);
    return res.status(500).json({
      message: "Lỗi server khi chuyển địa chỉ sang tọa độ",
    });
  }
}

module.exports = { getCoordinatesArray };
