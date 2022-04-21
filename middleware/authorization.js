import { User } from "../models/user";

export const userMustBeLoggedIn = (req, res, next) => {
    if (!req.session.currentUserID) {
        res.status(401);
        res.json({
            errors: [
                "You must be logged in to access this information or operation.",
            ],
        });
    } else {
        next();
    }
};

// NOTE: This middleware assumes that routes have confirmation that the user is logged in.
export const userMustBeAModerator = (req, res, next) => {
    // TODO: Can we abstract this to a global function?
    const currentUser = User.findOne({ username: req.session.currentUserID });
    if (currentUser.role != "moderator") {
        res.status(403);
        res.json({
            errors: [
                "You do not have proper permissions to access this information or operation.",
            ],
        });
    } else {
        next();
    }
};