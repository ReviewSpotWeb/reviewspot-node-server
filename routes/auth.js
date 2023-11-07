import { Router } from "express";
import {
  isLoggedIn,
  login,
  logout,
  signUp,
} from "../controllers/auth-controller.js";
const authRoutes = Router();

authRoutes.post("/logout", logout);
authRoutes.post("/login", login);
authRoutes.post("/register", signUp);
authRoutes.get("/isLoggedIn", isLoggedIn);

export default authRoutes;
