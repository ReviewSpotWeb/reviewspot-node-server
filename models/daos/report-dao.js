import { Comment } from "../comment.js";
import { Report } from "../report.js";
import { Review } from "../review.js";

// These two could easily just be a single createReport function with overloads,
// however I wanted to be explicit.
const createCommentReport = async (
    submittedBy,
    reason,
    albumId,
    reviewId,
    commentId
) => {
    try {
        const comment = await Comment.findById(commentId);
        const authorId = comment.authorInfo.authorId;
        const uri = `/album/${albumId}/review/${reviewId}/comment/${commentId}`;
        const existingReport = await Report.exists({ uri, submittedBy });
        if (existingReport) return [existingReport, null];
        const newReport = new Report({
            submittedBy,
            authorId,
            reason,
            uri,
            contentType: "comment",
        });
        await newReport.save();
        return [newReport, null];
    } catch (error) {
        return [null, error];
    }
};

const createReviewReport = async (submittedBy, reason, albumId, reviewId) => {
    try {
        const review = await Review.findById(reviewId);
        const authorId = review.authorInfo.authorId;
        const uri = `/album/${albumId}/review/${reviewId}`;
        const existingReport = await Report.exists({ uri, submittedBy });
        if (existingReport) return [existingReport, null];
        const newReport = new Report({
            submittedBy,
            reason,
            uri,
            contentType: "review",
            authorId,
        });
        await newReport.save();
        return [newReport, null];
    } catch (error) {
        return [null, error];
    }
};

const getActiveReports = async () => {
    try {
        const reports = await Report.find({ dismissed: false }).sort({
            createdAt: -1,
        });
        return [reports, null];
    } catch (error) {
        return [null, error];
    }
};

const dismissReport = async (reportId) => {
    try {
        const reportToDismiss = await Report.findByIdAndUpdate(reportId, {
            dismissed: true,
        });
        return [reportToDismiss, null];
    } catch (error) {
        return [null, error];
    }
};

export default {
    getActiveReports,
    createCommentReport,
    createReviewReport,
    dismissReport,
};
