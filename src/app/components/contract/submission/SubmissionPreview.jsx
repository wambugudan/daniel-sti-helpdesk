// File: src/app/components/contract/submission/SubmissionPreview.jsx
"use client";

import { useMemo } from "react";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { getFileIcon } from "../utils/fileIcons";

const SubmissionPreview = ({ localSubmission, onEdit }) => {
  const hasFile = !!localSubmission?.fileURL;

  // Use signed URL hook for submissions bucket
  const { signedFileUrl, loadingFileUrl } = useSignedUrl(
    localSubmission?.fileURL,
    "submissions"
  );

  return (
    <div className="border rounded p-3 bg-yellow-50 dark:bg-gray-800">
      <p><strong>Message:</strong></p>
      <p className="text-sm italic text-gray-800 dark:text-gray-300 mb-2">
        {localSubmission?.message || "(No message provided)"}
      </p>

      {hasFile ? (
        <div className="flex items-center gap-2">
          {getFileIcon(localSubmission.fileName)}

          {loadingFileUrl ? (
            <span className="text-gray-500 text-sm">Loading file...</span>
          ) : signedFileUrl ? (
            <>
              <a
                href={`/api/serve-file?filePath=${encodeURIComponent(localSubmission.fileURL)}&bucket=submissions`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {localSubmission.fileName || "View File"}
              </a>
              |
              <a
                // href={signedFileUrl}
                href={`/api/serve-file?filePath=${encodeURIComponent(localSubmission.fileURL)}&bucket=submissions&download=true`}
                download={localSubmission.fileName}
                className="text-blue-600 underline hover:text-blue-500"
              >
                Download File
              </a>
            </>
          ) : (
            <span className="text-red-500 text-sm">File unavailable</span>
          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">No file uploaded</p>
      )}

      <button
        onClick={onEdit}
        className="mt-3 px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-400"
      >
        ✏️ Edit Submission
      </button>
    </div>
  );
};

export default SubmissionPreview;
