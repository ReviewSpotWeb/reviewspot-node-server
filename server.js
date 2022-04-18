import express from "express";
import { db } from "./db.js";
import { getAlbumData } from "./services/spotify/spotify-album-service.js";

const app = express();
app.use(express.json());
db.on("error", () => console.error("Could not connect to the database."));

const port = process.env.PORT || 4000;
app.listen(4000, () => `Listening on port ${port}.`);
