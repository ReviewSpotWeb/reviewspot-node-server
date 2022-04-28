import { Router } from "express";
import { login, logout, signUp } from "../controllers/auth-controller.js";
const authRoutes = Router();

authRoutes.post("/logout", logout);
authRoutes.post("/login", login);
authRoutes.post("/signUp", signUp);

export default authRoutes;
