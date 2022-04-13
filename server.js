import express from "express";

const app = express();
app.use(express.json());

const port = process.env.PORT || 4000;
app.listen(4000, () => `Listening on port ${port}.`);
