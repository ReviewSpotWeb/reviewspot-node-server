import { getDataFromRequest } from "../axios-handlers.js";
import { SpotifyToken } from "../../models/spotify-token.js";
import { base64encode } from "nodejs-base64";
import moment from "moment";
import axios from "axios";

// TODO: Way to create a Singleton class with SpotifyToken?
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const AUTH_ROUTE_TOKEN = base64encode(
  `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
);

// TODO: Is there a way to easily cache this token so as not to read from the
// database each time?

// Return type is data, error, where if we get back a token
// we return data, null. If an error occurs at any point,
// we return null, error.
export const getSpotifyToken = async () => {
  try {
    // Since the server is the only one holding a token
    // at any time, there should only ever be one token.
    const currentToken = await SpotifyToken.findOne();
    if (currentToken && currentToken.expiresAt > Date.now()) {
      return [currentToken, null];
    } else if (currentToken) {
      await SpotifyToken.deleteOne({ _id: currentToken._id });
    }

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      })
    );
    // const [tokenData, error] = await getDataFromRequest(tokenRouteOptions);
    // if (error) return [null, error];

    if (response.status !== 200)
      return [null, "Something went wrong when requesting Spotify Token"];

    const tokenData = response.data;

    // Expires In is computed as seconds.
    const expiresAt = moment().add(tokenData["expires_in"], "seconds").toDate();

    const newToken = await SpotifyToken.create({
      accessToken: tokenData["access_token"],
      tokenType: tokenData["token_type"],
      expiresAt,
    });
    return [newToken, null];
  } catch (error) {
    return [null, error];
  }
};
