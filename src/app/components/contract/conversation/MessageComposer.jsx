// File: src/app/components/contract/conversation/MessageComposer.jsx
const MessageComposer = ({
  newMessage,
  setNewMessage,
  newFile,
  setNewFile,
  sending,
  sendMessage,
}) => {
  return (
    <div className="flex flex-col border-t pt-2">
      <textarea
        placeholder="Type a message..."
        rows={2}
        className="w-full p-2 border rounded mb-2 text-sm"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />

      {newFile && (
        <p className="text-sm text-gray-500 mb-1">
          Selected File: <span className="font-medium">{newFile.name}</span>
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="flex-1"
          onChange={(e) => setNewFile(e.target.files[0])}
        />

        <button
          disabled={sending}
          onClick={sendMessage}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-400"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;
