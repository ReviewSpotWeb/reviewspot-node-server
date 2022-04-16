import express from "express";
import { db, getDBConnectionString } from "./db.js";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
// Route imports.
import authRoutes from "./routes/auth.js";

// App and DB initialization.
const app = express();
db.on("error", () => console.error("Could not connect to the database."));

// TODO: Add express-session and other aspects of its logic.
// Middleware Setup
const MongoDBStore = ConnectMongoDBSession(session);
const sessionStore = MongoDBStore({
    uri: getDBConnectionString(),
    collection: "user_sessions",
});

app.use(
    session({
        secret: process.env.APP_SECRET || "secret",
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // Calculation for 1 week.
        },
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(express.json());

// Setting Up Routes
app.use("/api/v1/auth", authRoutes);

const port = process.env.PORT || 4000;
app.listen(4000, () => console.log(`Listening on port ${port}.`));
