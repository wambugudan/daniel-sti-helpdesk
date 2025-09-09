// // File: src/app/components/contract/hooks/useConversation.js
// import { useState } from "react";
// import { refreshNotifications } from "../utils/notifications";

// export const useConversation = (contractId) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [newFile, setNewFile] = useState(null);
//   const [sending, setSending] = useState(false);

//   const sendMessage = async () => {
//     if (!newMessage && !newFile) return;
//     setSending(true);

//     try {
//       // 1. Upload file if provided (mock URL)
//       let fileURL = null;
//       if (newFile) {
//         fileURL = URL.createObjectURL(newFile);
//       }

//       // 2. Create message (simulate API response)
//       const msg = {
//         id: Date.now(),
//         senderId: "me",
//         sender: { name: "Me" },
//         senderRole: "Freelancer",
//         content: newMessage,
//         fileURL,
//         createdAt: new Date(),
//       };

//       setMessages((prev) => [...prev, msg]);

//       // 3. Reset inputs
//       setNewMessage("");
//       setNewFile(null);

//       await refreshNotifications();
//     } catch (err) {
//       console.error("Error sending message:", err);
//     } finally {
//       setSending(false);
//     }
//   };

//   return {
//     messages,
//     newMessage,
//     setNewMessage,
//     newFile,
//     setNewFile,
//     sending,
//     sendMessage,
//   };
// };



// File: src/app/components/contract/hooks/useConversation.js
"use client";

import { useState, useEffect, useCallback } from "react";

export function useConversation(submissionId, currentUser) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");  // ✅
  const [newFile, setNewFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!submissionId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/submission/message/${submissionId}`);
      if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`);

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("❌ fetchMessages error:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ✅ Send a message (with or without file)
  const sendMessage = async ({ content, file }) => {
    if (!submissionId || !currentUser?.id || !currentUser?.role) {
      setError("Invalid sender or submission");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("submissionId", submissionId);
      formData.append("senderId", currentUser.id);
      formData.append("senderRole", currentUser.role);
      if (content) formData.append("content", content);
      if (file) formData.append("file", file);

      const res = await fetch(`/api/submission/message/send`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Send failed (${res.status})`);

      const { message } = await res.json();

      // ✅ Add new message to state
      setMessages((prev) => [...prev, message]);
    } catch (err) {
      console.error("❌ sendMessage error:", err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    newMessage, setNewMessage,   // ✅ expose
    newFile, setNewFile,  // ✅ expose
    loading,
    sending,
    error,
    fetchMessages,
    sendMessage,
  };
}
