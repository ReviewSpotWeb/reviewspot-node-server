import { AlbumRating } from "../models/album-rating.js";
import commentDao from "../models/daos/comment-dao.js";
import reviewDao from "../models/daos/review-dao.js";
import reportDao from "../models/daos/report-dao.js";
import { getAlbumData } from "../services/spotify/spotify-album-service.js";
import {
  getPageFromModelList,
  validateOffsetAndLimit,
} from "../utils/pagination.js";
import {
  getNameFromAlbumId,
  getAlbumsFromAlbumIdList,
} from "../utils/album-utils.js";
import { Review } from "../models/review.js";

// api/v1/popularReviews
export const getPopularReviews = async (_, res) => {
  const serverErrorMsg =
    "An internal server error occurred while attempting to get this resource. " +
    "Please try again or contact a site contributor. ";
  let [popularReviews, error] = await reviewDao.getTop10Reviews();
  if (error) {
    res.status(500);
    res.json({
      errors: [serverErrorMsg],
    });
    return;
  }
  const allAlbumIds = popularReviews.map((review) => review.albumId);
  const albumIds = Array.from(new Set(allAlbumIds));
  try {
    const [albums, albumsError] = await getAlbumsFromAlbumIdList(albumIds);
    if (albumsError) throw albumsError;
    // Merge album with review
    const albumId2Album = {};
    albums.albums.forEach((album) => {
      albumId2Album[album.id] = album;
    });
    popularReviews = popularReviews.map((review) => {
      return {
        review: { ...review },
        album: albumId2Album[review.albumId],
      };
    });
  } catch (error) {
    res.status(500);
    res.json({
      errors: [serverErrorMsg],
    });
    return;
  }
  res.status(200);
  res.json(popularReviews);
};

// api/v1/album/:albumId/review/:reviewId
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

  const reviewId = req.params.reviewId;
  const [review, reviewError] = await reviewDao.findOneReviewById(reviewId);
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

// api/v1/album/:albumId/review/:reviewId/comments
export const getCommentsForReview = async (req, res) => {
  if (
    !req.query.limit ||
    req.query.offset == null ||
    !validateOffsetAndLimit(req.query.offset, req.query.limit)
  ) {
    res.status(400);
    res.json({
      errors: ["Must send an offset and a limit with this request."],
    });
    return;
  }

  const [limit, offset] = [req.query.limit, req.query.offset];
  const reviewId = req.params.reviewId;
  const [comments, commentsDaoError] =
    await commentDao.getAllCommentsWithReviewId(reviewId);
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

  if (offset > 0 && offset >= comments.length) {
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
  const currentUserId = req.session.currentUser._id;
  try {
    const ratingWillBeCreated = req.body.rating != null;
    const ratingAlreadyExists = await AlbumRating.exists({
      albumId,
      rater: currentUserId,
    });
    if (!ratingWillBeCreated && !ratingAlreadyExists) {
      res.status(400);
      res.json({
        errors: [
          "To write a review, a rating must be provided in the creation request of already " +
            "exist for this album by the user.",
        ],
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500);
    res.json({
      errors: [
        "An internal server error occurred while attempting to create this review. " +
          "Please try again or contact a site contributor.",
      ],
    });
    return;
  }

  const [review, creationError] =
    req.body.rating != null
      ? await reviewDao.createReview(
          currentUserId,
          albumId,
          req.body.content,
          req.body.rating
        )
      : await reviewDao.createReview(currentUserId, albumId, req.body.content);

  if (creationError) {
    console.error(creationError);
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

// api/v1/album/:albumId/review/:reviewId
export const deleteAReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  const [successFullyDeleted, error] = await reviewDao.deleteAReview(reviewId);
  if (error || !successFullyDeleted) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error occurred trying to delete this review. " +
          "Please try again or contact a site contributor.",
      ],
    });
    return;
  }

  res.sendStatus(200);
};

// api/v1/album/:albumId/review/:reviewId
export const editAReview = async (req, res) => {
  if (!req.body.rating && !req.body.content) {
    res.sendStatus(400);
    return;
  }

  const albumId = req.params.albumId;
  const reviewId = req.params.reviewId;
  const { rating, content } = req.body;
  const [review, error] = await reviewDao.updateReview(
    reviewId,
    content,
    rating
  );
  const [albumName, albumNameError] = await getNameFromAlbumId(albumId);

  if (error || albumNameError) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error was encountered while attempting to update this review. " +
          "Please try again or contact a site admin.",
      ],
    });
    return;
  }

  const updatedReview = await Review.findById(reviewId);
  res.status(200);
  res.json({ updatedReview: { ...updatedReview.toObject(), albumName } });
};

export const likeAReview = async (req, res) => {
  const userId = req.session.currentUser._id;
  const reviewId = req.params.reviewId;
  const albumId = req.params.albumId;

  const [updatedReview, error] = await reviewDao.likeAReview(userId, reviewId);
  const [albumName, albumNameError] = await getNameFromAlbumId(albumId);
  if (error || !updatedReview || albumNameError) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error was encountered while attempting to like this review. " +
          "Please try again or contact a site admin.",
      ],
    });
    return;
  }

  res.status(200);
  res.json({
    updatedReview: { ...updatedReview.toObject(), albumName },
  });
};

export const reportAReview = async (req, res) => {
  if (!req.body.reason || req.body.reason === "") {
    res.sendStatus(400);
  }

  const { albumId, reviewId } = req.params;
  const { reason } = req.body;
  const currentUserId = req.session.currentUser._id;
  const [report, error] = await reportDao.createReviewReport(
    currentUserId,
    reason,
    albumId,
    reviewId
  );
  if (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error occurred while trying to make this report. " +
          "Please try again or contact a site contributor.",
      ],
    });
    return;
  }

  res.status(200);
  res.json(report);
};
