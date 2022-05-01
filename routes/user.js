import { Router } from "express";
import {
    getProfileInfo,
    getUsersReviews,
    updateBio,
} from "../controllers/users-controller.js";
import {
    userIdMustBelongToCurrentUser,
    userIdMustBeValid,
} from "../middleware/general-resources.js";
export const userRoutes = Router();

userRoutes.get("/user/:userId", userIdMustBeValid, getProfileInfo);
userRoutes.get("/user/:userId/reviews", userIdMustBeValid, getUsersReviews);
userRoutes.put(
    "/user/:userId",
    userIdMustBeValid,
    userIdMustBelongToCurrentUser,
    updateBio
);
