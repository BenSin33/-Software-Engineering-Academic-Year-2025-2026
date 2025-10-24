const pool = require('./pool'); // giả sử pool được config sẵn với mysql2/promise

async function getStudents() {
  const [rows] = await pool.query('SELECT * FROM students');
  return rows;
}

async function addStudent(FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint) {
  const sql = `
    INSERT INTO students
      (FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint)
    VALUES (?, ?, ?, ?, ?)
  `;

  await pool.query(sql, [FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint]);
}

async function updateCurrentStudent(StudentID,FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint){
  const sql =`
  update students set FullName=?,ParentID=?,DateOfBirth=?,PickUpPoint=?,DropOffPoint=? where 
  StudentID=?;
  `
  await pool.query(sql,[FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint,StudentID])
}

async function deleteStudent(StudentID){
  const sql=`delete from students where StudentID= ?`
  await pool.query(sql,[StudentID])
}
module.exports = {
  getStudents,
  addStudent,
  updateCurrentStudent,
  deleteStudent
};