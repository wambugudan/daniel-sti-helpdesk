// // File: src/app/components/contract/hooks/useConversation.js
// "use client";

// import { useState, useEffect, useCallback } from "react";

// export function useConversation(submissionId, currentUser) {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");  // ✅
//   const [newFile, setNewFile] = useState(null); 
//   const [loading, setLoading] = useState(false);
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState(null);

//   // ✅ Fetch messages
//   const fetchMessages = useCallback(async () => {
//     if (!submissionId) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch(`/api/submission/message/${submissionId}`);
//       if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`);

//       const data = await res.json();
//       setMessages(data.messages || []);
//     } catch (err) {
//       console.error("❌ fetchMessages error:", err);
//       setError("Failed to load messages");
//     } finally {
//       setLoading(false);
//     }
//   }, [submissionId]);

//   useEffect(() => {
//     fetchMessages();
//   }, [fetchMessages]);

//   // ✅ Send a message (with or without file)
//   const sendMessage = async ({ content, file }) => {
//     console.log("🟡 sendMessage called with:", { submissionId, currentUser, content, file });

//     if (!submissionId || !currentUser?.id || !currentUser?.role) {
//       setError("Invalid sender or submission");
//       return;
//     }

//     setSending(true);
//     setError(null);

//     try {
//       const formData = new FormData();
//       formData.append("submissionId", submissionId);
//       formData.append("senderId", currentUser.id);
//       formData.append("senderRole", currentUser.role);
//       if (content) formData.append("content", content);
//       if (file) formData.append("file", file);

//       const res = await fetch(`/api/submission/message/send`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) throw new Error(`Send failed (${res.status})`);

//       const { message } = await res.json();

//       // ✅ Add new message to state
//       setMessages((prev) => [...prev, message]);
//     } catch (err) {
//       console.error("❌ sendMessage error:", err);
//       setError("Failed to send message");
//     } finally {
//       setSending(false);
//     }
//   };

//   return {
//     messages,
//     newMessage, setNewMessage,   // ✅ expose
//     newFile, setNewFile,  // ✅ expose
//     loading,
//     sending,
//     error,
//     fetchMessages,
//     sendMessage,
//   };
// }



// File: src/app/components/contract/hooks/useConversation.js
"use client";

import { useState, useEffect, useCallback } from "react";

export function useConversation(submissionId, currentUser) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Fetch messages
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

  // Send a message with optional file
  const sendMessage = async ({ content, file }) => {
    if (!submissionId || !currentUser?.id || !currentUser?.role) {
      setError("Invalid sender or submission");
      return;
    }

    setSending(true);
    setError(null);

    try {
      let fileURL = null;
      let fileName = null;

      // ✅ Upload file to `submission_messages` bucket if present
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "submission_messages");

        const uploadRes = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error(`Upload failed: ${await uploadRes.text()}`);

        const uploaded = await uploadRes.json();
        fileURL = uploaded.fileURL;
        fileName = file.name;
      }

      // Send message payload
      const payload = {
        submissionId,
        senderId: currentUser.id,
        senderRole: currentUser.role,
        content: content || null,
        fileURL,
        fileName,
      };

      const res = await fetch("/api/submission/message/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Send failed (${res.status})`);

      const { message } = await res.json();

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      setNewFile(null);
    } catch (err) {
      console.error("❌ sendMessage error:", err);
      setError("Failed to send message");
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
    loading,
    sending,
    error,
    fetchMessages,
    sendMessage,
  };
}
