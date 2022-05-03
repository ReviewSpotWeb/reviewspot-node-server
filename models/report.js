import mongoose from "mongoose";
const { Schema } = mongoose;

export const reportSchema = new Schema(
    {
        dismissed: {
            type: Boolean,
            default: false,
        },
        reason: {
            type: String,
            required: true,
        },
        submittedBy: {
            type: Schema.Types.ObjectId,
        },
        uri: {
            type: String,
            required: true,
        },
        contentType: {
            type: String,
            enum: ["comment", "review"],
            required: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
