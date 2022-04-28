import commentDao from "../models/daos/comment-dao.js";
import reviewDao from "../models/daos/review-dao.js";
import { getAlbumData } from "../services/spotify/spotify-album-service.js";
import {
    getPageFromModelList,
    validateOffsetAndLimit,
} from "../utils/pagination.js";

// api/v1/album/:albumId/review/:id
export const getReview = async (req, res) => {
    const albumId = req.params.albumId;
    const [albumData, albumError] = await getAlbumData(albumId);
    if (albumError) {
        res.status(500);
        res.json({
            errors: [
                "Could not retrieve album data due to an internal server error. Please try again or contact a site contributor.",
            ],
        });
        return;
    }

    const reviewId = req.params.id;
    const [review, reviewError] = reviewDao.findOneReviewById(reviewId);
    if (reviewError) {
        res.status(500);
        res.json({
            errors: [
                "Could not retrieve review data due to an internal server error. Please try again or contact a site contributor.",
            ],
        });
        return;
    }

    res.status(200);
    res.json({
        albumData,
        review,
    });
};

// api/v1/album/:albumId/review/:id/comments
export const getCommentsForReview = async (req, res) => {
    if (
        !req.body.limit ||
        !req.body.offset ||
        !validateOffsetAndLimit(req.body.offset, req.body.limit)
    ) {
        res.status(400);
        res.json({
            errors: ["Must send an offset and a limit with this request."],
        });
        return;
    }

    const reviewId = req.params.id;
    const [comments, commentsDaoError] =
        await commentDao.getAllCommentsWithReviewId(reviewId);
    // TODO: What happens if this review does not exist?
    if (commentsDaoError) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error occured while trying to retrieve the comments for this review." +
                    "Please try again or contact a site contributor.",
            ],
        });
        return;
    }
    if (!comments) {
        res.status(404);
        res.json({
            errors: ["There are no comments for this review."],
        });
    }

    if (offset * limit >= comments.length && offset != 0) {
        res.status(400);
        res.json({
            errors: [
                "The given offset is out of range for the total number of items.",
            ],
        });
        return;
    }

    const paginationData = getPageFromModelList(comments, offset, limit);
    const { next, prev } = paginationData;
    const commentsSlice = paginationData.listSlice;

    res.status(200);
    res.json({
        comments: commentsSlice,
        next,
        prev,
        total: comments.length,
    });
};

// api/v1/album/:albumId/review
export const createAReview = async (req, res) => {
    if (!req.body.content || req.body.content === "") {
        res.sendStatus(400);
        return;
    }

    const albumId = req.params.albumId;
    const [review, creationError] =
        req.body.rating != null
            ? await reviewDao.createReview(
                  req.session.currentUser._id,
                  albumId,
                  req.body.content
              )
            : await reviewDao.createReview(
                  req.session.currentUser._id,
                  albumId,
                  req.body.content,
                  req.body.rating
              );

    if (creationError) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error was encountered while attempting to create this review." +
                    "Please try again or contact a site admin.",
            ],
        });
        return;
    }

    res.status(200);
    res.json(review);
};
