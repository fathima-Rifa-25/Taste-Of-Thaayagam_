import express from 'express';
import { 
  loginUser, 
  registerUser, 
  getAllUsers, 
  createUserByAdmin, 
  deleteUser, 
  updateUser 
  , promoteUser
  , listUsersDebug
  , forgotPassword
  , resetPassword
} from '../controllers/userController.js';

const userRouter = express.Router();

// Auth
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword);

// Dev helper to promote a user to admin (requires ADMIN_PROMOTE_KEY)
userRouter.post('/promote', promoteUser);

// Debug route: list users (requires x-admin-key header or ?adminKey=)
userRouter.get('/debug/list', listUsersDebug);

// Admin
userRouter.get("/list", getAllUsers);        // fetch all users
userRouter.post("/", createUserByAdmin);    // add new user
userRouter.put("/:id", updateUser);         // update user
userRouter.delete("/:id", deleteUser);      // delete user

export default userRouter;
// fetching api