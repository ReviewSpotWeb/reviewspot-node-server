import { Router } from "express";
import { getAlbum, getAlbumReviews } from "../controllers/albums-controller.js";
const albumsRouter = Router();

// Albums come from the Spotify API, and thus we can only allow read operations
// on an album.
albumsRouter.get("/album/:id", getAlbum);
albumsRouter.get("/album/:id/reviews", getAlbumReviews);

export default albumsRouter;
