const express = require("express")
const app = express()
const Path = require("path")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv= require("dotenv")
const UserModel = require("./models/user.model")
dotenv.config()
app.set("view engine", "ejs")
app.use(cors())
app.use(express.urlencoded({extended:true}))//body parser
app.use(express.json())

const UserRouter = require("./routes/user.routes")
const ProductRouter = require("./routes/product.route")

app.use("/api/v1", UserRouter)
app.use("/api/v1", ProductRouter)


const URI= process.env.DB_URI
mongoose.connect(URI)
.then(()=>{
    console.log("Db connected successfully");
    
})
.catch((err)=>{
    console.log(err, "cannot connect to db");  
})


//creating requests
// app.get(path, callback)
app.get("/", (request, response)=>{
    response.send("hello my dear students, we are happy")
})





let students =[
    {
        fullname:"Pamilerin Onifade",
        course:"Mobile Engineering"
    },

    {
        fullname:"Obelawo Adedayo",
        course:"Mobile Engineering"
    },
    {
        fullname:"Oluwamakin OluwaFeranmi",
        course:"Software Engineering"
    },
    {
        fullname:"Benjamin Sesko",
        course:"Software Engineering"
    },

    {
        fullname:"Oderinu OluwaFeranmi",
        course:"Software Engineering"
    },
]

app.get("/getStudents", (req, res)=>{
    res.send(students)
})


app.get("/getFile", (req, res)=>{
    let fileDir = __dirname
    console.log(fileDir)
    
    // res.sendFile(fileDir+"/index.html")
    let filePath = Path.join(fileDir, "index.html")
    res.sendFile(filePath)
})

app.get("/getImage", (req, res)=>{
    let fileDir = __dirname
    console.log(fileDir)
    
    // res.sendFile(fileDir+"/index.html")
    let filePath = Path.join(fileDir, "doxa.png")
    res.sendFile(filePath)
})

app.get("/getEjs", (req, res)=>{
    let gender ="male"
    res.render("index", {gender})
})

app.get("/register", (req, res)=>{
    let message= ""
  res.render("register", {message})  
})

let students2 =[]
// app.post("/register", (req, res)=>{
//     console.log(req.body);
//     const {firstname, lastname, email, password, course}=req.body
//     let message ="user registered successfully"
//     students2.push(req.body)
//     res.render("register", {message})
    
// })


app.get("/allStudents", (req, res)=>{
    res.render("allStudents", {students2})
})

app.post("/deleteStudent/:id", (req, res)=>{
  console.log(req.params);
  let id = req.params.id
  console.log(id);

  students2.splice(id, 1)
  res.render("allStudents", {students2})
  
    
})

app.get("/allstudrev", (req, res)=>{
    res.render("allstudrev",{students} )
})


app.get("/edit/:id", (req, res)=>{
    res.render("editStudent")
})


app.post("/edit/:id",(req, res)=>{
    const {id}=req.params

    const {firstname, lastname, email, password, course}=req.body

    students2.splice(id, 1, req.body)

    // students2[id]=req.body

    // res.render("allstudrev", {students2})
    res.redirect("/allstudrev")
})
app.post("/del/:index", (req, res)=>{
    const id = req.params.index

    students.splice(id, 1)

    res.render("allstudrev", {students})
})

app.get("/editStudent/:id", (req, res)=>{
    const{id}=req.params

    res.render("editStudent")
})

app.post("/editStudent/:id", (req, res)=>{
    const{id}=req.params
      const {firstname, lastname, email, password, course}=req.body
    students2.splice(id,1, req.body)
    res.render("allStudents", {students2})
})




















//creating and starting our server
// app.listen(port, callback)
const PORT =process.env.PORT
app.listen(PORT, (err)=>{

    if(err){
        console.log(err);
        console.log("cannot start server at this time");
        
        
    }else{
        console.log(`server started on port ${PORT}`);
        
    }
})
//nodemon, node --watch index.js