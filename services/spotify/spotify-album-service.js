import axios from "axios";
import { getSpotifyToken } from "./spotify-token-service.js";

export const getAlbumData = async (albumId) => {
    const spotifyToken = await getSpotifyToken();
    const albumRequestOptions = {
        method: "get",
        url: `https://api.spotify.com/v1/albums/${albumId}`,
        headers: {
            Authorization: `${spotifyToken.tokenType} ${spotifyToken.accessToken}`,
        },
    };
    const albumResponse = await axios(albumRequestOptions);
    const albumData = albumResponse.data;
    return albumData;
};
