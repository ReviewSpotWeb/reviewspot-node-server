import { Router } from "express";
import {
    getAlbum,
    getAlbumReviews,
    getAverageRating,
    rateAlbum,
} from "../controllers/albums-controller.js";
import { userMustBeLoggedIn } from "../middleware/authorization.js";
const albumsRouter = Router();

albumsRouter.get("/album/:id", getAlbum);
albumsRouter.get("/album/:id/reviews", getAlbumReviews);
albumsRouter.get("/album/:id/avgRating", getAverageRating);
albumsRouter.post("/album/:id/rate", userMustBeLoggedIn, rateAlbum);

export default albumsRouter;
