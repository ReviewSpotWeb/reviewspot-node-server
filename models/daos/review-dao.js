import { Review } from "../review.js";

const findReviewsByAlbumId = async (albumId) => {
    try {
        const reviews = Review.find({ albumId });
        return reviews ? (reviews, null) : ([], null);
    } catch (error) {
        return null, error;
    }
};

export default { findReviewsByAlbumId };
