

const queries = require('../db/queries')
 async function getAllStudents(req, res) {
  try {
    const data = await queries.getStudents();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server lỗi" });
  }
}

async function getPickUpPoint(req, res) {
  const { id } = req.params;
  try {
    const students = await queries.getStudentsByRouteID(id);
    if (!students || students.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy học sinh nào trong tuyến này",
        addressArr: [],
      });
    }

    // Chuyển danh sách object thành mảng địa chỉ
    const addressArr = students.map((student) => student.pickUpPoint);
    return res.status(200).json({
      message: "Fetch địa chỉ học sinh cùng tuyến thành công",
      addressArr,
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
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID } = req.body;

    // 🧩 Thêm học sinh vào DB
    const insertId = await queries.addStudent(FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID);

    //  Trả về thông tin học sinh mới thêm (có thể fetch lại sau nếu cần)
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
    console.error(" Lỗi khi thêm học sinh:", error);
    res.status(500).json({
      error: "Không thể thêm học sinh",
      details: error.message
    });
  }
}

async function updateCurrentStudent(req, res) {
  try {
    const { studentID } = req.params;
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID } = req.body;
    await queries.updateCurrentStudent(studentID, FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID)
    res.status(201).json({message:'update học sinh thành công',student:{StudentID:studentID,FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID}});
  } catch (error) {
    console.error(error);
    res.status(500).send("error updating student: ", error)
  }
}

async function deleteStudent(req, res) {
  try {
    const { studentID } = req.params;
    await queries.deleteStudent(studentID);
    res.status(201).json({message:'xóa học sinh thành công'})
  } catch (err) {
    console.error(err);
    res.status(501).send('error: ', err)
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
// async function updatetudent(req,res){
//     try{
//         const {name,className,age} = req.body;
//         await queries.updateStudent(name,className,age);
//         res.status(201).send("student updated succesfully");
//     }catch{
//         res.status(500).send("error update student: ",+ error)
//     }
// }

module.exports = {
  getAllStudents,
  addNewStudent,
  updateCurrentStudent,
  deleteStudent,
  getPickUpPoint,
  getStudentsByParent
}
