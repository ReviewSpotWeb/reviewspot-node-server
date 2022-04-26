import axios from "axios";
import { stringify } from "qs";
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

// Limit is the maximum number of resultes to send back.
// Offset is the index of the groups of results to get back.
// **Example** User wants the first group of n results:
// limit = n, offset = 0. To get the next group of n results:
// limit = n, offset = 1.

export const searchForAlbum = async (searchQuery, limit = 10, offset = 0) => {
    const spotifyToken = await getSpotifyToken();
    const searchRequestOptions = {
        method: "get",
        url: `https://api.spotify.com/v1/search/`,
        data: stringify({
            q: searchQuery,
            type: "album",
            limit: limit.toString(),
            offset: offset.toString(),
        }),
        headers: {
            Authorization: `${spotifyToken.tokenType} ${spotifyToken.accessToken}`,
        },
    };
    const response = await axios(searchRequestOptions);
    const content = response.data;

    const total = content.total;
    const nextURL = content.next;
    const prevURL = content.prev;
    const albums = contet.albums.items;

    return { total, nextURL, prevURL, albums };
};
