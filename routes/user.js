import { Router } from "express";
import { banUser } from "../controllers/moderator-controller.js";
import {
    getProfileInfo,
    getUsersReviews,
    updateBio,
} from "../controllers/users-controller.js";
import {
    userMustBeAModerator,
    userMustBeLoggedIn,
} from "../middleware/authorization.js";
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
userRoutes.put(
    "/user/:userId/ban",
    userMustBeLoggedIn,
    userMustBeAModerator,
    userIdMustBeValid,
    banUser
);
