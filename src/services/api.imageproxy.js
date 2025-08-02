// utils/imageUrl.js
import { IMAGE_BASE_URL, BACKUP_IMAGE_BASE_URL } from "../config/axios";

// Always try primary, fallback to backup if needed
export const buildImageUrl = (urlPath, useBackup = false) => {
  const base = useBackup ? BACKUP_IMAGE_BASE_URL : IMAGE_BASE_URL;
  return `${base}/${urlPath}`;
};
