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
};

export default UserController;
