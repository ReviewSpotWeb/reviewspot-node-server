import { AlbumRating } from "../album-rating.js";

const findRatingByAlbumIdAndUserId = async (albumId, userId) => {
    try {
        const rating = await AlbumRating.findOne({ albumId, rater: userId });
        return [rating, null];
    } catch (error) {
        return [null, error];
    }
};

const findAllRatingsForAlbumId = async (albumId) => {
    try {
        const ratings = await AlbumRating.find({ albumId });
        if (!ratings) return [[], null];
        return [ratings, null];
    } catch (error) {
        return [null, error];
    }
};

// author is of type ObjectId<User>
const createRating = async (albumId, rater, rating) => {
    try {
        const newRating = new AlbumRating({
            rater,
            rating,
            albumId,
        });
        await newRating.save();
        return [newRating, null];
    } catch (error) {
        return [null, error];
    }
};

const updateRating = async (ratingId, newRating) => {
    try {
        const updatedRating = await AlbumRating.findByIdAndUpdate(ratingId, {
            rating: newRating,
        });
        return [updatedRating, null];
    } catch (error) {
        return [null, error];
    }
};

export default {
    findRatingByAlbumIdAndUserId,
    findAllRatingsForAlbumId,
    createRating,
    updateRating,
};
