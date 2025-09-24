"use client";

import { formatDateTime } from "../utils/formatters";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { getFileIcon } from "../utils/fileIcons";
import Link from "next/link";

const MessageBubble = ({ msg, currentUserId }) => {
  const { signedFileUrl, loadingFileUrl } = useSignedUrl(
    msg.fileURL,
    "submission_messages"
  );

  const isOwnMessage = 
    // msg.senderId === currentUserId;
    msg.senderId === currentUserId || msg.sender?.id === currentUserId;

  // console.log("Message:", msg, "Current User ID:", currentUserId, "Is Own Message:", isOwnMessage);
  

  return (
    <div
      className={`p-2 max-w-xs sm:max-w-md md:max-w-lg ${
        isOwnMessage ? "ml-auto text-white" : "mr-auto text-black dark:text-gray-200"
      }`}
    >
      <div
        className={`border p-2 ${
          isOwnMessage
            ? "bg-blue-500 rounded-2xl rounded-br-sm" // ✅ sender: bubble on right
            : "bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm" // ✅ receiver: bubble on left
        }`}
      >
        <div className="flex justify-between text-xs opacity-80 mb-1">
          {/* <span>
            <strong>{msg.sender?.name || "Unknown"}</strong> (
            {msg.senderRole || "N/A"})
          </span> */}
          <span>
            {msg.senderId ? (
                <Link
                href={`/profile/${msg.senderId}`}
                className={`font-medium hover:underline ${
                    isOwnMessage
                    ? "text-white"
                    : "text-blue-600 dark:text-blue-400 hover:text-blue-500"
                }`}
                >
                <strong> {msg.sender?.name || "Unknown"} </strong>
                </Link> 
            ) : (
                <span>{msg.sender?.name || "Unknown"}</span>
            )}{" "}
            ({msg.senderRole || "N/A"})
          </span>

          <span>{formatDateTime(msg.createdAt)}</span>
        </div>

        <p className="text-sm mb-1">{msg.content}</p>

        {msg.fileURL && (
          <div className="flex items-center gap-2">
            {getFileIcon(msg.fileURL)}
            {loadingFileUrl ? (
              <span className="opacity-70 text-xs">Loading attachment...</span>
            ) : signedFileUrl ? (
              <>
                <a
                  href={`/api/serve-file?filePath=${encodeURIComponent(
                    msg.fileURL
                  )}&bucket=submission_messages`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline text-xs ${
                    isOwnMessage
                      ? "text-white hover:text-gray-200"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  View Attachment
                </a>
                |
                <a
                  href={`/api/serve-file?filePath=${encodeURIComponent(
                    msg.fileURL
                  )}&bucket=submission_messages&download=true`}
                  download={msg.fileName}
                  className={`underline text-xs ${
                    isOwnMessage
                      ? "text-white hover:text-gray-200"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
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
    </div>
  );
};

export default MessageBubble;

