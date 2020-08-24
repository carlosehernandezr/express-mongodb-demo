const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {type: String, unique:true, required:true},
    email:{type: String, unique:true, required:true},
    gender:String,
    color:String
})

const userModel = mongoose.model("User",userSchema)

//export the model 
exports.userModel = userModel