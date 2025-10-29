const queries= require('../db/queries')

async function getAllRoutes(req,res){
  try{
    const routes = await queries.getRoutes();
    console.log('yaput; ',routes)
    if(!routes || routes.length === 0){
      return res.status(404).json({message:'không có dữ liệu tuyến đường'})
    }
    return res.status(200).json(routes);
  }catch(err){
    console.error('server bị lỗi ',err);
    return res.status(500).json({message:'server lỗi'});
  }
}
async function addNewRoute(req, res) {
  try {
    const {driverID,busID,routeName,startLocation,endLocation } = req.body;
    const RouteID=await queries.addRoute(driverID,busID,routeName,startLocation,endLocation);
    // Trả về dữ liệu luôn, không cần if(!updatedData)
    res.status(201).json(RouteID);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding route: " + error);
  }
}

async function updateCurrentRoute(req,res){
  try{
    const {routeID}=req.params;
    const {driverID,busID,routeName,startLocation,endLocation } = req.body;
    await queries.updateCurrentRoute(routeID,driverID,busID,routeName,startLocation,endLocation)
    res.status(201).json({message: 'update route thành công',route: {driverID,busID,routeName,startLocation,endLocation}});
  }catch(error){
    console.error(error);
    res.status(500).send("error updating student: ",error)
  }
}

async function deleteRoute(req,res){
  try{
  const {routeID}=req.params;
  await queries.deleteRoute(routeID);
  res.status(201).json({message:'xóa thành công'})
  }catch(err){
    console.error(err);
    res.status(501).send('error: ',err)
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
  getAllRoutes,
  addNewRoute,
  updateCurrentRoute,deleteRoute,
}
