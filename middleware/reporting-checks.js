import { Report } from "../models/report.js";

const userCannotHaveTwoReports = async (req, res, next) => {
    const { albumId, reviewId, commentId } = req.params;
    let uri = `/album/${albumId}/review/${reviewId}`;
    if (commentId) uri += `/comment/${commentId}`;
    const currentUserId = req.session.currentUser._id;
    try {
        const report = await Report.exists({ submittedBy: currentUserId, uri });
        if (report) {
            res.status(400);
            res.json({
                errors: ["You cannot report a comment or review twice."],
            });
        } else {
            next();
        }
    } catch (error) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error occurred while attempting to make this report. ",
            ],
        });
    }
};
