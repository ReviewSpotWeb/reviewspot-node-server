import commentDao from "../models/daos/comment-dao";

// /api/v1/album/:albumId/review/:reviewId/
const postCommentOnReview = async (req, res) => {
    if (!req.body.content) {
        res.sendStatus(400);
        return;
    }

    const content = req.body.content;
    const [newComment, error] = commentDao.createCommentOnReview(
        reviewId,
        req.session.currentUser._id,
        content
    );
    if (error) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error occurred while trying to create this comment." +
                    "Please try again or contact a site contributor.",
            ],
        });
        return;
    }

    res.status(200);
    res.json({
        newComment,
    });
};

const editACommentOnReview = async (req, res) => {
    if (!req.body.author || !req.body.content) {
        res.sendStatus(400);
    }
};
