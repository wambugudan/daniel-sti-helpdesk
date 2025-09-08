// File: src/app/components/contract/hooks/useSubmission.js
import { useState, useEffect } from "react";
import { refreshNotifications } from "../utils/notifications";

export const useSubmission = (bidId) => {
  const [localSubmission, setLocalSubmission] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(false);

  // Load existing submission on mount
  useEffect(() => {
    if (!bidId) {
      console.warn("useSubmission: bidId is missing");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/submissions?bidId=${bidId}`);
        if (res.ok) {
          const data = await res.json();
          if (data) setLocalSubmission(data);
        }
      } catch (err) {
        console.error("Failed to fetch submission:", err);
      }
    })();
  }, [bidId]);

  const handleSubmit = async () => {
    if (!submissionMessage && !file) {
      console.warn("No message or file to submit");
      return;
    }

    if (!bidId) {
      console.error("❌ Missing bidId in useSubmission");
      return;
    }

    setSubmitting(true);

    try {
      let uploaded = null;

      // Step 1: Upload file if it exists
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "submissions");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("File upload failed");

        uploaded = await res.json();
        setUploadProgress(100);
      }

      // Step 2: Submit work
      const payload = {
        bidId,
        message: submissionMessage,
        fileURL: uploaded?.fileURL || null,
        fileName: uploaded?.fileName || null,
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission save failed");
      const saved = await res.json();

      // Update local state
      setLocalSubmission(saved);
      setSubmissionMessage("");
      setFile(null);
      setUploadProgress(0);
      setEditingSubmission(false);

      await refreshNotifications();
    } catch (err) {
      console.error("Error submitting work:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    localSubmission,
    submissionMessage,
    setSubmissionMessage,
    file,
    setFile,
    uploadProgress,
    submitting,
    editingSubmission,
    setEditingSubmission,
    handleSubmit,
  };
};

