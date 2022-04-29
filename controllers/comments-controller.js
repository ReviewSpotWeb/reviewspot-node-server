import commentDao from "../models/daos/comment-dao.js";

// /api/v1/album/:albumId/review/:reviewId/
export const postCommentOnReview = async (req, res) => {
    if (!req.body.content) {
        res.sendStatus(400);
        return;
    }

    const reviewId = req.params.reviewId;
    const content = req.body.content;
    const [newComment, error] = await commentDao.createCommentOnReview(
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

export const editACommentOnReview = async (req, res) => {
    if (!req.body.content || req.body.content === "") {
        res.sendStatus(400);
    }

    const reviewId = req.params.reviewId;
    const commentId = req.params.commentId;
    const newContent = req.body.content;

    const [updatedComment, error] = await commentDao.editComment(
        reviewId,
        commentId,
        newContent
    );
    if (error) {
        console.error(error);
        res.status(500);
        res.json({
            errors: [
                "An internal server error occurred while attempting to edit this comment. " +
                    "Please try again or contact a site contributor.",
            ],
        });
        return;
    }

    res.status(200);
    res.json({
        comment: updatedComment,
    });
};

export const deleteACommentOnReview = async (req, res) => {
    const commentId = req.params.commentId;
    const reviewId = req.params.reviewId;
    const [delSuccess, error] = await commentDao.deleteComment(
        reviewId,
        commentId
    );
    if (error || !delSuccess) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error occurrred while trying to delete this comment. " +
                    "Please try again or contact a site contributor.",
            ],
        });
    }
    res.sendStatus(200);
};
