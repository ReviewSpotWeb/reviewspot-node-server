import { BanAudit } from "../ban-audit.js";

const createBanAudit = async (bannedUserId, submittedById, reason) => {
    try {
        const newAudit = new BanAudit({
            bannedUser: bannedUserId,
            submittedBy: submittedById,
            reason,
        });
        await newAudit.save();
        return [newAudit, null];
    } catch (error) {
        return [null, error];
    }
};

export default { createBanAudit };
