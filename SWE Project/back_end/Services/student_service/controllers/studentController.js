const queries= require('../db/queries')

async function getAllStudents(req,res){
  try{
    const students = await queries.getStudents();
    if(!students || students.length === 0){
      return res.status(404).json({message:'không có dữ liệu học sinh'})
    }
    return res.status(200).json(students);
  }catch(err){
    console.error('server bị lỗi ',err);
    return res.status(500).json({message:'server lỗi'});
  }
}

async function addNewStudent(req,res){
   try {
    const { name, className, age } = req.body;
    await queries.addStudent( name, className, age );
    res.status(201).send("Student added successfully");
  } catch (error) {
    res.status(500).send("Error adding student: " + error);
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

module.exports={
  getAllStudents,
  addNewStudent
}
