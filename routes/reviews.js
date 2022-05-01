import { Router } from "express";
import {
    deleteACommentOnReview,
    editACommentOnReview,
    getACommentOnReview,
    postCommentOnReview,
} from "../controllers/comments-controller.js";
import {
    createAReview,
    deleteAReview,
    editAReview,
    getCommentsForReview,
    getReview,
    likeAReview,
} from "../controllers/reviews-controller.js";
import { userMustBeLoggedIn } from "../middleware/authorization.js";
import {
    albumIdMustBeValid,
    commentIdMustBeValid,
    reviewCannotAlreadyExist,
    reviewIdMustBeValid,
    userMustOwnComment,
    userMustOwnReview,
} from "../middleware/general-resources.js";
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
    reviewCannotAlreadyExist,
    createAReview
);
reviewRoutes.put(
    "/album/:albumId/review/:reviewId",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    userMustOwnReview,
    editAReview
);
reviewRoutes.delete(
    "/album/:albumId/review/:reviewId",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    userMustOwnReview,
    deleteAReview
);

// Route for liking a review.
reviewRoutes.post(
    "/album/:albumId/review/:reviewId/like",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    likeAReview
);

// CRUD for comments.
reviewRoutes.get(
    "/album/:albumId/review/:reviewId/comments",
    albumIdMustBeValid,
    reviewIdMustBeValid,
    getCommentsForReview
);

reviewRoutes.get(
    "/album/:albumId/review/:reviewId/comment/:commentId",
    albumIdMustBeValid,
    reviewIdMustBeValid,
    commentIdMustBeValid,
    getACommentOnReview
);

reviewRoutes.post(
    "/album/:albumId/review/:reviewId/comment",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    postCommentOnReview
);

reviewRoutes.put(
    "/album/:albumId/review/:reviewId/comment/:commentId",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    commentIdMustBeValid,
    userMustOwnComment,
    editACommentOnReview
);
reviewRoutes.delete(
    "/album/:albumId/review/:reviewId/comment/:commentId",
    userMustBeLoggedIn,
    albumIdMustBeValid,
    reviewIdMustBeValid,
    commentIdMustBeValid,
    userMustOwnComment,
    deleteACommentOnReview
);

export default reviewRoutes;
