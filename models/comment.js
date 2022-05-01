import mongoose from "mongoose";
const { Schema } = mongoose;

export const commentSchema = new Schema(
    {
        authorInfo: {
            authorId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            authorName: {
                type: String, // User.username
                required: true,
            },
            authorRole: {
                type: String, // User.role
                required: true,
            },
        },
        // TODO: We should add a max length on the front and back end to prevent resource
        // consumption as an attack vector.
        content: {
            type: String,
            required: true,
        },
        reviewId: {
            type: Schema.Types.ObjectId,
            ref: "Review",
            required: true,
        },
    },
    { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
