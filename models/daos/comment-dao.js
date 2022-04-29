import { Review } from "../review.js";
import { Comment } from "../comment.js";
import { User } from "../user.js";

const getAllCommentsWithReviewId = async (reviewId) => {
    try {
        const review = await Review.findById(reviewId, { comments: 1 });
        const comments = review.comments;
        return [comments, null];
    } catch (error) {
        return [null, error];
    }
};

const createCommentOnReview = async (reviewId, author, content) => {
    try {
        const givenUser = await User.findById(author);
        const authorInfo = {
            authorId: givenUser._id,
            authorName: givenUser.username,
            authorRole: givenUser.role,
        };
        const newComment = new Comment({
            authorInfo,
            content,
        });
        await Review.findByIdAndUpdate(reviewId, {
            $push: {
                comments: {
                    $each: [newComment],
                    $sort: {
                        createdAt: -1,
                    },
                },
            },
        });
        await newComment.save();
        return [newComment, null];
    } catch (error) {
        return [null, error];
    }
};

// TODO: This should probably be wrapped in a transaction.
const editComment = async (reviewId, commentId, newContent) => {
    try {
        const updatedComment = await Comment.findByIdAndUpdate(commentId, {
            content: newContent,
        });
        // https://stackoverflow.com/questions/15691224/mongoose-update-values-in-array-of-objects
        await Review.updateOne(
            { _id: reviewId, "comments._id": commentId },
            {
                $set: {
                    "comments.$.content": newContent,
                },
            }
        );
        return [updatedComment, null];
    } catch (error) {
        return [null, error];
    }
};

// TODO: Do we need to manually delete a comment from a review?
const deleteComment = async (reviewId, commentId) => {
    try {
        await Review.findByIdAndUpdate(reviewId, {
            $pull: {
                comments: {
                    _id: commentId,
                },
            },
        });
        const deletedComment = await Comment.findByIdAndDelete(commentId);
        return [deletedComment != null, null];
    } catch (error) {
        return [null, error];
    }
};

const userOwnsComment = async (userId, commentId) => {
    try {
        const comment = await Comment.findById(commentId);
        return [comment.authorInfo.authorId.equals(userId), null];
    } catch (error) {
        return [null, error];
    }
};

const getAComment = async (commentId) => {
    try {
        const comment = await Comment.findById(commentId);
        return [comment, null];
    } catch (error) {
        return [null, error];
    }
};

export default {
    getAllCommentsWithReviewId,
    createCommentOnReview,
    getAComment,
    deleteComment,
    editComment,
    userOwnsComment,
};
