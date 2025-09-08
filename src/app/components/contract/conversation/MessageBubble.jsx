// File: src/app/components/contract/conversation/MessageBubble.jsx
import { formatDateTime } from "../utils/formatters";

const MessageBubble = ({ msg }) => {
  return (
    <div className="border rounded p-2 bg-gray-100 dark:bg-gray-800">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>
          <strong>{msg.sender?.name || "Unknown"}</strong> ({msg.senderRole || "N/A"})
        </span>
        <span>{formatDateTime(msg.createdAt)}</span>
      </div>

      <p className="text-sm mb-1">{msg.content}</p>

      {msg.fileURL && (
        <a
          href={msg.fileURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-xs"
        >
          📎 View Attachment
        </a>
      )}
    </div>
  );
};

export default MessageBubble;
