import banAuditDao from "../models/daos/ban-audit-dao.js";
import reportDao from "../models/daos/report-dao.js";
import userDao from "../models/daos/user-dao.js";
import {
    validateOffsetAndLimit,
    getPageFromModelList,
} from "../utils/pagination.js";

// /api/v1/moderator/report/:reportId
export const dismissAReport = async (req, res) => {
    const { reportId } = req.params;
    const [dismissedReport, error] = await reportDao.dismissReport(reportId);
    if (error) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error occurred while carrying out this operaiton. " +
                    "Please try again or contact a site admin.",
            ],
        });
    }
    res.status(200);
    res.json(dismissedReport);
};

// /api/moderator/reports
export const getActiveReports = async (req, res) => {
    if (req.query.limit == null || req.query.offset == null) {
        res.sendStatus(400);
        return;
    }

    let limit, offset;
    try {
        limit = parseInt(req.query.limit);
        offset = parseInt(req.query.offset);
    } catch (error) {
        res.sendStatus(400);
        return;
    }
    if (!validateOffsetAndLimit(offset, limit)) {
        res.sendStatus(400);
        return;
    }

    const [activeReports, error] = await reportDao.getActiveReports();
    if (error) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error occurred while attempting to get active reports. " +
                    "Please try again or contact a site contirbutor.",
            ],
        });
        return;
    }

    if (offset > 0 && offset >= activeReports.length) {
        res.status(400);
        res.json({
            errors: ["The given offset is out of range."],
        });
        return;
    }

    const pageData = getPageFromModelList(activeReports, offset, limit);
    const { prev, next } = pageData;
    const reports = pageData.listSlice;
    res.status(200);
    res.json({ reports, prev, next, total: activeReports.length });
};

// /api/v1/moderator/banAudits
export const getBanAudits = async (req, res) => {
    if (req.query.offset == null || req.query.limit == null) {
        res.sendStatus(400);
        return;
    }

    let offset, limit;
    try {
        offset = parseInt(req.query.offset);
        limit = parseInt(req.query.limit);
        if (!validateOffsetAndLimit(offset, limit)) {
            res.sendStatus(400);
            return;
        }
    } catch (error) {
        res.sendStatus(400);
        return;
    }

    const [banAudits, banAuditError] = await banAuditDao.getBanAuditsByDate();
    if (banAuditError) {
        res.status(500);
        res.json({
            errors: [
                "An error has occurred while attempting to retrieve ban audits. " +
                    "Please try again or contact a site contributor.",
            ],
        });
        return;
    }

    if (offset > 0 && offset >= banAudits.length) {
        res.status(400);
        res.json({
            errors: [
                "The given offset is out of range for the number of ban audits.",
            ],
        });
        return;
    }

    const pageData = getPageFromModelList(banAudits, offset, limit);
    const { prev, next } = pageData;
    const audits = pageData.listSlice;

    res.status(200);
    res.json({
        audits,
        prev,
        next,
        total: banAudits.length,
    });
};

// /api/v1/user/:userId/ban
export const banUser = async (req, res) => {
    if (!req.body.reason || req.body.reason === "") {
        res.sendStatus(400);
        return;
    }

    const { reason } = req.body;
    const { userId } = req.params;
    const currentUserId = req.session.currentUser._id;
    let errorMessage =
        "An internal server error occurred while trying to ban this user. ";
    const [newBanAudit, banAuditError] = await banAuditDao.createBanAudit(
        userId,
        currentUserId,
        reason
    );
    if (banAuditError) {
        res.status(500);
        res.json({
            errors: [
                errorMessage +
                    "Please try again or contact a site contributor.",
            ],
        });
        return;
    }
    const [userBanned, banError] = await userDao.banUser(userId);
    if (banError) {
        res.status(500);
        res.json({
            errors: [
                errorMessage +
                    `Please contact a site admin and consider apologizing to User#${userId}`,
            ],
        });
        return;
    }

    res.status(200);
    res.json(newBanAudit);
};
