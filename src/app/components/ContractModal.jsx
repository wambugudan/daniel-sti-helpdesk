// File: src/app/components/ContractModal.jsx
// Description: A modal component for displaying contract details and allowing the user to cancel the contract.
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

  const handleCancelContract = async () => {
    const confirmed = confirm("Are you sure you want to cancel this contract?");
    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/contract/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workRequestId: contract.id, userId: currentUser.id }),
      });

      if (!res.ok) throw new Error("Failed to cancel contract");

      toast.success("Contract cancelled successfully");
      if (onCancelled) onCancelled(contract.id);
      onClose();
    } catch (error) {
      toast.error("Error cancelling contract");
      console.error("Cancel contract error:", error);
    } finally {
      setLoading(false);
    }
  };

  const duration =
    contract.deadline && contract.createdAt
      ? Math.ceil((new Date(contract.deadline) - new Date(contract.createdAt)) / (1000 * 60 * 60 * 24))
      : "N/A";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`w-full max-w-xl rounded-lg p-6 shadow-lg relative ${
            theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close Button */}
          <button
            className={`absolute top-3 right-4 text-lg font-bold ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>

          {/* Title and Category */}
          <h2 className="text-xl font-bold mb-1">{contract.title}</h2>
          <p className="text-sm mb-4">
            <strong>Category:</strong> {contract.category}
          </p>

          {/* Basic Info */}
          <div className="mb-3 space-y-1 text-sm">
            <p><strong>Client:</strong> {contract.user?.name || "N/A"}</p>
            <p><strong>Budget:</strong> ${contract.budget}</p>
            <p><strong>Duration:</strong> {duration} days</p>
            <p><strong>Status:</strong> <span className="uppercase">{contract.status}</span></p>
          </div>

          {/* Work Description */}
          <hr className="my-4" />
          <div className="mb-4 text-sm whitespace-pre-line">
            <h3 className="font-semibold mb-2">📄 Work Description</h3>
            <p>{contract.description}</p>
          </div>

          {/* File Attachment */}
          {contract.fileURL && (
            <div className="flex items-center gap-2 mb-4">
              {getFileIcon(contract.fileURL)}
              <a
                href={contract.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Attachment
              </a>
            </div>
          )}

          {/* Accepted Bid Info */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">🎯 Your Accepted Bid</h3>
            <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
              ${contract.acceptedBid?.amount}
            </p>
            <p className="text-sm italic mt-2">
              {contract.acceptedBid?.message || "No message provided."}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              disabled={loading}
              onClick={handleCancelContract}
              className={`px-4 py-1 text-sm font-semibold rounded-md ${
                theme === "dark"
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-red-500 text-white hover:bg-red-400"
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

