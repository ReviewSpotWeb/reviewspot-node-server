import ratingDao from "../models/daos/rating-dao.js";
import reviewDao from "../models/daos/review-dao.js";
import { getAlbumData } from "../services/spotify/spotify-album-service.js";
import {
    getPageFromModelList,
    validateOffsetAndLimit,
} from "../utils/pagination.js";

// /api/v1/album/:id
export const getAlbum = async (req, res) => {
    const albumId = req.params.id;
    const [album, albumError] = await getAlbumData(albumId);
    let rating, ratingError;
    if (req.session.currentUser) {
        const currentUserId = req.session.currentUser._id;
        rating,
            (ratingError = ratingDao.findRatingByAlbumIdAndUserId(
                albumId,
                currentUserId
            ));
    }

    if (albumError || ratingError) {
        res.status(500);
        res.json({
            errors: [
                "Could not retrieve this album due to an internal server error. Please try again or" +
                    "contact a site contributor.",
            ],
        });
        return;
    }

    res.status(200);
    res.json(rating ? { album, userRating: rating } : { album });
};

// /api/v1/album/:id/reviews
// JSON body should contain a limit and an offset.
export const getAlbumReviews = async (req, res) => {
    const albumId = req.params.id;
    if (
        !req.body.limit ||
        !req.body.offset ||
        !validateOffsetAndLimit(req.body.offset, req.body.limit)
    ) {
        res.sendStatus(400);
        return;
    }

    const [reviews, error] = reviewDao.findReviewsByAlbumId(albumId);
    if (error) {
        res.status(500);
        res.json({
            errors: [
                "Could not retrieve reviews for this album due to an internal server error. " +
                    "Please try again or contact a site contributor.",
            ],
        });
        return;
    }

    if (limit * offset >= reviews.length) {
        res.status(400);
        res.json({
            errors: [
                "The given offset is out of range for the total number of reviews associated with this album.",
            ],
        });
    }

    const pageData = getPageFromModelList(reviews, offset, limit);
    const { prev, next } = pageData;
    const reviewsToSend = pageData.listSlice;

    res.status(200);
    res.json({
        reviews: reviewsToSend,
        total: reviews.length,
        prev,
        next,
        limit,
        offset,
    });
};

// /api/v1/album/:id/avgRating
const getAverageRating = async (req, res) => {
    const albumId = req.params.id;
    const [ratings, error] = ratingDao.findAllRatingsForAlbumId(albumId);
    if (error) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error was encountered attempting to retrieve the ratings for this album." +
                    "Pleas try again or contact a site contributor.",
            ],
        });
        return;
    }

    const sumOfRatings = ratings.reduce((prev, cur) => prev + cur, 0);
    const avgRating = sumOfRatings / ratings.length;

    res.status(200);
    res.json({
        avgRating,
    });
};

// /api/v1/album/:id/rate
const rateAlbum = async (req, res) => {
    const albumId = req.params.id;
    if (!req.rating || !req.rater) {
        res.sendStatus(400);
        return;
    }
    const [newRating, error] = ratingDao.createRating(
        albumId,
        req.rater,
        req.rating
    );

    if (error) {
        res.status(500);
        res.json({
            errors: [
                "Ran into an internal server error trying to create this review." +
                    "Please try again or contact a sight contributor.",
            ],
        });
    }

    res.status(200);
    res.json({
        newRating,
    });
};
