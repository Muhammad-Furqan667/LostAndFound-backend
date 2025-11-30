import express from "express";
import { me, getCurrentUser, signUp, login, logout } from "../Controllers/userController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticateUser, getCurrentUser);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", authenticateUser, logout);

export default router;
