const queries= require('../db/queries')
async function addNewStudent(req,res){
   try {
    const { name, className, age } = req.body;
    await queries.addStudent( name, className, age );
    res.status(201).send("Student added successfully");
  } catch (error) {
    res.status(500).send("Error adding student: " + error);
  }
}
async function updatetudent(req,res){
    try{
        const {name,className,age} = req.body;
        await queries.updateStudent(name,className,age);
        res.status(201).send("student updated succesfully");
    }catch{
        res.status(500).send("error update student: ",+ error)
    }
}

module.exports={
    addNewStudent
}
