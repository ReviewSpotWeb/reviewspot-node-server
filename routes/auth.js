import { Router } from "express";
import { login, signUp } from "../controllers/auth/auth-controller.js";
const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/signUp", signUp);

export default authRoutes;
