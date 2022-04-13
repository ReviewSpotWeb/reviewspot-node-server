import express from "express";
import { Router } from "express";
import { login, signUp } from "../controllers/auth/auth-controller";
const router = Router();

router.use("/login", login);
router.use("/signUp", signUp);
