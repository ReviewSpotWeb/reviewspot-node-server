import { Review } from "../review.js";

const getAllCommentsWithReviewId = async (reviewId) => {
    try {
        const review = await Review.findById(reviewId, { comments: 1 });
        const comments = review.comments;
        return comments, null;
    } catch (error) {
        return null, error;
    }
};

const createCommentOnReview = async (reviewId, author, content) => {
    try {
        const newComment = new Comment({
            author,
            content,
        });
        await Review.findByIdAndUpdate(reviewId, {
            comments: [...comments, newComment],
        });
        await newComment.save();
        return newComment, null;
    } catch (error) {
        return null, error;
    }
};

export default { getAllCommentsWithReviewId, createCommentOnReview };
