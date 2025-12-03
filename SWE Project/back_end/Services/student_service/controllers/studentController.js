const queries = require('../db/queries');

// --- Các hàm từ cả hai đoạn mã ---
async function getAllStudents(req, res) {
  try {
    const data = await queries.getStudents();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server lỗi" });
  }
}

async function getStudent(req, res) {
  try {
    const { studentID } = req.params;
    const data = await queries.getStudent(studentID);
    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy học sinh" });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error("Lỗi khi lấy học sinh:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
}

async function getPickUpPoint(req, res) {
  const { id } = req.params;
  try {
    const students = await queries.getStudentsByRouteID(id);
    if (!students || students.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy học sinh nào trong tuyến này",
        students: [],
      });
    }

    const studentsData = students.map((student) => ({
      StudentID: student.StudentID,
      pickUpPoint: student.pickUpPoint,
    }));

    return res.status(200).json({
      message: "Fetch danh sách học sinh cùng tuyến thành công",
      students: studentsData,
    });
  } catch (err) {
    console.error("Lỗi khi lấy pickUpPoint:", err);
    return res.status(500).json({
      message: "Lỗi server khi lấy danh sách điểm đón học sinh",
    });
  }
}

async function addNewStudent(req, res) {
  try {
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID, status } = req.body;
    const insertId = await queries.addStudent(FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID,status);
    res.status(201).json({
      message: "Thêm học sinh thành công",
      student: {
        StudentID: insertId,
        FullName,
        ParentID,
        DateOfBirth,
        PickUpPoint,
        DropOffPoint,
        routeID
      }
    });
  } catch (error) {
    console.error("Lỗi khi thêm học sinh:", error);
    res.status(500).json({
      error: "Không thể thêm học sinh",
      details: error.message
    });
  }
}

async function updateCurrentStudent(req, res) {
  try {
    const { studentID } = req.params;
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID, status } = req.body;
    console.log('status: ',status)
    await queries.updateCurrentStudent(studentID, FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID,status);
    res.status(201).json({
      message: 'update học sinh thành công',
      student: { StudentID: studentID, FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("error updating student: ", error);
  }
}

async function deleteStudent(req, res) {
  try {
    const { studentID } = req.params;
    await queries.deleteStudent(studentID);
    res.status(201).json({ message: 'xóa học sinh thành công' });
  } catch (err) {
    console.error(err);
    res.status(501).send('error: ', err);
  }
}

async function getStudentsByParent(req, res) {
  const { parentID } = req.params;
  try {
    const students = await queries.getStudentsByParentID(parentID);
    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy học sinh nào cho phụ huynh này' });
    }
    res.status(200).json({ message: 'Lấy danh sách học sinh thành công', students });
  } catch (err) {
    console.error('Lỗi khi lấy học sinh theo ParentID:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy học sinh' });
  }
}

async function searchStudents(req, res) {
  const { name } = req.query;
  try {
    const students = await queries.searchStudentsByName(name);
    res.status(200).json({ students });
  } catch (err) {
    console.error('Lỗi khi tìm kiếm học sinh:', err);
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm học sinh' });
  }
}

async function updateStudentParent(req, res) {
  const { studentID } = req.params;
  const { parentID } = req.body;
  try {
    await queries.updateStudentParent(studentID, parentID);
    res.status(200).json({ message: 'Cập nhật phụ huynh cho học sinh thành công' });
  } catch (err) {
    console.error('Lỗi khi cập nhật phụ huynh cho học sinh:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật phụ huynh cho học sinh' });
  }
}

// --- Xuất tất cả hàm ---
module.exports = {
  getAllStudents,
  getStudent,
  getPickUpPoint,
  addNewStudent,
  updateCurrentStudent,
  deleteStudent,
  getStudentsByParent,
  searchStudents,
  updateStudentParent
};
