'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";



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

const WorkRequestModal = ({ workRequest, currentUser, onClose, onDeleted }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingBid, setExistingBid] = useState(null);


  const isOwner = currentUser?.id === workRequest.userId;
  const isCouncil = currentUser?.role === "COUNCIL";
  const isExpert = currentUser?.role === "EXPERT";

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this work request?")) return;
    try {
      const response = await fetch(`/api/work-request/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete request");
      alert("Work request deleted!");
      onClose();
      if (onDeleted) onDeleted(id);
    } catch (error) {
      alert("Failed to delete request!");
    }
  };

  // const handleBidSubmit = async () => {
  //   if (!bidAmount) return alert("Bid amount is required");
  
  //   setIsSubmitting(true);
  
  //   try {
  //     const response = await fetch("/api/bid", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userId: currentUser.id,
  //         workRequestId: workRequest.id,
  //         amount: parseFloat(bidAmount),
  //         message: bidMessage,
  //       }),
  //     });
  
  //     if (!response.ok) throw new Error("Failed to place bid");
  
  //     toast.success("Bid placed successfully!");
  //     setBidAmount("");
  //     setBidMessage("");
  //   } catch (error) {
  //     toast.error("Error placing bid");
  //     console.error(error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  

  // const handleBidSubmit = async () => {
  //   setIsSubmitting(true);
  //   try {
  //     const response = await fetch("/api/bids", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userId: currentUser.id,
  //         workRequestId: workRequest.id,
  //         amount: parseFloat(bidAmount),
  //         message: bidMessage,
  //       }),
  //     });
  //     if (!response.ok) throw new Error("Failed to submit bid");
  //     alert("Bid submitted!");
  //     onClose();
  //   } catch (error) {
  //     alert("Error submitting bid.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };


  // const handleBidSubmit = async () => {
  //   if (!bidAmount) return toast.error("Bid amount is required");
  
  //   setIsSubmitting(true);
  
  //   try {
  //     const response = await fetch("/api/bid", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userId: currentUser.id,
  //         workRequestId: workRequest.id,
  //         amount: parseFloat(bidAmount),
  //         message: bidMessage,
  //       }),
  //     });
  
  //     if (!response.ok) throw new Error("Failed to place bid");
  
  //     toast.success("Bid placed successfully!");
  //     setBidAmount("");
  //     setBidMessage("");
  //     onClose(); // 👈 if you want to close modal after success
  //   } catch (error) {
  //     toast.error("Error placing bid");
  //     console.error(error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };


  const handleBidSubmit = async () => {
    if (!bidAmount) return alert("Bid amount is required");
  
    setIsSubmitting(true);
  
    try {
      const response = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          workRequestId: workRequest.id,
          amount: parseFloat(bidAmount),
          message: bidMessage,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to place bid");
  
      toast.success("Bid placed successfully!");
      setBidAmount("");
      setBidMessage("");
  
      // 🔁 Re-fetch the bid to reflect in UI
      await fetchExistingBid();
    } catch (error) {
      toast.error("Error placing bid");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  const duration =
    workRequest.deadline && workRequest.createdAt
      ? Math.ceil((new Date(workRequest.deadline) - new Date(workRequest.createdAt)) / (1000 * 60 * 60 * 24))
      : null;

  useEffect(() => {
    // Disable background scroll
    document.body.style.overflow = "hidden";

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);


  // Fetching existing bid
  const fetchExistingBid = async () => {
    const res = await fetch("/api/check-bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, workRequestId: workRequest.id }),
    });
  
    const { bid } = await res.json();
    setExistingBid(bid);
  };

  // Fetch existing bid for expert user
  useEffect(() => {
    if (isExpert) fetchExistingBid();
  }, [currentUser.id, workRequest.id]);
  
  
  

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          transition={{ duration: 0.2 }}
          className={`rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-6 relative ${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`}
          style={{ maxHeight: "90vh", overflowY: "auto" }} // Allow for scrolling the model
          
        >
          <div className="sticky top-0 z-20 bg-inherit pb-2 border-b border-gray-200 dark:border-gray-700">

            {/* <div className="sticky top-0 z-10 flex justify-end bg-inherit"> */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className={`text-lg px-2 py-1 rounded hover:text-red-500 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>


            <h4 className="text-sm font-semibold">
              {workRequest.user?.name || workRequest.user?.email || "Unknown User"}
            </h4>

            <h2 className="text-xl font-bold mt-2">{workRequest.title}</h2>

            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              <strong>Budget:</strong> ${workRequest.budget}
            </p>
            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              <strong>Duration:</strong> {duration ?? "N/A"} days
            </p>
          </div>

          {/* <p className="mt-4 text-sm text-gray-800 whitespace-pre-line"> */}
          <p className={`mt-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} whitespace-pre-line`}>
            {workRequest.description}
          </p>

          {workRequest.fileURL && (
            <div className="flex items-center gap-2 mt-3">
              {getFileIcon(workRequest.fileURL)}
              <a
                href={workRequest.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View File
              </a>
            </div>
          )}

          <span className="inline-block mt-4 px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-full">
            {workRequest.category}
          </span>

          {isCouncil && isOwner && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push(`/work-request/${workRequest.id}`)}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  theme === "dark"
                    ? "bg-teal-600 hover:bg-teal-500 text-white"
                    : "bg-teal-500 hover:bg-teal-400 text-white"
                }`}
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(workRequest.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  theme === "dark"
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "bg-red-500 text-white hover:bg-red-400"
                }`}
              >
                Delete
              </button>
            </div>
          )}

          {/* {isExpert && (
            <div className="mt-6 space-y-2">
              <input
                type="number"
                placeholder="Your bid amount"
                className="w-full px-3 py-2 border rounded"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <textarea
                placeholder="Message (optional)"
                className="w-full px-3 py-2 border rounded"
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
              />
              <button
                disabled={isSubmitting}
                onClick={handleBidSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Bid"}
              </button>
            </div>
          )} */}
          {isExpert && (
            <div className="mt-6 space-y-2">
              {existingBid ? (
                // <div className="text-sm text-gray-600 dark:text-gray-300">
                //   <p>You already placed a bid:</p>
                //   <p className="font-semibold text-green-600">${existingBid.amount}</p>
                //   <p>{existingBid.message || "No message provided."}</p>
                // </div>
                <div className="text-sm bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 p-4 rounded-md">
                  <p className="text-gray-700 dark:text-gray-300 mb-1">You already placed a bid for this project:</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">${existingBid.amount}</p>
                  {existingBid.message ? (
                    <blockquote className="italic text-gray-600 dark:text-gray-400 border-l-4 border-blue-400 pl-4">
                      “{existingBid.message}”
                    </blockquote>
                  ) : (
                    <p className="text-sm italic text-gray-500">No message provided.</p>
                  )}
                </div>

              ) : (
                <>
                  <input
                    type="number"
                    placeholder="Your bid amount"
                    className="w-full px-3 py-2 border rounded"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <textarea
                    placeholder="Message (optional)"
                    className="w-full px-3 py-2 border rounded"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                  />
                  <button
                    disabled={isSubmitting}
                    onClick={handleBidSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 w-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bid"}
                  </button>
                </>
              )}
            </div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkRequestModal;
