// Description: A modal component for displaying contract details and allowing the user to submit work or cancel the contract.

'use client';

import { useTheme } from "@/context/ThemeProvider";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";

const getFileIcon = (fileURL) => {
  if (!fileURL) return <FaFileAlt className="text-gray-500 text-2xl" />;
  const ext = fileURL.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf": return <FaFilePdf className="text-red-500 text-2xl" />;
    case "doc":
    case "docx": return <FaFileWord className="text-blue-500 text-2xl" />;
    case "jpg":
    case "jpeg":
    case "png": return <FaFileImage className="text-green-500 text-2xl" />;
    default: return <FaFileAlt className="text-gray-500 text-2xl" />;
  }
};

const ContractModal = ({ contract, currentUser, onClose, onCancelled }) => {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [file, setFile] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(false);
  const [submitted, setSubmitted] = useState(!!contract?.acceptedBid?.submissionMessage || !!contract?.acceptedBid?.submissionFileURL);
  // const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);



  

  const isOwner = currentUser?.id === contract?.acceptedBid?.userId;
  const hasSubmission = !!contract?.acceptedBid?.submissionMessage || !!contract?.acceptedBid?.submissionFileURL;

  const [localSubmission, setLocalSubmission] = useState({
    message: contract?.acceptedBid?.submissionMessage || "",
    fileURL: contract?.acceptedBid?.submissionFileURL || "",
    fileName: contract.acceptedBid?.submissionFileName || null,
  });

  const duration =
    contract.deadline && contract.createdAt
      ? Math.ceil((new Date(contract.deadline) - new Date(contract.createdAt)) / (1000 * 60 * 60 * 24))
      : "N/A";


  const handleSubmit = async () => {
    if (!submissionMessage && !file) {
      toast.error("Please provide a message or upload a file.");
      return;
    }
  
    try {
      setSubmitting(true);
  
      const formData = new FormData();
      formData.append("userId", currentUser.id);
      formData.append("workRequestId", contract.id);
      formData.append("message", submissionMessage);
      if (file) formData.append("file", file);
  
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/contract/submit", true);
  
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      };
  
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
  
          toast.success("Work submitted successfully!");
  
          // ⬇️ Set submission preview info
          setLocalSubmission({
            message: submissionMessage,
            fileURL: response.submission.submissionFileURL,
            fileName: file?.name || "Uploaded File",
          });
  
          // ⬇️ Reset form state and toggle display
          // setSubmissionComplete(true);
          setSubmitted(true);
          setEditingSubmission(false);
          setSubmissionMessage("");
          setFile(null);
          setUploadProgress(0);
        } else {
          console.error("Submission failed:", xhr.responseText);
          toast.error("Failed to submit work");
        }
        setSubmitting(false);
      };
  
      xhr.onerror = () => {
        toast.error("Network error during submission");
        setSubmitting(false);
      };
  
      xhr.send(formData);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error submitting work");
      setSubmitting(false);
    }
  };
  

  const handleCancelContract = async () => {
    if (!confirm("Cancel this contract?")) return;
    try {
      setLoading(true);
      const res = await fetch("/api/contract/cancel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workRequestId: contract.id, userId: currentUser.id }),
      });
      if (!res.ok) throw new Error("Cancel failed");
      toast.success("Contract cancelled");
      onCancelled?.(contract.id);
      onClose();
    } catch (err) {
      toast.error("Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = async () => {
    try {
      const res = await fetch("/api/work-request/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workRequestId: contract.id, userId: currentUser.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Marked as completed!");
      onClose();
    } catch {
      toast.error("Failed to mark as done.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`w-full max-w-xl h-[90vh] overflow-y-auto rounded-lg p-6 shadow-lg relative ${
            theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
          initial={{ scale: 0.95, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 30 }}
        >
          {/* Header */}
          <button
            onClick={onClose}
            className={`absolute top-3 right-4 text-lg font-bold ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-1">{contract.title}</h2>
          <p className="text-sm mb-4"><strong>Category:</strong> {contract.category}</p>

          {/* Details */}
          <div className="space-y-1 text-sm mb-4">
            <p><strong>Client:</strong> {contract.user?.name}</p>
            <p><strong>Budget:</strong> ${contract.budget}</p>
            <p><strong>Duration:</strong> {duration} days</p>
            <p><strong>Status:</strong> {contract.status}</p>
          </div>

          <hr className="my-3" />

          {/* Description */}
          <div className="mb-4">
            <h3 className="font-semibold mb-1">📄 Work Description</h3>
            <p className="whitespace-pre-line text-sm">{contract.description}</p>
          </div>

          {/* Attachment */}
          {contract.fileURL && (
            <div className="flex items-center gap-2 mb-3">
              {getFileIcon(contract.fileURL)}              

              <a
                href={contract.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {contract.fileName || "View File"}
              </a>

            </div>
          )}

          {/* Accepted Bid */}
          <div className="mb-5">
            <h3 className="font-semibold mb-1">🎯 Your Accepted Bid</h3>
            <p className="text-green-600 dark:text-green-400 font-bold text-lg">${contract.acceptedBid?.amount}</p>
            <p className="italic text-sm">{contract.acceptedBid?.message || "No message provided."}</p>
          </div>

          {/* Submission Block */}
          {contract.status === "IN_PROGRESS" && isOwner && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">📬 Work Submission</h3>

              {localSubmission.message && !editingSubmission ? (
                <div className="border rounded p-3 bg-yellow-50 dark:bg-gray-800">
                  <p><strong>Message:</strong></p>
                  <p className="text-sm italic text-gray-800 dark:text-gray-300 mb-2">
                    {localSubmission.message}
                  </p>

                  {localSubmission.fileURL && (
                    <p className="text-sm">
                      <strong>File:</strong>{" "}
                      <a
                        href={localSubmission.fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {localSubmission.fileName || "View File"}
                      </a>
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setSubmissionMessage(localSubmission.message || "");
                      setFile(null); // Optional: only set file if you plan to re-upload
                      setEditingSubmission(true);
                    }}
                    className="mt-3 px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-400"
                  >
                    ✏️ Edit Submission
                  </button>
                  <button
                    onClick={handleMarkAsDone}
                    className="ml-3 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500"
                  >
                    ✅ Mark as Done
                  </button>
                </div>
              ) : (
                <>
                  <textarea
                    placeholder="Enter a message"
                    rows={3}
                    className="w-full p-2 border rounded mb-3 text-sm"
                    value={submissionMessage}
                    onChange={(e) => setSubmissionMessage(e.target.value)}
                  />

                  {localSubmission.fileName && (
                            <p className="text-sm text-gray-500 mb-2">
                              Current File: <span className="font-medium">{localSubmission.fileName}</span>
                            </p>
                          )}

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="mb-2"
                    onChange={(e) => setFile(e.target.files[0])}
                  />

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  <button
                    disabled={submitting}
                    onClick={handleSubmit}
                    className={`px-4 py-2 rounded text-sm font-semibold ${
                      theme === "dark" ? "bg-teal-600 text-white hover:bg-teal-500" : "bg-teal-500 text-white hover:bg-teal-400"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Work"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Cancel button */}
          <div className="mt-6 flex justify-end">
            <button
              disabled={loading}
              onClick={handleCancelContract}
              className={`px-4 py-1 text-sm font-semibold rounded ${
                theme === "dark" ? "bg-red-600 text-white hover:bg-red-500" : "bg-red-500 text-white hover:bg-red-400"
              }`}
            >
              Cancel Contract
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContractModal;
