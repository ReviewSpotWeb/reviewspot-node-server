import { Router } from "express";
import {
    dismissAReport,
    getActiveReports,
} from "../controllers/moderator-controller.js";
export const moderatorRoutes = Router();

moderatorRoutes.get("/reports", getActiveReports);
moderatorRoutes.put("/report/:reportId/dismiss", dismissAReport);
