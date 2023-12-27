import mongoose from "mongoose";

// defining schema
const userSchema = new mongoose.Schema({
    name: {type:String, require:true, trim:true},
    email: {type:String, require:true, trim:true},
    password: {type:String, require:true, trim:true},
    tc: {type:Boolean, require:true}
})

// Model of schema
const UserModel = mongoose.model("user", userSchema)

export default UserModel