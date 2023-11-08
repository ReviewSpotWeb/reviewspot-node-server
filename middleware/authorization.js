import { User } from "../models/user.js";

export const userMustBeLoggedIn = async (req, res, next) => {
  if (!req.session.currentUser) {
    res.status(401);
    res.json({
      errors: [
        "You must be logged in to access this information or operation.",
      ],
    });
  } else if (req.session.currentUser.banned) {
    await req.session.destroy();
    res.status(403);
    res.json({
      message:
        "Unfortunately, a moderator has banned you from the platform due to bad behavior. " +
        "Please contact a site contirbutor if you'd like to appeal this decision.",
    });
  } else {
    const user = await User.exists({
      _id: req.session.currentUser._id,
      banned: true,
    });
    // NOTE: From my findings, mongo does not update a document in two places. Thus, we need to also query
    // the database to ensure that the user isn't banned and that this is reflected both in session and DB
    // storage.
    if (user) {
      res.status(403);
      res.json({
        message:
          "Unfortunately, a moderator has banned you from the platform due to bad behavior. " +
          "Please contact a site contirbutor if you'd like to appeal this decision.",
      });
    }
    next();
  }
};

// NOTE: This middleware assumes that routes have confirmation that the user is logged in.
export const userMustBeAModerator = async (req, res, next) => {
  if (req.session.currentUser.role !== "moderator") {
    const currentUserId = req.session.currentUser._id;
    const currentUserInDB = await User.findById(currentUserId);
    if (currentUserInDB.role === "moderator") {
      req.session.currentUser = currentUserInDB;
      await req.session.save();
      next();
    } else {
      res.status(403);
      res.json({
        errors: [
          "You do not have proper permissions to access this information or operation.",
        ],
      });
    }
  } else {
    next();
  }
};
