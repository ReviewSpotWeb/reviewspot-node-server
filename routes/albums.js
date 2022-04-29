import { Router } from "express";
import {
    getAlbum,
    getAlbumReviews,
    getAverageRating,
    rateAlbum,
} from "../controllers/albums-controller.js";
import { userMustBeLoggedIn } from "../middleware/authorization.js";
const albumsRouter = Router();

albumsRouter.get("/album/:albumId", getAlbum);
albumsRouter.get("/album/:albumId/reviews", getAlbumReviews);
albumsRouter.get("/album/:albumId/avgRating", getAverageRating);
albumsRouter.post("/album/:albumId/rate", userMustBeLoggedIn, rateAlbum);

export default albumsRouter;
