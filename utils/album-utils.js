import {
  getAlbumData,
  getBatchAlbumData,
} from "../services/spotify/spotify-album-service.js";

export const getNameFromAlbumId = async (albumId) => {
  const [albumData, error] = await getAlbumData(albumId);
  if (error) return [null, error];
  const albumName = albumData.name;
  return [albumName, null];
};

export const getAlbumsFromAlbumIdList = async (albumIds) => {
  const [albumData, error] = await getBatchAlbumData(albumIds);
  if (error) return [null, error];
  return [albumData, null];
};
