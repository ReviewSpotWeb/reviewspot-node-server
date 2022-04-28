import { AlbumRating } from "../album-rating";

const findRatingByAlbumIdAndUserId = async (albumId, userId) => {
    try {
        rating = AlbumRating.findOne({ albumId, rater: userId });
        return rating, null;
    } catch (error) {
        return null, error;
    }
};

const findAllRatingsForAlbumId = async (albumId) => {
    try {
        const ratings = AlbumRating.find({ albumId });
        if (!ratings) return [], error;
        return ratings, error;
    } catch (error) {
        return null, error;
    }
};

// author is of type ObjectId<User>
const createRating = async (albumId, rater, rating) => {
    try {
        const currentRating = await AlbumRating.findOne({ albumId, rater });
        if (currentRating) {
            await currentRating.remove();
        }
        const newRating = new AlbumRating({
            rater,
            rating,
            albumId,
        });
        await newRating.save();
        return newRating, null;
    } catch (error) {
        return null, error;
    }
};

export default {
    findRatingByAlbumIdAndUserId,
    findAllRatingsForAlbumId,
    createRating,
};
