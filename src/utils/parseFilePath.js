// /**
//  * Extracts the raw filename from a fileURL (Supabase or relative path).
//  *
//  * @param {string} fileURL - The file URL to parse
//  * @param {string} bucketName - Supabase bucket name (default: "jobs")
//  * @returns {string|null} - Decoded filename or null if parsing fails
//  */
// export function parseFilePath(fileURL, bucketName = "jobs") {
//   if (!fileURL || typeof fileURL !== "string") {
//     console.error("Invalid file URL:", fileURL);
//     return null;
//   }

//   let extractedFilename = "";

//   // Case 1: Supabase storage public URL
//   if (fileURL.includes(`/${bucketName}/`)) {
//     try {
//       const url = new URL(fileURL);
//       const pathSegments = url.pathname.split("/");
//       extractedFilename = pathSegments[pathSegments.length - 1];
//     } catch (err) {
//       console.error("Error parsing URL:", err);
//       return null;
//     }
//   }
//   // Case 2: Relative uploads path
//   else if (fileURL.startsWith("/uploads/")) {
//     extractedFilename = fileURL.split("/").pop();
//   }
//   else {
//     console.error("Unknown URL format:", fileURL);
//     return null;
//   }

//   return extractedFilename ? decodeURIComponent(extractedFilename) : null;
// }


/**
 * Extracts the relative file path inside a Supabase bucket
 * or from a local uploads path.
 *
 * @param {string} fileURL - The file URL to parse
 * @param {string} bucketName - Supabase bucket name (default: "jobs")
 * @returns {string|null} - Relative file path inside bucket, or null if parsing fails
 */
export function parseFilePath(fileURL, bucketName = "jobs") {

  if (!fileURL || typeof fileURL !== "string") {
    console.error("Invalid file URL:", fileURL);
    return null;
  }

  // Case 1: Supabase storage URL
  if (fileURL.includes(`/${bucketName}/`)) {
    try {
      const url = new URL(fileURL);
      const parts = url.pathname.split("/");
      const bucketIndex = parts.indexOf(bucketName);

      if (bucketIndex === -1) {
        console.error("Bucket not found in URL:", fileURL);
        return null;
      }

      // Everything after the bucket name is the file path
      const relativePath = parts.slice(bucketIndex + 1).join("/");
      console.log("📂 Parsed file path for Supabase bucket:", relativePath);
      return decodeURIComponent(relativePath);
    } catch (err) {
      console.error("Error parsing Supabase URL:", err);
      return null;
    }
  }

  // Case 2: Relative uploads path
  if (fileURL.startsWith("/uploads/")) {
    return decodeURIComponent(fileURL.split("/").pop());
  }

  console.error("Unknown URL format:", fileURL);
  
  return null;
}
