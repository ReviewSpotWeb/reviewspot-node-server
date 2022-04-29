import { Router } from "express";
import {
    createAReview,
    getCommentsForReview,
    getReview,
} from "../controllers/reviews-controller.js";
import { userMustBeLoggedIn } from "../middleware/authorization.js";
import {
    albumIdMustBeValid,
    commentIdMustBeValid,
    reviewIdMustBeValid,
    userMustOwnComment,
    userMustOwnReview,
} from "../middleware/resources.js";
const reviewRoutes = Router();

// CRUD for album reviews.
reviewRoutes.get(
    "/album/:albumId/review/:reviewId",
    albumIdMustBeValid,
    reviewIdMustBeValid,
    getReview
);
reviewRoutes.post(
    "/album/:albumId/review",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    createAReview
);
reviewRoutes.put(
    "/album/:albumId/review/:reviewId",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    userMustOwnReview
);
reviewRoutes.delete(
    "/album/:albumId/review/:reviewId",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    userMustOwnReview
);

// CRUD for liking a review.
reviewRoutes.post(
    "/album/:albumId/review/:reviewId/like",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid
);

// CRUD for comments.
reviewRoutes.get(
    "/album/:albumId/review/:reviewId/comments",
    albumIdMustBeValid,
    reviewIdMustBeValid,
    getCommentsForReview
);

reviewRoutes.post(
    "/album/:albumId/review/:reviewId/comment",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid
);

reviewRoutes.put(
    "/album/:albumId/review/:reviewId/comment/:commentId",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    commentIdMustBeValid,
    userMustOwnComment,
    (req, res) => {}
);
reviewRoutes.delete(
    "/album/:albumId/review/:reviewId/comment/:commentId",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    commentIdMustBeValid,
    userMustOwnComment,
    (req, res) => {}
);

export default reviewRoutes;
