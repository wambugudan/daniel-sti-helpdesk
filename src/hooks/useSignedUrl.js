// File: src/hooks/useSignedUrl.js
import { useState, useEffect } from "react";
import { fetchSignedUrlHelper } from "@/utils/fetchSignedUrl";

/**
 * Custom hook for fetching a signed URL for a given file.
 *
 * @param {string} fileURL - The original file URL from workRequest
 * @param {string} bucketName - Supabase bucket name (default: "jobs")
 * @returns {{ signedFileUrl: string|null, loadingFileUrl: boolean }}
 */
export function useSignedUrl(fileURL, bucketName = "jobs") {
  const [signedFileUrl, setSignedFileUrl] = useState(null);
  const [loadingFileUrl, setLoadingFileUrl] = useState(false);

  useEffect(() => {
    const getSignedUrl = async () => {
      setLoadingFileUrl(true);
      const url = await fetchSignedUrlHelper(fileURL, bucketName);
      setSignedFileUrl(url);
      setLoadingFileUrl(false);
    };

    if (fileURL) {
      getSignedUrl();
    } else {
      setSignedFileUrl(null);
    }
  }, [fileURL, bucketName]);

  return { signedFileUrl, loadingFileUrl };
}
