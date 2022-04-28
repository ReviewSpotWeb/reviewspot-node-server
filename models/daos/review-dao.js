import { Review } from "../review.js";

// NOTE: Because of the potential data size for a reviews's comments,
// we separate that into its own DAO and route, and thus should never actually
// return that as one of the fields in the object.

// TODO: Include all fields but the comment field.

const findReviewsByAlbumId = async (albumId) => {
    try {
        const reviews = Review.find({ albumId });
        return reviews ? (reviews, null) : ([], null);
    } catch (error) {
        return null, error;
    }
};

const findOneReviewById = async (id) => {
    try {
        const review = Review.findById(id);
        return review, null;
    } catch (error) {
        return null, error;
    }
};

const findAllReviewsByUserId = async (userId) => {
    try {
        const reviews = Review.find({ author: userId });
        return reviews ? (reviews, null) : ([], null);
    } catch (error) {
        return null, error;
    }
};

export default {
    findReviewsByAlbumId,
    findOneReviewById,
    findAllReviewsByUserId,
};
