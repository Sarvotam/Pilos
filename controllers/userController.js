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

			res.send({ "status": "success", "message": "Registered successfully" });
		} catch (error) {
			console.error("Error during user registration:", error);
			res.send({ "status": "failed", "message": "Unable to register" });
		}
	}
};

export default UserController;
