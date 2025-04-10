// Description: A modal component for displaying and interacting with work requests in a project management application. 
// It allows users to view details, place bids, and manage requests based on their roles (Council or Expert). 
// The modal is styled using Tailwind CSS and includes animations using Framer Motion.
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

const WorkRequestModal = ({ workRequest: initialWorkRequest, currentUser, onClose, onDeleted }) => {
  const router = useRouter();
  const { theme } = useTheme();

  const [workRequest, setWorkRequest] = useState(initialWorkRequest);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingBid, setExistingBid] = useState(null);
  const [showBids, setShowBids] = useState(false);
  const [expandedBids, setExpandedBids] = useState({});
  const [accepting, setAccepting] = useState(false);


  const isOwner = currentUser?.id === workRequest.userId;
  const isCouncil = currentUser?.role === "COUNCIL";
  const isExpert = currentUser?.role === "EXPERT";

  const duration =
    workRequest.deadline && workRequest.createdAt
      ? Math.ceil((new Date(workRequest.deadline) - new Date(workRequest.createdAt)) / (1000 * 60 * 60 * 24))
      : null;


  const fetchWorkRequestDetails = async () => {
    if (!initialWorkRequest?.id || !currentUser?.id) return;
  
    try {
      const res = await fetch(`/api/work-request/${initialWorkRequest.id}`, {
        headers: {
          'x-user-id': currentUser.id,
        },
      });
  
      if (!res.ok) {
        console.error("❌ Failed to fetch work request:", res.status);
        return;
      }
  
      const latest = await res.json();
      setWorkRequest(latest);
    } catch (err) {
      console.error("❌ Error fetching work request:", err);
    }
  };
  

  const fetchExistingBid = async () => {
    const res = await fetch("/api/check-bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, workRequestId: workRequest.id }),
    });
    const { bid } = await res.json();
    setExistingBid(bid);
  };

  
  const toggleExpand = (bidId) => {
    setExpandedBids((prev) => ({
      ...prev,
      [bidId]: !prev[bidId],
    }));
  };



  useEffect(() => {
    document.body.style.overflow = "hidden";
  
    if (isCouncil && currentUser?.id && initialWorkRequest?.id) {
      fetchWorkRequestDetails();
    }
  
    if (isExpert && currentUser?.id && workRequest?.id) {
      fetchExistingBid();
    }
  
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
  
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [currentUser?.id, initialWorkRequest?.id]);
  

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

      await fetchExistingBid();       // update bid
      await fetchWorkRequestDetails(); // refresh council view
    } catch (error) {
      toast.error("Error placing bid");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this work request?")) return;
    try {
      const response = await fetch(`/api/work-request/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete request");
      toast.success("Work request deleted!");
      onClose();
      if (onDeleted) onDeleted(id);
    } catch (error) {
      toast.error("Failed to delete request!");
    }
  };


  const handleAcceptBid = async (bidId) => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/bid/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workRequestId: workRequest.id,
          bidId,
          userId: currentUser.id,
        }),
      });
  
      if (!res.ok) throw new Error("Failed to accept bid");
  
      toast.success("Bid accepted!");
      await fetchWorkRequestDetails(); // refresh modal data
    } catch (error) {
      toast.error("Error accepting bid");
      console.error("❌ Accept bid error:", error);
    } finally {
      setAccepting(false);
    }
  };
  

  const handleUndoAcceptedBid = async () => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/bid/unaccept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workRequestId: workRequest.id,
          userId: currentUser.id,
        }),
      });
  
      if (!res.ok) throw new Error("Failed to undo accepted bid");
  
      toast.success("Acceptance revoked");
      await fetchWorkRequestDetails(); // Refresh modal
    } catch (error) {
      toast.error("Error revoking acceptance");
      console.error("❌ Undo accept bid error:", error);
    } finally {
      setAccepting(false);
    }
  };
  


  

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          transition={{ duration: 0.2 }}
          className={`rounded-lg shadow-lg w-full max-w-2xl p-6 relative ${
            theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-inherit pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <button onClick={onClose} className={`text-lg px-2 py-1 rounded hover:text-red-500 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>✕</button>
            </div>

            <h4 className="text-sm font-semibold">
              {workRequest.user?.name || workRequest.user?.email || "Unknown User"}
            </h4>            
            <h2 className="text-xl font-bold mt-2">{workRequest.title}</h2>
            <div className="inline-block ml-2 px-2 py-1 text-xs rounded-full 
                        bg-blue-100 text-blue-700">
              {workRequest._count?.bids > 0
                ? `${workRequest._count.bids} ${workRequest._count.bids === 1 ? 'bid' : 'bids'}`
                : 'No bids yet'}
            </div>
            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}><strong>Budget:</strong> ${workRequest.budget}</p>
            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}><strong>Duration:</strong> {duration ?? "N/A"} days</p>
          </div>

          <p className={`mt-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} whitespace-pre-line`}>
            {workRequest.description}
          </p>

          {/* Bids (Council View Only) */}
          {isCouncil && isOwner && Array.isArray(workRequest.bids) && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">
                  {workRequest.bids.length > 0
                    ? `${workRequest.bids.length} ${workRequest.bids.length === 1 ? "Bid" : "Bids"} Received`
                    : "No bids yet"}
                </h3>
                <button onClick={() => setShowBids(!showBids)} className="text-xs text-blue-600 hover:underline">
                  {showBids ? "Hide Bids" : "Show Bids"}
                </button>
              </div>          

              {showBids && (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {workRequest.bids.map((bid) => {
                    const isAccepted = workRequest.acceptedBidId === bid.id;

                    return (                      
                      <div
                        key={bid.id}
                        className={`relative flex flex-col justify-between rounded-md p-3 border ${
                          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">
                            💬 {bid.user?.name || "Expert"} - ${bid.amount}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(bid.createdAt).toLocaleString()}</p>

                          {/* Bid Message with Read More */}
                          {bid.message && (
                            <>
                              <p className="mt-1 text-sm">
                                {expandedBids[bid.id]
                                  ? bid.message
                                  : bid.message.length > 200
                                  ? `${bid.message.slice(0, 200)}...`
                                  : bid.message}
                              </p>
                              {bid.message.length > 200 && (
                                <button
                                  onClick={() => toggleExpand(bid.id)}
                                  className="text-xs text-blue-600 hover:underline mt-1"
                                >
                                  {expandedBids[bid.id] ? "Show less" : "Read more"}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Accepting and unaccepting bids */}
                        <div className="mt-3 flex justify-end items-center gap-3">
                          {isAccepted ? (
                            <>
                              <span className="text-green-700 text-xs font-bold">✅ Accepted</span>
                              
                              <button
                                onClick={() => {
                                  const confirmed = window.confirm("Are you sure you want to undo the accepted bid?");
                                  if (confirmed) handleUndoAcceptedBid(bid.id);
                                }}
                                className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500"
                              >
                                Undo
                              </button>

                            </>
                          ) : !workRequest.acceptedBidId ? (
                            <button
                              onClick={() => handleAcceptBid(bid.id)}
                              className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500"
                            >
                              Accept Bid
                            </button>
                          ) : null}
                        </div>
                      </div>

                    );
                  })}
                </div>
              )}

            </div>
          )}

          {workRequest.fileURL && (
            <div className="flex items-center gap-2 mt-3">
              {getFileIcon(workRequest.fileURL)}
              <a href={workRequest.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View File
              </a>
            </div>
          )}

          <span className="inline-block mt-4 px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-full">
            {workRequest.category}
          </span>

          {/* Council Edit/Delete */}
          {isCouncil && isOwner && (
            <div className="mt-6 flex gap-3">
              <button onClick={() => router.push(`/work-request/${workRequest.id}`)}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  theme === "dark" ? "bg-teal-600 hover:bg-teal-500 text-white" : "bg-teal-500 hover:bg-teal-400 text-white"
                }`}
              >Edit</button>
              <button onClick={() => handleDelete(workRequest.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  theme === "dark" ? "bg-red-600 text-white hover:bg-red-500" : "bg-red-500 text-white hover:bg-red-400"
                }`}
              >Delete</button>
            </div>
          )}

          {/* Expert Bidding */}
          {isExpert && (
            <div className="mt-6 space-y-2">
              {existingBid ? (
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
