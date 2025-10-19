const db= require("../../Shared-libs/db");

exports.login = (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE UserName = ? AND Password = MD5(?)`;
  
    db.query(sql, [username, password], (err, result) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (result.length === 0) return res.status(401).json({ error: "Invalid credentials" });
  
      const user = result[0];
      res.json({ userID: user.UserID, role: user.RoleID });
    });
  };

exports.register = (req,res)=>{

    const {username,password,roleID} = req.body;
    const sql = `INSERT INTO users (username,password,roleID) VALUES (?,?,?)`; 
    db.query(sql, [username,password,roleID],(err,result)=>{
        
        if(err) return res.status(500).json({error:" Registeration failed"});
        res.json({message: "Registeration successful"});

    });

}