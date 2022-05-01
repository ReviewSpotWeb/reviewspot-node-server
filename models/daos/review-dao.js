import { AlbumRating } from "../album-rating.js";
import { Review } from "../review.js";
import mongoose from "mongoose";
import { User } from "../user.js";
import ratingDao from "./rating-dao.js";

// NOTE: Because of the potential data size for a reviews's comments,
// we separate that into its own DAO and route, and thus should never actually
// return that as one of the fields in the object.

// TODO: Include all fields but the comment field.

const findReviewsByAlbumId = async (albumId) => {
    try {
        const reviews = await Review.find({ albumId });
        return reviews ? [reviews, null] : [[], null];
    } catch (error) {
        return [null, error];
    }
};

const findOneReviewById = async (id) => {
    try {
        const review = await Review.findById(id);
        return [review, null];
    } catch (error) {
        return [null, error];
    }
};

const findAllReviewsByUserId = async (userId) => {
    try {
        const reviews = await Review.find({ author: userId });
        return reviews ? [reviews, null] : [[], null];
    } catch (error) {
        return [null, error];
    }
};

const createReview = async (author, albumId, content, ratingValue = null) => {
    try {
        let userRating;
        if (ratingValue == null) {
            userRating = await AlbumRating.findOne({
                albumId,
                author,
            });
        } else {
            userRating = new AlbumRating({
                rater: author,
                rating: ratingValue,
                albumId,
            });
        }
        const givenUser = await User.findById(author);
        const authorInfo = {
            authorId: givenUser._id,
            authorName: givenUser.username,
            authorRole: givenUser.role,
        };
        const newReview = new Review({
            authorInfo,
            albumId,
            content,
            rating: userRating,
        });
        if (ratingValue != null) await userRating.save();
        await newReview.save();
        return [newReview, null];
    } catch (error) {
        return [null, error];
    }
};

const getReviewByUserIdAndAlbumId = async (author, albumId) => {
    try {
        const review = await Review.findOne({
            authorInfo: { authorId: author },
            albumId,
        });
        return [review, null];
    } catch (error) {
        return [null, error];
    }
};

const userOwnsReview = async (userId, reviewId) => {
    try {
        const review = await Review.findById(reviewId);
        return [userId.equals(review.authorInfo.authorId), null];
    } catch (error) {
        return [null, error];
    }
};

const updateReview = async (reviewId, newContent = null, newRating = null) => {
    try {
        const reviewToUpdate = await Review.findById(reviewId);
        let updatedRating, ratingError;
        if (newRating != null) {
            const ratingId = reviewToUpdate.rating._id;
            [updatedRating, ratingError] = await ratingDao.updateRating(
                ratingId,
                newRating
            );
            if (ratingError) throw ratingError;
        }
        let reviewUpdateObject = {};
        if (newContent) reviewUpdateObject[content] = newContent;
        if (updatedRating) reviewUpdateObject[rating] = updatedRating;
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            reviewUpdateObject
        );
        return [updatedReview, null];
    } catch (error) {
        return [null, error];
    }
};

const deleteAReview = async (reviewId) => {
    try {
        const result = await Review.findByIdAndDelete(reviewId);
        return [result != null, null];
    } catch (error) {
        return [null, error];
    }
};

// NOTE: Like actually means to add OR remove a like, depending
// on if the user's ID is in the list of user IDs for individuals
// who have liked this review.
// TODO: Pull vs Push in the array.
const likeAReview = async (userId, reviewId) => {
    try {
        const reviewToLike = await Review.findById(reviewId);
        let updatedReview;
        if (reviewToLike.likedBy.includes(userId)) {
            updatedReview = await Review.findByIdAndUpdate(reviewId, {
                $pull: { likedBy: userId },
            });
        } else {
            updatedReview = await Review.findByIdAndUpdate(reviewId, {
                $push: { likedBy: userId },
            });
        }
        return [updatedReview, null];
    } catch (error) {
        return [null, error];
    }
};

export default {
    findReviewsByAlbumId,
    findOneReviewById,
    getReviewByUserIdAndAlbumId,
    findAllReviewsByUserId,
    createReview,
    updateReview,
    deleteAReview,
    likeAReview,
    userOwnsReview,
};
