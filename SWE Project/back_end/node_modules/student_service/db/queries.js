const pool = require('./pool'); // giả sử pool được config sẵn với mysql2/promise

// Lấy toàn bộ học sinh
async function getStudents() {
  const [rows] = await pool.query('SELECT * FROM students');
  return rows;
}

// Lấy học sinh theo tuyến (trả về StudentID + pickUpPoint)
async function getStudentsByRouteID(id) {
  const [rows] = await pool.query(
    'SELECT StudentID, pickUpPoint FROM students WHERE routeID = ?',
    [id]
  );
  return rows;
}

// Lấy chi tiết một học sinh theo StudentID
async function getStudent(id) {
  const [rows] = await pool.query(
    'SELECT * FROM students WHERE StudentID = ?',
    [id]
  );
  return rows;
}

// Thêm học sinh mới
async function addStudent(FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID) {
  const sql = `
    INSERT INTO students
      (FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID]);
  return result.insertId;
}

// Cập nhật thông tin học sinh
async function updateCurrentStudent(StudentID, FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID) {
  const sql = `
    UPDATE students 
    SET FullName=?, ParentID=?, DateOfBirth=?, PickUpPoint=?, DropOffPoint=?, routeID=? 
    WHERE StudentID=?;
  `;
  await pool.query(sql, [FullName, ParentID, DateOfBirth, PickUpPoint, DropOffPoint, routeID, StudentID]);
}

// Xóa học sinh
async function deleteStudent(StudentID) {
  const sql = `DELETE FROM students WHERE StudentID=?`;
  await pool.query(sql, [StudentID]);
}

// Lấy học sinh theo ParentID
async function getStudentsByParentID(parentID) {
  const sql = 'SELECT * FROM students WHERE ParentID = ?';
  const [rows] = await pool.query(sql, [parentID]);
  return rows;
}

// Tìm kiếm học sinh theo tên (có giới hạn 10 kết quả)
async function searchStudentsByName(name) {
  const sql = 'SELECT * FROM students WHERE FullName LIKE ? LIMIT 10';
  const [rows] = await pool.query(sql, [`%${name}%`]);
  return rows;
}

// Cập nhật ParentID cho học sinh
async function updateStudentParent(studentID, parentID) {
  const sql = 'UPDATE students SET ParentID = ? WHERE StudentID = ?';
  await pool.query(sql, [parentID, studentID]);
}

// Xuất tất cả hàm
module.exports = {
  getStudents,
  getStudent,
  addStudent,
  updateCurrentStudent,
  deleteStudent,
  getStudentsByRouteID,
  getStudentsByParentID,
  searchStudentsByName,
  updateStudentParent
};
