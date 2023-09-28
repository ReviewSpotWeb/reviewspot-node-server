import mongoose from "mongoose";
// TODO: Do we need any extra configuration here?

export const getDBConnectionString = () => {
  return `${
    process.env.REVIEWSPOT_DB_URL || "mongodb://127.0.0.1:27017/reviewspot"
  }_${(process.env.NODE_ENV || "DEV").toLowerCase()}`;
};

mongoose.connect(getDBConnectionString());

export const db = mongoose.connection;
