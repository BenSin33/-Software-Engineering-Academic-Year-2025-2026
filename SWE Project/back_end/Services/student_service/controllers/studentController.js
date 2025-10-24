

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
    console.log('chạy đi')
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint } = req.body;
    await queries.addStudent(FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint);

    const updatedData = await queries.getStudents();
    console.log('xin chao: ', updatedData); // sẽ log ra mảng mới

    // Trả về dữ liệu luôn, không cần if(!updatedData)
    res.status(201).json(updatedData);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding student: " + error);
  }
}

async function updateCurrentStudent(req, res) {
  try {
    console.log('update chayk')
    const { studentID } = req.params;
    const { FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint } = req.body;
    await queries.updateCurrentStudent(studentID, FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint)
    const updatedData = await queries.getStudents();
    res.status(201).json(updatedData);
  } catch (error) {
    console.error(error);
    res.status(500).send("error updating student: ", error)
  }
}

async function deleteStudent(req, res) {
  try {
    const { studentID } = req.params;
    console.log('delete: ', studentID)
    await queries.deleteStudent(studentID);
    const updatedData = await queries.getStudents();;
    res.status(201).json(updatedData)
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
