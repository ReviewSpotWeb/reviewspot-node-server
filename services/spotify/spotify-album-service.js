import { getDataFromRequest } from "../axios-handlers.js";
import { getSpotifyToken } from "./spotify-token-service.js";
import geoip from "geoip-lite";
const { lookup } = geoip;

export const getAlbumData = async (albumId) => {
  const [spotifyToken, tokenError] = await getSpotifyToken();
  if (tokenError) return [null, tokenError];
  const albumRequestOptions = {
    method: "get",
    url: `https://api.spotify.com/v1/albums/${albumId}`,
    headers: {
      Authorization: `${spotifyToken.tokenType} ${spotifyToken.accessToken}`,
    },
  };
  const [data, error] = await getDataFromRequest(albumRequestOptions);
  return [data, error];
};

// Limit is the maximum number of results to send back.
// Offset is the index of the groups of results to get back.
// **Example** User wants the first group of n results:
// limit = n, offset = 0. To get the next group of n results:
// limit = n, offset += limit.

export const searchForAlbum = async (searchQuery, limit = 10, offset = 0) => {
  const [spotifyToken, tokenError] = await getSpotifyToken();
  if (tokenError) return [null, tokenError];
  const searchRequestOptions = {
    method: "get",
    url: `https://api.spotify.com/v1/search`,
    params: {
      q: searchQuery,
      limit,
      offset,
      type: "album",
    },
    headers: {
      Authorization: `${spotifyToken.tokenType} ${spotifyToken.accessToken}`,
    },
  };
  const [data, error] = await getDataFromRequest(searchRequestOptions);
  if (error) return [null, error];
  const albumData = data.albums;
  console.log(albumData);
  // https://developer.spotify.com/documentation/web-api/reference/#/operations/search
  const [total, nextURL, prevURL, albums, resOffset, resLimit] = [
    albumData.total,
    albumData.next,
    albumData.previous,
    albumData.items,
    albumData.offset,
    albumData.limit,
  ];
  return [
    { total, nextURL, prevURL, albums, offset: resOffset, limit: resLimit },
    null,
  ];
};

export const getNewReleases = async (ipAddr, limit = 10, offset = 0) => {
  const [spotifyToken, tokenError] = await getSpotifyToken();
  if (tokenError) return [null, tokenError];
  const geoData = lookup(ipAddr);
  const newReleasesURL = "https://api.spotify.com/v1/browse/new-releases";
  const [responseData, error] = await getDataFromRequest({
    method: "get",
    url: newReleasesURL,
    params: {
      limit,
      offset,
      country: (geoData && geoData.country) || "US",
    },
    headers: {
      Authorization: `${spotifyToken.tokenType} ${spotifyToken.accessToken}`,
    },
  });
  if (error) {
    return [null, error];
  } else {
    const albumData = responseData.albums;
    return [
      {
        limit,
        offset,
        total: albumData.total,
        next: albumData.next ? { offset: offset + limit, limit } : null,
        prev: albumData.previous ? { offset: offset - limit, limit } : null,
        albums: albumData.items,
      },
      null,
    ];
  }
};
