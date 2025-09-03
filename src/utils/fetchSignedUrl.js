import toast from "react-hot-toast";
import { parseFilePath } from "./parseFilePath";

/**
 * Fetch a signed URL for a file in Supabase storage.
 *
 * @param {string} fileURL - The original file URL
 * @param {string} bucketName - Supabase bucket name (default: "jobs")
 * @returns {Promise<string|null>} - Signed URL or null
 */
export async function fetchSignedUrlHelper(fileURL, bucketName = "jobs") {
  try {
    const filePath = parseFilePath(fileURL, bucketName);
    if (!filePath) return null;

    const response = await fetch("/api/get-signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath, bucketName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get signed URL");
    }

    const data = await response.json();
    return data.signedUrl || null;
  } catch (error) {
    console.error("Error fetching signed URL:", error);
    toast.error("Failed to load file link: " + error.message);
    return null;
  }
}
