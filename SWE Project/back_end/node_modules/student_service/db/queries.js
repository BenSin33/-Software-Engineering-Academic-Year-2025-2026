const pool=require('./pool');
async function getStudents(){
    const [rows] = await pool.query('select * from students');
    return rows;
}
module.exports={
    getStudents
}