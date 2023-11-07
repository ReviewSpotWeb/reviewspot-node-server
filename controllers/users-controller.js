import reviewDao from "../models/daos/review-dao.js";
import userDao from "../models/daos/user-dao.js";
import { getNameFromAlbumId } from "../utils/album-utils.js";
import {
  validateOffsetAndLimit,
  getPageFromModelList,
} from "../utils/pagination.js";

// GET /api/v1/user/:userId
export const getProfileInfo = async (req, res) => {
  const userId = req.params.userId;
  const [userInfo, userInfoError] = await userDao.getUserByUsername(userId);
  const [userStats, userStatsError] = await userDao.getUserStats(userInfo._id);
  if (userInfoError || userStatsError) {
    console.log(userStatsError);
    res.status(500);
    res.json({
      errors: [
        "An internal server error occurred while attempting to fetch this user's profile information. " +
          "Please try again or contact a site contributor.",
      ],
    });
    return;
  }
  const [numReviews, numComments] = userStats;

  res.status(200);
  res.json({ userInfo, numReviews, numComments });
};

// PUT /api/v1/user/:userId
// TODO: Validate bio is not only white space or enters.
// TODO: Sanitize.
export const updateBio = async (req, res) => {
  if (!req.body.bio || req.body.bio === "") {
    res.sendStatus(400);
    return;
  }

  const userId = req.params.userId;
  const bio = req.body.bio.trim();
  if (bio === "") {
    res.sendStatus(400);
    return;
  }

  const [updatedUser, error] = await userDao.updateUserBio(userId, bio);
  if (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error was encountered while trying to update your bio. " +
          "Please try again or contact a site contributor.",
      ],
    });
    return;
  }

  res.status(200);
  res.json({
    updatedUser,
  });
};

export const getUsersReviews = async (req, res) => {
  if (
    !req.query.limit ||
    req.query.offset == null ||
    !validateOffsetAndLimit(req.query.offset, req.query.limit)
  ) {
    res.sendStatus(400);
    return;
  }

  const { userId } = req.params;
  const { limit, offset } = req.query;
  const [userReviews, error] = await reviewDao.findAllReviewsByUserId(userId);
  if (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error has occurred while attempting to fetch this user's reviews. " +
          "Please try again or contact a site admin.",
      ],
    });
    return;
  }
  if (offset > 0 && offset >= userReviews.length) {
    res.status(400);
    res.json({
      errors: ["The given offset is out of range for the number of items."],
    });
    return;
  }
  const pageData = getPageFromModelList(userReviews, offset, limit);
  let reviews;
  try {
    reviews = await Promise.all(
      pageData.listSlice.map(async (review) => {
        const reviewObj = review.toObject();
        const albumId = review.albumId;
        const [albumName, error] = await getNameFromAlbumId(albumId);
        if (error) throw error;
        return { ...reviewObj, albumName };
      })
    );
  } catch (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error has occurred while attempting to fetch album data for this user's reviews. " +
          "Please try again or contact a site admin.",
      ],
    });
    return;
  }
  res.status(200);
  res.json({
    next: pageData.next,
    prev: pageData.prev,
    reviews,
    total: userReviews.length,
  });
};
