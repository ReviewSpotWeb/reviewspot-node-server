// The middleware below is to ensure that certain resources exist,
// are owned by a User, or do not already exist.
// Example: Attempting to GET on /api/v1/album/:id where an id is
// a non-existent albumId should result in a 404 error.

import mongoose from "mongoose";
import { Comment } from "../models/comment.js";
import commentDao from "../models/daos/comment-dao.js";
import reviewDao from "../models/daos/review-dao.js";
import { Review } from "../models/review.js";
import { getAlbumData } from "../services/spotify/spotify-album-service.js";
import { User } from "../models/user.js";

// NOTE: To be called after a review is confirmed to exist.
export const userMustOwnReview = async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const reviewId = req.params.reviewId;
  const [userDoesOwn, error] = await reviewDao.userOwnsReview(userId, reviewId);
  if (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error has occurred while trying to retrieve this review.",
      ],
    });
  } else if (!userDoesOwn) {
    res.status(403);
    res.json({
      errors: ["You do not have permission to make changes to this review."],
    });
  } else {
    next();
  }
};

export const albumIdMustBeValid = async (req, res, next) => {
  const albumId = req.params.albumId;
  const [data, error] = await getAlbumData(albumId);
  if (error && error.response.error.message == "invalid id") {
    res.status(404);
    res.json({
      errors: ["The given album ID does not belong to any Spotify album."],
    });
  } else if (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error has occured while attempting to grab the data on this album. " +
          "Please contact a site contributor.",
      ],
    });
  } else {
    next();
  }
};

export const reviewIdMustBeValid = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const isValid = mongoose.isValidObjectId(reviewId);
    if (!isValid) {
      res.status(400);
      res.json({
        errors: ["The provided id is not valid."],
      });
      return;
    }

    const reviewDoesExist = await Review.exists({ _id: reviewId });
    if (reviewDoesExist) {
      next();
    } else {
      res.status(404);
      res.json({
        errors: ["This ID does not match any existing reviews."],
      });
    }
  } catch (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error occurred while trying to retrieve the data for this review. " +
          "Please contact a site contributor.",
      ],
    });
  }
};

export const commentIdMustBeValid = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const isValid = mongoose.isValidObjectId(commentId);
    if (!isValid) {
      res.status(400);
      res.json({
        errors: ["The provided id is not valid."],
      });
      return;
    }

    const commentExists = await Comment.exists({ _id: commentId });
    if (commentExists) {
      next();
    } else {
      res.status(404);
      res.json({
        errors: ["There is no comment with the given ID."],
      });
    }
  } catch (error) {
    res.status(500);
    res.json({
      errors: [
        "An error occurred while trying to fetch comment data." +
          "Please contact a site contributor.",
      ],
    });
  }
};

export const userMustOwnComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const userId = req.session.currentUser._id;
  const [userIsOwner, error] = await commentDao.userOwnsComment(
    userId,
    commentId
  );
  if (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error occurred while trying to get comment data." +
          "Please contact a site contributor.",
      ],
    });
  } else if (userIsOwner) {
    next();
  } else {
    res.status(403);
    res.json({
      errors: [
        "You do not have sufficient permission to make changes to this comment.",
      ],
    });
  }
};

export const reviewCannotAlreadyExist = async (req, res, next) => {
  try {
    const albumId = req.params.albumId;
    const currentUserId = req.session.currentUser._id;
    const alreadyExists = await Review.exists({
      "authorInfo.authorId": currentUserId,
      albumId,
    });
    if (alreadyExists) {
      res.status(400);
      res.json({
        errors: ["You've already written a review for this album."],
      });
    } else {
      next();
    }
  } catch (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error has occurred while trying to process your request. " +
          "Please contact a site contributor.",
      ],
    });
  }
};

export const userIdMustBeValid = async (req, res, next) => {
  const userId = req.params.userId;
  if (!mongoose.isValidObjectId(userId)) {
    res.status(400);
    res.json({
      errors: ["The given user ID is not a valid instance of an object ID."],
    });
    return;
  }

  try {
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      res.status(404);
      res.json({
        errors: ["No user exists with that object ID."],
      });
    } else {
      next();
    }
  } catch (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error occurred while fetching this user's data. " +
          "Please contact a site contributor.",
      ],
    });
  }
};

export const userIdMustBelongToCurrentUser = async (req, res, next) => {
  const userId = req.params.userId;
  const currentUserId = req.session.currentUser._id;
  if (!currentUserId.equals(userId)) {
    res.sendStatus(403);
  } else {
    next();
  }
};
