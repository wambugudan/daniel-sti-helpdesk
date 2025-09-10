// File: src/app/components/contract/conversation/MessageList.jsx
import MessageBubble from "./MessageBubble";

const SkeletonBubble = () => (
  <div className="border rounded p-2 bg-gray-100 dark:bg-gray-800 animate-pulse">
    <div className="flex justify-between text-xs text-gray-400 mb-1">
      <span className="bg-gray-300 dark:bg-gray-700 h-3 w-24 rounded"></span>
      <span className="bg-gray-300 dark:bg-gray-700 h-3 w-16 rounded"></span>
    </div>
    <div className="bg-gray-300 dark:bg-gray-700 h-4 w-3/4 rounded mb-1"></div>
    <div className="bg-gray-300 dark:bg-gray-700 h-4 w-1/2 rounded"></div>
  </div>
);

const MessageList = ({ messages, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <SkeletonBubble key={i} />
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return <p className="text-sm text-gray-500">No messages yet.</p>;
  }

  return (
    <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}
    </div>
  );
};

export default MessageList;
