import UserModel from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserController = {
	userRegistration: async (req, res) => {
		try {
			const { name, email, password, password_confirmation, tc } = req.body; // in future the data will be sent from frontend react
			
			if (!name || !email || !password || !password_confirmation || !tc) {
					return res.send({ "status": "failed", "message": "All fields are required" });
			}

			const existingUser = await UserModel.findOne({ email });

			if (existingUser) {
					return res.send({ "status": "failed", "message": "Email already exists" });
			}

			if (password !== password_confirmation) {
					return res.send({ "status": "failed", "message": "Confirmation password does not match" });
			}

			const salt = await bcrypt.genSalt(10);
			const hashPassword = await bcrypt.hash(password, salt);

			const newUser = new UserModel({
					name,
					email,
					password: hashPassword,
					tc
			});

			await newUser.save();
			const saved_user = await UserModel.findOne({email:email})
			// Generate JWT token
			const token = jwt.sign(
														{userID:saved_user._id},
														process.env.JWT_SECRET_KEY, 
														{ expiresIn: '5d'}
														)

			res.status(201).send({ "status": "success", "message": "Registered successfully", "token": token });
		} catch (error) {
			console.error("Error during user registration:", error);
			res.send({ "status": "failed", "message": "Unable to register" });
		}
	},
	
	userLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ status: 'failed', message: 'All fields are required' });
      }

      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(400).json({ status: 'failed', message: 'Not registered user, please register' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
				// Generate JWT token
				const token = jwt.sign(
															{userID:user._id},
															process.env.JWT_SECRET_KEY, 
															{ expiresIn: '5d'}
															)
        res.json({ status: 'success', message: 'Login success', "token": token });
      } else {
        res.status(400).json({ status: 'failed', message: 'Email or password is incorrect' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'failed', message: 'Unable to login' });
    }
  },

	changeUserPassword: async (req, res) => {
		const {password, password_confirmation} = req.body
		if(password && password_confirmation){
			if(password !== password_confirmation){
				res.send({"status": "failed", "message": "password doesnot match"})
			}else{
				const salt = await bcrypt.genSalt(10)
				const newHashPassword = await bcrypt.hash(password, salt)
				// console.log(req.user._id)
				await UserModel.findByIdAndUpdate(req.user._id, {$set: {password: newHashPassword}}) // Update password if user logged in which is handeled my middleware
				res.send({"status": "success", "message": "password changed successfully"})
			}
		}else{
			res.send({"status": "failed", "message": "all fields are required"})
		}
	},

	loggedUser: async (req, res) => {
		res.send({"user":req.user})
	},

	sendPasswordResetEmail: async (req, res) => {
		const {email} = req.body
		if (email){
			const user = await UserModel.findOne({email: email})
			if(user){
				const secret = user._id + process.env.JWT_SECRET_KEY
				const token = jwt.sign({ userID: user._id}, secret, {expiresIn: '15m'})
				const link = `http://127.0.0.1:30000/api/user/reset/${user._id}/${token}}` // Link for front end and passing link for the user via mail
				console.log(link)
				res.send({"status": "success", "message": "Password resent mail sent... please check you email"})
			}else{
				res.send({"status":"failed", "message": "email doesnot exist"})
			}
		}else{
			res.send({"status": "failed", "message": "email field is required"})
		}
	},

	userPasswordReset: async (req, res) => {
		const {password, password_confirmation} = req.body // get data from frontend data
		const {id, token} = req.params // get params data from url
		const user = await UserModel.findById(id)
		const new_secret = user._id + process.env.JWT_SECRET_KEY
		try {
			jwt.verify(token, new_secret)
			if(password && password_confirmation) {
				if(password !== password_confirmation){
					res.send({"status": "failed", "message": "Password does not match"})
				}else{
					const salt = await bcrypt.genSalt(10)
					const newHashPassword = await bcrypt.hash(password, salt)
					await UserModel.findByIdAndUpdate(user._id, {$set: { password: newHashPassword }})
					res.send({"status": "success", "message": "Password reset successfully"})
				}
			}else{
				res.send({"status": "failed", "message": "All fields are required"})
			}
		} catch (error) {
			console.log(error)
			res.send({"status": "failed", "message": "Invalid token"})
		}
	},
};

export default UserController;
