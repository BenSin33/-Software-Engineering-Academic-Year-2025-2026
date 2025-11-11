const pool = require('./pool'); // giả sử pool được config sẵn với mysql2/promise

async function getStudents() {
  const [rows] = await pool.query('SELECT * FROM students');
  return rows;
}

async function getStudentsByRouteID(id){
  const [rows]=await pool.query('select pickUpPoint from students where routeID = ?',[id]);
  return rows;
}

async function addStudent(FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID) {
  const sql = `
    INSERT INTO students
      (FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID)
    VALUES (?, ?, ?, ?, ?,?)
  `;

  const [result] = await pool.query(sql, [FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID]);
  return result.insertId;
}

async function updateCurrentStudent(StudentID,FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID){
  const sql =`
  update students set FullName=?,ParentID=?,DateOfBirth=?,PickUpPoint=?,DropOffPoint=?,routeID=? where 
  StudentID=?;
  `
  await pool.query(sql,[FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,routeID,StudentID])
}

async function deleteStudent(StudentID){
  const sql=`delete from students where StudentID= ?`
  await pool.query(sql,[StudentID])
}

async function getStudentsByParentID(parentID) {
  const sql = 'SELECT * FROM students WHERE ParentID = ?';
  const [rows] = await pool.query(sql, [parentID]);
  return rows; // Trả về danh sách học sinh của phụ huynh
}

module.exports = {
  getStudents,
  addStudent,
  updateCurrentStudent,
  deleteStudent,getStudentsByRouteID,
  getStudentsByParentID

};