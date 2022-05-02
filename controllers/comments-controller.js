import commentDao from "../models/daos/comment-dao.js";
import reportDao from "../models/daos/report-dao.js";
import { getNameFromAlbumId } from "../utils/album-utils.js";

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

    const albumId = req.params.albumId;
    const reviewId = req.params.reviewId;
    const commentId = req.params.commentId;
    const newContent = req.body.content;

    const [updatedComment, commentError] = await commentDao.editComment(
        reviewId,
        commentId,
        newContent
    );
    const [albumName, albumNameError] = await getNameFromAlbumId(albumId);
    if (error || albumNameError) {
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
        comment: { ...updatedComment.toObject(), albumName },
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

export const getACommentOnReview = async (req, res) => {
    const commentId = req.params.commentId;
    const [comment, error] = await commentDao.getAComment(commentId);
    if (error) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error was encountered while fetching this comment. " +
                    "Please try again or contact a site contributor.",
            ],
        });
    }

    res.status(200);
    res.json(comment);
};

export const reportAComment = async (req, res) => {
    if (!req.body.reason || req.body.reason === "") {
        res.sendStatus(400);
    }

    const { albumId, reviewId, commentId } = req.params;
    const { reason } = req.body;
    const currentUserId = req.session.currentUser._id;
    const [report, error] = await reportDao.createCommentReport(
        currentUserId,
        reason,
        albumId,
        reviewId,
        commentId
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
