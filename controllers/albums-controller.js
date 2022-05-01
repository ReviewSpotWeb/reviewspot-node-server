import ratingDao from "../models/daos/rating-dao.js";
import reviewDao from "../models/daos/review-dao.js";
import {
    getAlbumData,
    searchForAlbum,
} from "../services/spotify/spotify-album-service.js";
import {
    getPageFromModelList,
    validateOffsetAndLimit,
} from "../utils/pagination.js";

export const getNewReleases = async (req, res) => {};

// /api/v1/album/:albumId
export const getAlbum = async (req, res) => {
    const albumId = req.params.albumId;
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

    let review, reviewError;
    if (req.session.currentUser) {
        const currentUserId = req.session.currentUser._id;
        [review, reviewError] = await reviewDao.getReviewByUserIdAndAlbumId(
            currentUserId,
            albumId
        );
        if (reviewError) {
            res.status(500);
            res.json(errorJSON);
            return;
        }
    }

    res.status(200);
    if (review) {
        res.json({
            userReview: review,
            album,
        });
    } else {
        res.json({ album });
    }
};

export const searchForAnAlbum = async (req, res) => {
    if (
        !req.query.q ||
        !req.query.limit ||
        !req.query.offset ||
        !validateOffsetAndLimit(req.query.offset, req.query.limit)
    ) {
        res.sendStatus(400);
        return;
    }

    const { q, limit, offset } = req.query;
    let [searchData, error] = await searchForAlbum(q, limit, offset);
    if (error && error.response.status < 500) {
        res.status(400);
        res.json({
            errors: ["Please ensure your limit and offset values are correct."],
        });
        return;
    } else if (error) {
        res.status(500);
        res.json({
            errors: ["An internal server error occurred while attempting to "],
        });
        return;
    }

    // TODO: Append number of reviews and avg rating to albums from search.
    res.status(200);
    res.json(searchData);
};

// /api/v1/album/:albumId/reviews
// TODO: Switch from JSON body to qs params.
// JSON body should contain a limit and an offset.
export const getAlbumReviews = async (req, res) => {
    const albumId = req.params.albumId;

    // NOTE: Limit should never be 0 so this is fine,
    // however offset can be 0, and thus a normal
    // Falsy check will not work here.
    if (
        !req.query.limit ||
        req.query.offset == null ||
        !validateOffsetAndLimit(req.query.offset, req.query.limit)
    ) {
        res.sendStatus(400);
        return;
    }

    const { limit, offset } = req.query;
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

// /api/v1/album/:albumId/avgRating
export const getAverageRating = async (req, res) => {
    const albumId = req.params.albumId;
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

// /api/v1/album/:albumId/rate
export const rateAlbum = async (req, res) => {
    if (!req.body.rating) {
        console.log(req.body);
        res.sendStatus(400);
        return;
    }
    const albumId = req.params.albumId;
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
