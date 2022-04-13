import express from "express";
import { db } from "./db.js";
// Route imports.
import authRoutes from "./routes/auth.js";

// App and DB initialization.
const app = express();
db.on("error", () => console.error("Could not connect to the database."));

// Middleware Setup
app.use(express.json());

// Setting Up Routes
app.use("/api/v1/auth", authRoutes);

const port = process.env.PORT || 4000;
app.listen(4000, () => console.log(`Listening on port ${port}.`));
