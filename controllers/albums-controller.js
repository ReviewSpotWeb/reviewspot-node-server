import reviewDao from "../../models/daos/review-dao.js";
import { getAlbumData } from "../../services/spotify/spotify-album-service.js";

// /api/v1/album/:id
export const getAlbum = async (req, res) => {
    const albumId = req.params.id;
    const [data, error] = await getAlbumData(albumId);
    if (error) {
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
    res.json(data);
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

    if (reviews.length < limit * offset) {
        res.status(400);
        res.json({
            errors: [
                "The given offset is out of range for the total number of reviews associated with this album.",
            ],
        });
    }

    let prev, next;
    if (offset == 0) {
        prev = null;
    } else {
        prev = { offset: offset - 1, limit };
    }

    if ((offset + 1) * limit > reviews.length) {
        next = null;
    } else {
        next = { offset: offset + 1, limit };
    }

    const startIndex = offset * limit;
    const lastIndexBasedOnOffset = (offset + 1) * limit - 1;
    const lastIndexOfReviews = reviews.length - 1;
    const reviewsToSend =
        lastIndexBasedOnOffset >= lastIndexOfReviews
            ? reviews.slice(startIndex)
            : reviews.slice(startIndex, lastIndexBasedOnOffset);

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

const validateOffsetAndLimit = (offset, limit) => {
    return offset >= 0 && limit > 0 && limit <= 50;
};
