import mongoose from "mongoose";
// TODO: Do we need any extra configuration here?
mongoose.connect(
    `${process.env.REVIEWSPOT_DB_URL}_${(
        process.env.NODE_ENV || "DEV"
    ).toLowerCase()}`
);
export const db = mongoose.connection;
