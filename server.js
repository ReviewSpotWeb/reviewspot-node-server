import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { db, getDBConnectionString } from "./db.js";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
// Route imports.
import authRoutes from "./routes/auth.js";
import reviewRoutes from "./routes/reviews.js";
import albumsRouter from "./routes/albums.js";
import { userRoutes } from "./routes/user.js";
import {
  userMustBeAModerator,
  userMustBeLoggedIn,
} from "./middleware/authorization.js";
import { moderatorRoutes } from "./routes/moderator.js";

// App and DB initialization.
const app = express();
db.on("error", (err) =>
  console.error("Could not connect to the database.", err)
);

dotenv.config();

// TODO: Add express-session and other aspects of its logic.
// Middleware Setup
app.use(
  cors({
    origin:
      (process.env.NODE_ENV || "DEV").toLowerCase() === "prod"
        ? process.env.REVIEWSPOT_CLIENT_URL
        : "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
const MongoDBStore = ConnectMongoDBSession(session);
const sessionStore = MongoDBStore({
  uri: getDBConnectionString(),
  collection: "user_sessions",
});

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.APP_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: (process.env.NODE_ENV || "DEV").toLowerCase() === "prod",
      // sameSite: "none", // defaults to null
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // Calculation for 1 week.
    },
    store: sessionStore,
  })
);

app.use(express.json());
db.on("error", () => console.error("Could not connect to the database."));

// Setting Up Routes
app.use("/api/v1/auth", authRoutes);
app.use(
  "/api/v1/moderator",
  userMustBeLoggedIn,
  userMustBeAModerator,
  moderatorRoutes
);
app.use("/api/v1", reviewRoutes, albumsRouter, userRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}.`));
