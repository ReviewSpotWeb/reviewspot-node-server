import { AlbumRating } from "../album-rating.js";
import { Review } from "../review.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

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
        const newReview = new Review({
            author,
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

const userOwnsReview = async (userId, reviewId) => {
    try {
        const review = await Review.findById(reviewId);
        return [userId == review.author, null];
    } catch (error) {
        return [null, error];
    }
};

export default {
    findReviewsByAlbumId,
    findOneReviewById,
    findAllReviewsByUserId,
    createReview,
    userOwnsReview,
};
