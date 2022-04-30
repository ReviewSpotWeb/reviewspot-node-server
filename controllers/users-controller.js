import userDao from "../models/daos/user-dao";

// GET /api/v1/user/:userId
export const getProfileInfo = async (req, res) => {
    const userId = req.params.userId;
    const [userInfo, userInfoError] = await userDao.getUserById(userId);
    const [userStats, userStatsError] = await userDao.getUserStats(userId);
    if (userInfoError || userStatsError) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error occurred while attempting to fetch this user's profile information. " +
                    "Please try again or contact a site contributor.",
            ],
        });
        return;
    }

    res.status(200);
    res.json({ userInfo, userStats });
};

// PUT /api/v1/user/:userId
// TODO: Validate bio is not only white space or enters.
// TODO: Sanitize.
export const updateBio = async (req, res) => {
    if (!req.body.bio || req.body.bio === "") {
        res.sendStatus(400);
        return;
    }

    const userId = req.params.userId;
    const bio = req.body.bio.trim();
    if (bio === "") {
        res.sendStatus(400);
        return;
    }

    const [updatedUser, error] = userDao.updateUserBio(userId, bio);
    if (error) {
        res.status(500);
        res.json({
            errors: [
                "An internal server error was encountered while trying to update your bio. " +
                    "Please try again or contact a site contributor.",
            ],
        });
        return;
    }

    res.status(200);
    res.json({
        updatedUser,
    });
};
