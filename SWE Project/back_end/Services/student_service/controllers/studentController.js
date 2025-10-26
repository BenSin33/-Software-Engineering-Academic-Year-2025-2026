

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

async function addNewStudent(req, res) {
  try {
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint } = req.body;

    // 🧩 Thêm học sinh vào DB
    const insertId = await queries.addStudent(FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint);

    // ✅ Trả về thông tin học sinh mới thêm (có thể fetch lại sau nếu cần)
    res.status(201).json({
      message: "Thêm học sinh thành công",
      student: {
        StudentID: insertId,
        FullName,
        ParentID,
        DateOfBirth,
        PickUpPoint,
        DropOffPoint,
      }
    });

  } catch (error) {
    console.error("❌ Lỗi khi thêm học sinh:", error);
    res.status(500).json({
      error: "Không thể thêm học sinh",
      details: error.message
    });
  }
}

async function updateCurrentStudent(req, res) {
  try {
    const { studentID } = req.params;
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint } = req.body;
    await queries.updateCurrentStudent(studentID, FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint)
    res.status(201).json({message:'update học sinh thành công',student:{StudentID:studentID,FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint}});
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
  updateCurrentStudent, deleteStudent
}
