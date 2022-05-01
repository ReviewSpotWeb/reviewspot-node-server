import { Comment } from "../comment.js";
import { User } from "../user.js";
import { Review } from "../review.js";

const getUserById = async (userId) => {
    try {
        const user = await User.findById(userId);
        return [user, null];
    } catch (error) {
        return [null, error];
    }
};

const getUserStats = async (userId) => {
    try {
        const numComments = await Comment.count({
            "authorInfo.authorId": userId,
        });
        const numReviews = await Review.count({
            "authorInfo.authorId": userId,
        });

        return [[numReviews, numComments], null];
    } catch (error) {
        return [null, error];
    }
};

const updateUserBio = async (userId, newBio) => {
    try {
        const userToUpdate = await User.findByIdAndUpdate(userId, {
            bio: newBio,
        });
        return [userToUpdate, null];
    } catch (error) {
        return [null, error];
    }
};

// TODO: This should ABSOLUTELY be a transaction.
const banUser = async (userId) => {
    try {
        const userToBan = await User.findByIdAndUpdate(userId, {
            banned: true,
        });
        const reviewsDeleted = await Review.deleteMany({
            "authorInfo.authorId": userId,
        });
        const commentsDeleted = await Comment.deleteMany({
            "authorInfo.authorId": userId,
        });
        const likedReviews = await Review.updateMany(
            { likedBy: userId },
            {
                $pull: {
                    likedBy: userId,
                },
            }
        );
        return [userToBan, null];
    } catch (error) {
        return [null, error];
    }
};

export default {
    getUserById,
    getUserStats,
    updateUserBio,
    banUser,
};
