// File: src/app/components/contract/hooks/useConversation.js
import { useState } from "react";
import { refreshNotifications } from "../utils/notifications";

export const useConversation = (contractId) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!newMessage && !newFile) return;
    setSending(true);

    try {
      // 1. Upload file if provided (mock URL)
      let fileURL = null;
      if (newFile) {
        fileURL = URL.createObjectURL(newFile);
      }

      // 2. Create message (simulate API response)
      const msg = {
        id: Date.now(),
        senderId: "me",
        sender: { name: "Me" },
        senderRole: "Freelancer",
        content: newMessage,
        fileURL,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, msg]);

      // 3. Reset inputs
      setNewMessage("");
      setNewFile(null);

      await refreshNotifications();
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    newFile,
    setNewFile,
    sending,
    sendMessage,
  };
};
