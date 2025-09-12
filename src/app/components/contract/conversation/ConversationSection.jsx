// File: src/app/components/contract/conversation/ConversationSection.jsx
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";

const ConversationSection = ({
  messages,
  newMessage,
  setNewMessage,
  currentUserId,
  newFile,
  setNewFile,
  sending,
  sendMessage,
  loading,
  error,
}) => {
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-2">💬 Conversation</h3>

      {loading && (
        <p className="text-sm text-gray-500 mb-2 animate-pulse">
          Loading messages...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 mb-2">
          ⚠️ {error}
        </p>
      )}

      {!loading && !error && 
        <MessageList messages={messages} currentUserId={currentUserId}/>
      }

      <MessageComposer
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        newFile={newFile}
        setNewFile={setNewFile}
        sending={sending}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default ConversationSection;
