import { Router } from "express";
import { getProfileInfo, updateBio } from "../controllers/users-controller.js";
import {
    userIdMustBelongToCurrentUser,
    userIdMustBeValid,
} from "../middleware/general-resources.js";
export const userRoutes = Router();

userRoutes.get("/user/:userId", userIdMustBeValid, getProfileInfo);
userRoutes.get("/user/:userId/reviews", userIdMustBeValid, (req, res) => {});
userRoutes.put(
    "/user/:userId",
    userIdMustBeValid,
    userIdMustBelongToCurrentUser,
    updateBio
);
