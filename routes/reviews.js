import { Router } from "express";
import { userMustBeLoggedIn } from "../middleware/authorization.js";
const reviewRoutes = Router();

// CRUD for album reviews.
reviewRoutes.get("/album/:albumId/review/:id", (req, res) => {});
reviewRoutes.post("/album/:id/review", userMustBeLoggedIn, (req, res) => {});
reviewRoutes.put(
    "/album/:albumId/review/:id",
    userMustBeLoggedIn,
    (req, res) => {}
);
reviewRoutes.delete(
    "/album/:albumId/review/:id",
    userMustBeLoggedIn,
    (req, res) => {}
);

// CRUD for ratings.
reviewRoutes.post(
    "/album/:albumId/review/:id/rate",
    userMustBeLoggedIn,
    (req, res) => {}
);

// CRUD for liking a review.
reviewRoutes.post(
    "/album/:albumId/review/:id/like",
    userMustBeLoggedIn,
    (req, res) => {}
);

// CRUD for comments.
reviewRoutes.post(
    "/album/:albumId/review/:reviewId/comment",
    userMustBeLoggedIn,
    (req, res) => {}
);

reviewRoutes.put(
    "/album/:albumId/review/:reviewId/comment/:id",
    userMustBeLoggedIn,
    (req, res) => {}
);
reviewRoutes.delete(
    "/album/:albumId/review/:reviewId/comment/:id",
    userMustBeLoggedIn,
    (req, res) => {}
);

export default reviewRoutes;
