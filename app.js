const express = require("express");
const app = express()
const port = 3000

app.get('/', (req, res) => res.sendFile(__dirname + "/views/index.html"))
app.use(express.static(__dirname + "/public"))

app.get("/api/hello",(req,res)=>{
    res.json({hello:true})
})


app.listen(3000, () => console.log(`Example app listening on port ${port}!`)); 