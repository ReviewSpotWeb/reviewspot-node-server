import { Report } from "../report.js";

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
        const uri = `/album/${albumId}/review/${reviewId}/comment/${commentId}`;
        const existingReport = await Report.exists({ uri, submittedBy });
        if (existingReport) return [existingReport, null];
        const newReport = new Report({
            submittedBy,
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
        const uri = `/album/${albumId}/review/${reviewId}`;
        const existingReport = await Report.exists({ uri, submittedBy });
        if (existingReport) return [existingReport, null];
        const newReport = new Report({
            submittedBy,
            reason,
            uri,
            contentType: "review",
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
        const reportToDismiss = Report.findByIdAndUpdate(reportId, {
            dismissed: true,
        });
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
