// File: src/app/components/contract/conversation/MessageList.jsx
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages }) => {
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
