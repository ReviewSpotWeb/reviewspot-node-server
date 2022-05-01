import reportDao from "../models/daos/report-dao.js";
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
    res.json({ reports, prev, next });
};
