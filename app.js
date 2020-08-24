const express = require("express");
const { userModel } = require("./model/user");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors')
const app = express()
const mongoose = require("mongoose")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
mongoose.set('useFindAndModify', false);

//console.log(new userModel({username:"carlosehdr",email:"carlosehdr@gmail.com"}))

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) return console.error(err)
});

//site routes
app.get('', (req, res) => res.sendFile(__dirname + "/views/index.html"))
app.get('/apis', (req, res) => res.sendFile(__dirname + "/views/apis.html"))
app.use(express.static(__dirname + "/public"))


//CRUD
app.post("/api/create", (req, res) => {

    const username = req.body.username
    const email = req.body.email
    const color = req.body.color
    const gender = req.body.gender

    if (!username) return res.json({ error: "Username is required" })
    if (!email) return res.json({ error: "Email is required" })

    var user = new userModel({ username: username, email: email, gender: gender, color: color })
    user.save((err, data) => {
        if (err) return res.json({ error: err })
        return res.json(data)
    })
})
app.get("/api/read", (req, res) => {

    const username = req.query.username
    const limit = req.query.limit
    const color = req.query.color
    const gender = req.query.gender

    if (username) {
        userModel.findOne({ username: username }, (err, data) => {
            if (err) return res.json({ error: err })
            return res.json(data)
        })
    }

    var query = userModel.find()

    if ((gender && gender != "None") && (color && color != "None")) query = userModel.find({ gender: gender, color: color })
    if ((!gender || gender == "None") && (color && color != "None")) query = userModel.find({ color: color })
    if ((gender && gender != "None") && (!color || color == "None")) query = userModel.find({ gender: gender })
    if (limit) query.limit(parseInt(limit))

    query.exec((err, data) => {
        if (err) return res.json({ error: err })
        return res.json({ count: data.length, results: data })
    })

})

app.post("/api/update", (req, res) => {

    const username = req.body.username
    const email = req.body.email
    const color = req.body.color
    const gender = req.body.gender

    var dataToUpdate = {}

    if (email) dataToUpdate["email"] = email
    if (gender && gender != "None") dataToUpdate["gender"] = gender
    if (color && color != "None") dataToUpdate["color"] = color

    userModel.findOneAndUpdate({ username: username }, dataToUpdate, (err, data) => {
        if (err) return res.json({ error: err })
        return res.json(data)
    })

})

app.post("/api/delete", (req, res) => {

    const username = req.body.username

    userModel.findOneAndDelete({ username: username }, (err, data) => {
        if (err) return res.json({ error: err })
        return res.json(data)
    })

})

//APIs
//api say hello
app.get("/api/hello", (req, res) => {
    return res.json({ message: "Api say Hello!" })
})

//calculate a basic operation such +,-,/ or *
app.get("/api/calc", (req, res) => {

    var first = parseInt(req.query.first)
    var second = parseInt(req.query.second)
    var operation = req.query.operation

    if (!first || !second || !operation) res.json({ error: "Invalid operation" })
    if (second == 0 && operation == "d") res.json({ error: "Division by zero is not allowed" })

    switch (operation) {
        case "multiplication":
            return res.json({ result: first * second })
        case "division":
            return res.json({ result: first / second })
        case "sum":
            return res.json({ result: first + second })
        case "substration":
            return res.json({ result: first - second })
        default:
            return res.json({ error: "Invalid operation" })
    }
})

//WHOAMI
app.get("/api/whoami", (req, res) => {
    return res.json({
        "ipaddress": req.ip, "language": req.header("accept-language"),
        "software": req.header('user-agent')
    })
})

// Not found middleware
app.use((req, res, next) => {
    return next({ status: 404, message: 'not found' })
})

// Error Handling middleware
app.use((err, req, res, next) => {
    let errCode, errMessage

    if (err.errors) {
        // mongoose validation error
        errCode = 400 // bad request
        const keys = Object.keys(err.errors)
        // report the first validation error
        errMessage = err.errors[keys[0]].message
    } else {
        // generic or custom error
        errCode = err.status || 500
        errMessage = err.message || 'Internal Server Error'
    }
    return res.status(errCode).type('txt')
        .send(errMessage)
})


app.listen(process.env.PORT || 3000, () => console.log(`Demo app listening on port ${process.env.PORT}!`)); 