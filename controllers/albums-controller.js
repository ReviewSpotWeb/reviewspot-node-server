import ratingDao from "../models/daos/rating-dao.js";
import reviewDao from "../models/daos/review-dao.js";
import {
  getAlbumData,
  getNewReleases,
  searchForAlbum,
} from "../services/spotify/spotify-album-service.js";
import {
  getPageFromModelList,
  validateOffsetAndLimit,
} from "../utils/pagination.js";

export const getUserNewReleases = async (req, res) => {
  if (
    !req.query.limit ||
    req.query.offset == null ||
    !validateOffsetAndLimit(req.query.offset, req.query.limit)
  ) {
    res.sendStatus(400);
    return;
  }
  const errorMsg =
    "An internal server error occurred while attempting to get new releases. " +
    "Please try again or contact a site contirbutor.";
  const limit = parseInt(req.query.limit);
  const offset = parseInt(req.query.offset);
  // https://stackoverflow.com/questions/70321094/how-to-get-the-clients-country-in-express-js
  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  let [newReleasesData, error] = await getNewReleases(ipAddr, limit, offset);
  if (error) {
    res.status(500);
    res.json({
      errors: [errorMsg],
    });
    return;
  }

  try {
    newReleasesData = {
      ...newReleasesData,
      albums: await Promise.all(
        newReleasesData.albums.map(async (album) => {
          const [numReviews, numReviewsError] =
            await reviewDao.getNumberOfReviewsForAlbum(album.id);
          if (numReviewsError) throw numReviewsError;
          const [ratings, ratingsError] =
            await ratingDao.findAllRatingsForAlbumId(album.id);
          if (ratingsError) throw ratingsError;
          const ratingValues = ratings.map((r) => r.rating);
          const avgRating =
            ratings.length > 0
              ? ratingValues.reduce((r1, r2) => r1 + r2, 0) / ratings.length
              : null;
          return { ...album, numReviews, avgRating };
        })
      ),
    };
  } catch (error) {
    res.status(500);
    res.json({
      errors: [errorMsg],
    });
    return;
  }

  res.status(200);
  res.json(newReleasesData);
};

// /api/v1/album/:albumId
export const getAlbum = async (req, res) => {
  const albumId = req.params.albumId;
  const errorJSON = {
    errors: [
      "Could not retrieve this album due to an internal server error. Please try again or" +
        "contact a site contributor.",
    ],
  };

  const [album, albumError] = await getAlbumData(albumId);
  const [albumRatings, ratingError] = await ratingDao.findAllRatingsForAlbumId(
    albumId
  );
  const ratingVals = albumRatings.map((r) => r.rating);

  const avgRating =
    ratingVals.length >= 0
      ? ratingVals.length > 1
        ? ratingVals.reduce((prev, curr) => prev + curr, 0) / ratingVals.length
        : ratingVals[0]
      : null;

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
      album: { ...album, avgRating },
    });
  } else {
    res.json({ album: { ...album, avgRating } });
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
  let [data, error] = await searchForAlbum(q, limit, offset);
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

  let searchData;
  try {
    searchData = {
      // https://stackoverflow.com/questions/40140149/use-async-await-with-array-map
      albums: await Promise.all(
        data.albums.map(async (album) => {
          let [numReviews, numReviewsError] =
            await reviewDao.getNumberOfReviewsForAlbum(album.id);
          if (numReviewsError) throw numReviewsError;
          let [ratings, ratingsError] =
            await ratingDao.findAllRatingsForAlbumId(album.id);
          if (ratingsError) throw ratingsError;
          const ratingValues = ratings.map((r) => r.rating);
          const avgRating =
            ratingValues.length >= 0
              ? ratingValues.length > 1
                ? ratingValues.reduce((prev, curr) => prev + curr, 0) /
                  ratingValues.length
                : ratingValues[0]
              : null;
          return { ...album, avgRating, numReviews };
        })
      ),
      limit: data.limit,
      offset: data.offset,
      total: data.total,
    };
  } catch (error) {
    res.status(500);
    res.json({
      errors: [
        "An internal server error was encountered while attempting to retrieve search data. " +
          "Please try again or contact a site contributor.",
      ],
    });
    return;
  }
  if (data.nextURL)
    searchData.next = {
      offset: data.offset + data.limit,
      limit: data.limit,
    };
  if (data.prevURL)
    searchData.prev = {
      offset: data.offset - data.limit,
      limit: searchData.limit,
    };

  // TODO: Append number of reviews and avg rating to albums from search.
  res.status(200);
  res.json(searchData);
};

// /api/v1/album/:albumId/reviews
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

  if (offset > 0 && offset >= reviews.length) {
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
