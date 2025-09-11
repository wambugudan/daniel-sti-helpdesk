// File: src/app/components/contract/conversation/MessageBubble.jsx
"use client";

import { formatDateTime } from "../utils/formatters";
import { useSignedUrl } from "@/hooks/useSignedUrl";

const MessageBubble = ({ msg }) => {
  const { signedFileUrl, loadingFileUrl } = useSignedUrl(
    msg.fileURL,
    "submission_messages"
  );

  return (
    <div className="border rounded p-2 bg-gray-100 dark:bg-gray-800">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>
          <strong>{msg.sender?.name || "Unknown"}</strong> (
          {msg.senderRole || "N/A"})
        </span>
        <span>{formatDateTime(msg.createdAt)}</span>
      </div>

      <p className="text-sm mb-1">{msg.content}</p>

      {msg.fileURL && (
        <div className="flex items-center gap-2">
          {loadingFileUrl ? (
            <span className="text-gray-500 text-xs">Loading attachment...</span>
          ) : signedFileUrl ? (
            <>
              <a
                href={`/api/serve-file?filePath=${encodeURIComponent(
                  msg.fileURL
                )}&bucket=submission_messages`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-xs"
              >
                📎 View Attachment
              </a>
              |
              <a
                href={`/api/serve-file?filePath=${encodeURIComponent(
                  msg.fileURL
                )}&bucket=submission_messages&download=true`}
                download={msg.fileName}
                className="text-blue-600 underline text-xs hover:text-blue-500"
              >
                Download Attachment
              </a>
            </>
          ) : (
            <span className="text-red-500 text-xs">File unavailable</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
