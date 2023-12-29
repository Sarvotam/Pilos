import express from 'express'
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

// route level middleware to protect route
router.use('/changepassword', checkUserAuth)

// Public Routes
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)

// Protected Routes
router.post('/changepassword', UserController.changeUserPassword)

export default router