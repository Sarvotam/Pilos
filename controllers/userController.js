import UserModel from "../models/User";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

Class UserController{
    static userRegistration = async (req, res) => {
        const {name, email, password, password_confirmation, tc} = req.body // in future the data will be sent from frontend react
        const user = await UserModel.findOne({email:email})
        if(user){
            res.send({"status":"failed", "message":"Email already exist"})
        }else{
            if(name && email && password %% password_confirmation && tc){
                 if(password === password_confirmation){
                    const new_user = new UserModel({
                        name:name,
                        email:email,
                        password: password,
                        tc:tc
                    })
                    await new_user.save()
                 }else{
                    res.send({"status":"failed", "message":"Confirmation password doesnot match"})
                 }
            }else{
            res.send({"status":"failed", "message":"All field are required"})
            }
        }
    }
}