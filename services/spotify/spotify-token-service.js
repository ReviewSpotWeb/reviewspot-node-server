import axios from "axios";
import { SpotifyToken } from "../../models/spotify-token";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const tokenRouteOptions = {
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    headers: {
        Authorization:
            "Basic " +
            (SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
                "base64"
            ),
    },
    form: {
        grant_type: "client_credentials",
    },
    json: true,
};

// TODO: Is there a way to easily cache this token so as not to read from the
// database each time?
const getSpotifyToken = async () => {
    // Since the server is the only one holding a token
    // at any time, there should only ever be one token.
    const currentToken = SpotifyToken.findOne();
    if (currentToken && currentToken.expiresAt > Date.now()) {
        return currentToken;
    }

    const tokenData = await (await axios(tokenRouteOptions)).data();
    const expiresAt = tokenData["expires_in"];
};
