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
    const errorJSON = {
        errors: [
            "Could not retrieve this album due to an internal server error. Please try again or" +
                "contact a site contributor.",
        ],
    };

    let [album, albumError] = await getAlbumData(albumId);
    if (albumError) {
        res.status(500);
        res.json(errorJSON);
        return;
    }

    let rating, ratingError;
    if (req.session.currentUser) {
        const currentUserId = req.session.currentUser._id;
        [rating, ratingError] = await ratingDao.findRatingByAlbumIdAndUserId(
            albumId,
            currentUserId
        );
    }
    if (ratingError) {
        console.error(ratingError);
        res.status(500);
        res.json(errorJSON);
        return;
    }

    res.status(200);
    if (rating) {
        console.log(rating);
        res.json({
            userRating: rating,
            album,
        });
    } else {
        res.json({ album });
    }
};

// /api/v1/album/:id/reviews
// JSON body should contain a limit and an offset.
export const getAlbumReviews = async (req, res) => {
    const albumId = req.params.id;

    // NOTE: Limit should never be 0 so this is fine,
    // however offset can be 0, and thus a normal
    // Falsy check will not work here.
    if (
        !req.body.limit ||
        req.body.offset == null ||
        !validateOffsetAndLimit(req.body.offset, req.body.limit)
    ) {
        res.sendStatus(400);
        return;
    }

    const { limit, offset } = req.body;
    const [reviews, error] = await reviewDao.findReviewsByAlbumId(albumId);
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

    if (limit * offset >= reviews.length && offset > 0) {
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
export const getAverageRating = async (req, res) => {
    const albumId = req.params.id;
    const [ratings, error] = await ratingDao.findAllRatingsForAlbumId(albumId);
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
    const values = ratings.map((element) => element.rating);
    const sumOfRatings = values.reduce((prev, cur) => prev + cur, 0);
    const avgRating = sumOfRatings / ratings.length;

    res.status(200);
    res.json({
        avgRating,
    });
};

// /api/v1/album/:id/rate
export const rateAlbum = async (req, res) => {
    if (!req.body.rating) {
        console.log(req.body);
        res.sendStatus(400);
        return;
    }
    const albumId = req.params.id;
    const rater = req.session.currentUser._id;
    const [newRating, error] = await ratingDao.createRating(
        albumId,
        rater,
        req.body.rating
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
