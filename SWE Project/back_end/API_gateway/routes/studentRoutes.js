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
    res.json(mergedData);

  } catch (error) {
    console.error("❌ Lỗi khi gọi service:", error.message);
    res.status(500).json({ error: "Không thể lấy danh sách sinh viên" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID } = req.body;
    const formData = { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID };

    // 🧩 Gọi student_service để thêm học sinh
    const addedStudent = await callService("student_service", "/students/add", "POST", formData);
    addedStudent.student.ParentName = 'Không có thông tin phụ huynh';

    if (!addedStudent) {
      return res.status(500).json({ error: "Không thể thêm học sinh (student_service lỗi)" });
    }

    // 🧩 Tiếp tục lấy tên phụ huynh từ parent_service
    try {
      const parent = await callService("parent_service", `/parents/${ParentID}`, "GET");
      if (parent && parent.FullName) {
        addedStudent.student.ParentName = parent.FullName;
      }
      // ⚙️ Trả về dữ liệu hợp nhất
      return res.status(201).json(addedStudent);
    } catch (err) {
      console.warn("⚠️ Không thể gọi parent_service:", err.message);
      // Vẫn trả về student nếu parent service lỗi
      return res.status(201).json(addedStudent);
    }
  } catch (error) {
    console.error("❌ Lỗi khi xử lý /students/add:", error.message);
    return res.status(500).json({
      error: "Không thể tải dữ liệu để thêm học sinh",
    });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    // Gọi xuống student_service để xóa học sinh theo ID
    const result = await callService("student_service", `/students/delete/${req.params.id}`, "POST");
    res.json({ message: "Xóa học sinh thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa học sinh:", error.message);
    res.status(500).json({ error: "Không thể xóa học sinh" });
  }
});
router.post("/edit/:id", async (req, res) => {
  try {
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID } = req.body;
    const formData = { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID };

    // 🧩 Gọi student_service để cập nhật học sinh
    const result = await callService("student_service", `/students/edit/${req.params.id}`, "POST", formData);

    // 🔧 Gán giá trị mặc định cho ParentName
    result.student.ParentName = "Không có thông tin phụ huynh";

    try {
      // 🧠 QUAN TRỌNG: phải có await ở đây
      const parent = await callService("parent_service", `/parents/${ParentID}`, "GET");

      if (parent && parent.FullName) {
        result.student.ParentName = parent.FullName;
      }

      // ✅ Trả về dữ liệu hợp nhất
      return res.status(200).json(result);

    } catch (err) {
      console.warn("⚠️ Không thể gọi parent_service:", err.message);

      // ⚙️ Vẫn trả về dữ liệu nếu parent_service lỗi
      return res.status(200).json(result);
    }

  } catch (error) {
    console.error("❌ Lỗi khi update học sinh:", error.message);
    return res.status(500).json({ error: "Không thể update học sinh" });
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
