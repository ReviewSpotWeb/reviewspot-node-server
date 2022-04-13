import express from "express";
// Route imports.

const app = express();

// Middleware Setup
app.use(express.json());

// Setting Up Routes

const port = process.env.PORT || 4000;
app.listen(4000, () => `Listening on port ${port}.`);
