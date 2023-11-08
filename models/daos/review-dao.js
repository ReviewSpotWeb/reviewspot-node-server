import { AlbumRating } from "../album-rating.js";
import { Review } from "../review.js";
import { User } from "../user.js";
import { Comment } from "../comment.js";
import ratingDao from "./rating-dao.js";

// NOTE: Because of the potential data size for a reviews's comments,
// we separate that into its own DAO and route, and thus should never actually
// return that as one of the fields in the object.

// TODO: Include all fields but the comment field.

const findReviewsByAlbumId = async (albumId) => {
  try {
    const reviews = await Review.find({ albumId }).sort({ createdAt: -1 });
    return reviews ? [reviews, null] : [[], null];
  } catch (error) {
    return [null, error];
  }
};

const findOneReviewById = async (id) => {
  try {
    const review = await Review.findById(id);
    return [review, null];
  } catch (error) {
    return [null, error];
  }
};

const findAllReviewsByUsername = async (username) => {
  try {
    const reviews = await Review.find({
      "authorInfo.authorName": username,
    }).sort({ createdAt: -1 });
    return reviews ? [reviews, null] : [[], null];
  } catch (error) {
    return [null, error];
  }
};

const createReview = async (author, albumId, content, ratingValue = null) => {
  try {
    let userRating;
    if (ratingValue == null) {
      userRating = await AlbumRating.findOne({
        albumId,
        author,
      });
    } else {
      userRating = new AlbumRating({
        rater: author,
        rating: ratingValue,
        albumId,
      });
    }
    const givenUser = await User.findById(author);
    const authorInfo = {
      authorId: givenUser._id,
      authorName: givenUser.username,
      authorRole: givenUser.role,
    };
    const newReview = new Review({
      authorInfo,
      albumId,
      content,
      rating: userRating,
    });
    if (ratingValue != null) await userRating.save();
    await newReview.save();
    return [newReview, null];
  } catch (error) {
    return [null, error];
  }
};

const getReviewByUserIdAndAlbumId = async (author, albumId) => {
  try {
    const review = await Review.findOne({
      authorInfo: { authorId: author },
      albumId,
    });
    return [review, null];
  } catch (error) {
    return [null, error];
  }
};

const userOwnsReview = async (userId, reviewId) => {
  try {
    const review = await Review.findById(reviewId);
    return [userId.equals(review.authorInfo.authorId), null];
  } catch (error) {
    return [null, error];
  }
};

const updateReview = async (reviewId, newContent = null, newRating = null) => {
  try {
    const reviewToUpdate = await Review.findById(reviewId);
    const ratingId = reviewToUpdate.rating._id.toString();
    let updatedRating, ratingError;
    if (newRating != null) {
      [updatedRating, ratingError] = await ratingDao.updateRating(
        ratingId,
        newRating
      );
      if (ratingError) throw ratingError;
    }

    let reviewUpdateObject = {};
    if (newContent) reviewUpdateObject.content = newContent;
    if (updatedRating) reviewUpdateObject.rating = updatedRating;
    const updateReview = await Review.findByIdAndUpdate(
      reviewId,
      reviewUpdateObject
    );

    const updatedReview = await Review.findById(reviewId);
    return [updatedReview, null];
  } catch (error) {
    return [null, error];
  }
};

const deleteAReview = async (reviewId) => {
  try {
    const review = await Review.findById(reviewId);
    const ratingId = review.rating._id;
    await AlbumRating.deleteOne({ _id: ratingId });
    const result = await Review.findByIdAndDelete(reviewId);
    await Comment.deleteMany({ reviewId: reviewId });

    return [result != null, null];
  } catch (error) {
    return [null, error];
  }
};

// NOTE: Like actually means to add OR remove a like, depending
// on if the user's ID is in the list of user IDs for individuals
// who have liked this review.
// TODO: Pull vs Push in the array.
const likeAReview = async (userId, reviewId) => {
  try {
    const reviewToLike = await Review.findById(reviewId);
    let updatedReview;
    if (reviewToLike.likedBy.includes(userId)) {
      updatedReview = await Review.findByIdAndUpdate(reviewId, {
        $pull: { likedBy: userId },
      });
    } else {
      updatedReview = await Review.findByIdAndUpdate(reviewId, {
        $push: { likedBy: userId },
      });
    }
    return [updatedReview, null];
  } catch (error) {
    return [null, error];
  }
};

const getNumberOfReviewsForAlbum = async (albumId) => {
  try {
    const numReviews = await Review.count({ albumId });
    return [numReviews, null];
  } catch (error) {
    return [null, error];
  }
};

// NOTE: Rank is defined by sorting the site's reviews by number of likes first,
// and then by number of comments.
const getTop10Reviews = async () => {
  try {
    const reviews = await Review.aggregate([
      {
        $project: {
          authorInfo: 1,
          albumId: 1,
          content: 1,
          likedBy: 1,
          numComments: 1,
          rating: 1,
          createdAt: 1,
          updatedAt: 1,
          numLikes: {
            $size: "$likedBy",
          },
        },
      },
      {
        $sort: { numLikes: -1, numComments: -1 },
      },
      {
        $limit: 10,
      },
    ]);
    return [reviews ? reviews : [], null];
  } catch (error) {
    return [null, error];
  }
};

export default {
  findReviewsByAlbumId,
  findOneReviewById,
  getReviewByUserIdAndAlbumId,
  findAllReviewsByUsername,
  createReview,
  updateReview,
  deleteAReview,
  likeAReview,
  userOwnsReview,
  getNumberOfReviewsForAlbum,
  getTop10Reviews,
};
