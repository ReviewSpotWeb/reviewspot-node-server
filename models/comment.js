import mongoose from "mongoose";
const { Schema } = mongoose;

export const commentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // TODO: We should add a max length on the front and back end to prevent resource
    // consumption as an attack vector.
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

export const Comment = mongoose.model("Comment", commentSchema);
