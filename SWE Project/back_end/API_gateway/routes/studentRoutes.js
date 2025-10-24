// api_gateway/routes/studentRoutes.js
const express = require("express");
const { callService } = require("../services/callService.js");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const studentData = await callService("student_service", "/students", "GET");

    let parentData = [];
    try {
      parentData = await callService("parent_service", "/parents", "GET");
    } catch (err) {
      console.warn("⚠️ Không thể gọi parent_service:", err.message);
      parentData = []; // vẫn chạy tiếp
    }

    // Ghép parentName
    const mergedData = studentData.map(student => {
      const parent = parentData.find(p => p.ParentID == student.ParentID);
      return {
        ...student,
        ParentName: parent ? parent.FullName : "Không có thông tin phụ huynh"
      };
    });

    console.log(">>> mergedData:", mergedData);
    res.json(mergedData);

  } catch (error) {
    console.error("❌ Lỗi khi gọi service:", error.message);
    res.status(500).json({ error: "Không thể lấy danh sách sinh viên" });
  }
});

router.get("/add", async (req, res) => {
  try {
    // Lấy danh sách học sinh
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint } = req.body;
    const formData= { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint }
    await callService("student_service", "/students/add", "POST",formData);
  } catch (error) {
    console.error("❌ Lỗi khi xử lý /students/add:", error.message);
    res.status(500).json({ error: "Không thể tải dữ liệu để thêm học sinh" });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    // Gọi xuống student_service để xóa học sinh theo ID
    const result = await callService("student_service", `/students/delete/${req.params.id}`, "POST");
    console.log('lồ: ',result)
    res.json({ message: "Xóa học sinh thành công", result });
  } catch (error) {
    console.error("❌ Lỗi khi xóa học sinh:", error.message);
    res.status(500).json({ error: "Không thể xóa học sinh" });
  }
});
// Lấy chi tiết 1 sinh viên
// router.get("/:id", async (req, res) => {
//   try {
//     const data = await callService("student_service", `/students/${req.params.id}`, "GET");
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: "Không thể lấy thông tin sinh viên" });
//   }
// });

// // Tạo mới sinh viên
// router.post("/", async (req, res) => {
//   try {
//     const data = await callService("student_service", "/students", "POST", req.body);
//     res.status(201).json(data);
//   } catch (error) {
//     res.status(500).json({ error: "Không thể tạo sinh viên mới" });
//   }
// });

module.exports = router;
