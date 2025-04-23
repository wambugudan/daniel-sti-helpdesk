// Description: A modal component for displaying and interacting with work requests in a project management application. 
// It allows users to view details, place bids, and manage requests based on their roles (Council or Expert). 
// The modal is styled using Tailwind CSS and includes animations using Framer Motion.
// File: src/app/components/WorkRequestModal.jsx
'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import BidForm from "./BidForm";


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

  const [showConfetti, setShowConfetti] = useState(false);

  const modalRef = useRef(null);
  const [modalSize, setModalSize] = useState({ width: 0, height: 0 });



  const isOwner = currentUser?.id === workRequest.userId;
  const isCouncil = currentUser?.role === "COUNCIL";
  const isExpert = currentUser?.role === "EXPERT";


  // This effect runs when the work request changes, updating the bid amount and message if an existing bid is found.
  const duration =
    workRequest.deadline && workRequest.createdAt
      ? Math.ceil((new Date(workRequest.deadline) - new Date(workRequest.createdAt)) / (1000 * 60 * 60 * 24))
      : null;


  // This function fetches the latest work request details from the server.
  // It sends a GET request to the server with the work request ID and user ID in the headers.
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
  

  // This function fetches the existing bid for the current user and work request.
  // It sends a POST request to the server and updates the existingBid state with the response.
  const fetchExistingBid = async () => {
    const res = await fetch("/api/check-bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, workRequestId: workRequest.id }),
    });
    const { bid } = await res.json();
    setExistingBid(bid);
  };

  
  // This function toggles the expanded state of the bid message.
  // It updates the expandedBids state to show or hide the full message.
  const toggleExpand = (bidId) => {
    setExpandedBids((prev) => ({
      ...prev,
      [bidId]: !prev[bidId],
    }));
  };


  useEffect(() => {
    if (modalRef.current) {
      const observer = new ResizeObserver(() => {
        const { offsetWidth, offsetHeight } = modalRef.current;
        setModalSize({ width: offsetWidth, height: offsetHeight });
      });
      observer.observe(modalRef.current);
  
      return () => observer.disconnect();
    }
  }, []); 



  // This effect runs when the component mounts and when the work request or user changes.
  // It fetches the work request details and existing bid if applicable.
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
  

  // This function is called when the expert user wants to place a bid.
  // It sends a POST request to the server with the bid details and updates the state accordingly.
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


  // This function is called when the council user wants to accept a bid.
  // It sends a PUT request to the server to update the work request with the accepted bid ID.
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
  

  // This function is called when the council user wants to undo the accepted bid.
  // It sends a PUT request to the server to update the work request and remove the accepted bid.
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


  const handleCompleteWork = async () => {
    if (!confirm("Are you sure this work is fully completed?")) return;
  
    try {
      const res = await fetch("/api/work-request/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workRequestId: workRequest.id,
          userId: currentUser.id,
        }),
      });
  
      if (!res.ok) throw new Error("Failed to mark as completed");
  
      toast.success("🎉 Work marked as completed!");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500); // 2.5 seconds
      await fetchWorkRequestDetails();
    } catch (error) {
      toast.error("Error updating status");
      console.error("❌ Completion Error:", error);
    }
  };  
  


  // Reopen work request
  // This function is called when the council user wants to reopen the work request.
  const handleReopenWork = async () => {
    if (!confirm("Reopen this work and mark it as In Progress?")) return;
  
    try {
      const res = await fetch("/api/work-request/reopen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workRequestId: workRequest.id,
          userId: currentUser.id,
        }),
      });
  
      if (!res.ok) throw new Error("Failed to reopen work");
  
      toast.success("Work reopened!");
      await fetchWorkRequestDetails();
    } catch (error) {
      toast.error("Error reopening work");
      console.error("❌ Reopen Error:", error);
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
          ref={modalRef}
          className={`rounded-lg shadow-lg w-full max-w-2xl p-6 relative ${
            theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* Confetti effect when work is marked as completed */}
          {workRequest.status === "CLOSED" && showConfetti && (
            <div className="absolute inset-0 z-40 pointer-events-none">
              <Confetti
                width={modalSize.width}
                height={modalSize.height}
                numberOfPieces={200}
                recycle={false}
              />
            </div>
          )}

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

          {workRequest.fileURL && (
            <div className="flex items-center gap-2 mt-3">
              {getFileIcon(workRequest.fileURL)}
              <a href={workRequest.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View File
              </a>
            </div>
          )}

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
                    const hasSubmission = !!bid.submissionMessage || !!bid.submissionFileURL;

                    return (
                      <div
                        key={bid.id}
                        className={`relative flex flex-col justify-between rounded-md p-3 border ${
                          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"
                        }`}
                      >
                        {/* Bid Header */}
                        <div>
                          <p className="text-sm font-medium">
                            💬 {bid.user?.name || "Expert"} - ${bid.amount}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(bid.createdAt).toLocaleString()}</p>

                          {/* Bid Message */}
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

                        {/* Action Buttons */}
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
          

          <span className="inline-block mt-4 px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-full">
            {workRequest.category}
          </span>         
         

          {/* Council Edit/Delete/Complete */}
          {isCouncil && isOwner && (
            <div className="mt-6 space-y-4">

              {/* Edit + Delete Buttons */}
              <div className="flex flex-wrap gap-3">
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

              {/* 📬 Expert Submission Block - Below Edit/Delete */}
              {workRequest.acceptedBid?.Submission && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">📬 Expert Submission</h3>

                  <div className="bg-yellow-50 dark:bg-gray-800 border rounded p-4 text-sm">
                    <p className="mb-2">
                      <strong>Message:</strong>{" "}
                      <span className="italic text-gray-800 dark:text-gray-300">
                        {workRequest.acceptedBid.Submission?.message}
                      </span>
                    </p>

                    {workRequest.acceptedBid.Submission?.fileURL && (
                      <p className="mb-2">
                        <strong>File:</strong>{" "}
                        <a
                          href={workRequest.acceptedBid.Submission?.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {workRequest.acceptedBid.Submission?.fileName || "View Submitted File"}
                        </a>
                      </p>
                    )}

                    {workRequest.acceptedBid.submittedAt && (
                      <p className="text-xs text-gray-500">
                        Submitted on {new Date(workRequest.Submission?.submittedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ✅ Mark as Completed Button */}
              {workRequest.status === "IN_PROGRESS" && (
                <button
                  onClick={handleCompleteWork}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    theme === "dark"
                      ? "bg-green-700 hover:bg-green-600 text-white"
                      : "bg-green-600 hover:bg-green-500 text-white"
                  }`}
                >
                  ✅ Mark as Completed
                </button>
              )}

              {/* 🔁 Reopen Option if Work is Closed */}
              {workRequest.status === "CLOSED" && (
                <>
                  <div className="w-full text-green-600 text-sm font-semibold">
                    🎉 This work has been marked as <span className="font-bold">Completed</span>.
                  </div>

                  <button
                    onClick={handleReopenWork}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      theme === "dark"
                        ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                        : "bg-yellow-300 hover:bg-yellow-400 text-black"
                    }`}
                  >
                    🔁 Reopen Work
                  </button>
                </>
              )}
            </div>
          )}



          {/* Expert Bidding */}
          {isExpert && (
            // <div className="mt-6 space-y-2">
            //   {existingBid ? (
            //     <div className="text-sm bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 p-4 rounded-md">
            //       <p className="text-gray-700 dark:text-gray-300 mb-1">You already placed a bid for this project:</p>
            //       <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">${existingBid.amount}</p>
            //       {existingBid.message ? (
            //         <blockquote className="italic text-gray-600 dark:text-gray-400 border-l-4 border-blue-400 pl-4">
            //           “{existingBid.message}”
            //         </blockquote>
            //       ) : (
            //         <p className="text-sm italic text-gray-500">No message provided.</p>
            //       )}
            //     </div>
            //   ) : (
            //     <>
            //       <input
            //         type="number"
            //         placeholder="Your bid amount"
            //         className="w-full px-3 py-2 border rounded"
            //         value={bidAmount}
            //         onChange={(e) => setBidAmount(e.target.value)}
            //       />
            //       <textarea
            //         placeholder="Message (optional)"
            //         className="w-full px-3 py-2 border rounded"
            //         value={bidMessage}
            //         onChange={(e) => setBidMessage(e.target.value)}
            //       />
            //       <button
            //         disabled={isSubmitting}
            //         onClick={handleBidSubmit}
            //         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 w-full"
            //       >
            //         {isSubmitting ? "Submitting..." : "Submit Bid"}
            //       </button>
            //     </>
            //   )}
            // </div>
            <BidForm
              currentUser={currentUser}
              workRequest={workRequest}
              onBidSubmitted={async () => {
                await fetchExistingBid();
                await fetchWorkRequestDetails();
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkRequestModal;



// File: src/app/components/WorkRequestModal.jsx

// 'use client';

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useTheme } from "@/context/ThemeProvider";
// import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";
// import { motion, AnimatePresence } from "framer-motion";
// import toast from "react-hot-toast";
// import Confetti from "react-confetti";
// import BidForm from "./BidForm";

// const getFileIcon = (fileURL) => {
//   if (!fileURL) return <FaFileAlt className="text-gray-500 text-2xl" />;
//   const ext = fileURL.split(".").pop().toLowerCase();
//   switch (ext) {
//     case "pdf": return <FaFilePdf className="text-red-500 text-2xl" />;
//     case "doc":
//     case "docx": return <FaFileWord className="text-blue-500 text-2xl" />;
//     case "jpg":
//     case "jpeg":
//     case "png": return <FaFileImage className="text-green-500 text-2xl" />;
//     default: return <FaFileAlt className="text-gray-500 text-2xl" />;
//   }
// };

// const WorkRequestModal = ({ workRequest: initialWorkRequest, currentUser, onClose, onDeleted }) => {
//   const router = useRouter();
//   const { theme } = useTheme();

//   const [workRequest, setWorkRequest] = useState(initialWorkRequest);
//   const [showBids, setShowBids] = useState(false);
//   const [expandedBids, setExpandedBids] = useState({});
//   const [accepting, setAccepting] = useState(false);
//   const [showConfetti, setShowConfetti] = useState(false);

//   const modalRef = useRef(null);
//   const [modalSize, setModalSize] = useState({ width: 0, height: 0 });

//   const isOwner = currentUser?.id === workRequest.userId;
//   const isCouncil = currentUser?.role === "COUNCIL";
//   const isExpert = currentUser?.role === "EXPERT";

//   const duration =
//     workRequest.deadline && workRequest.createdAt
//       ? Math.ceil((new Date(workRequest.deadline) - new Date(workRequest.createdAt)) / (1000 * 60 * 60 * 24))
//       : null;

//   const fetchWorkRequestDetails = async () => {
//     if (!initialWorkRequest?.id || !currentUser?.id) return;
//     try {
//       const res = await fetch(`/api/work-request/${initialWorkRequest.id}`, {
//         headers: {
//           'x-user-id': currentUser.id,
//         },
//       });
//       if (!res.ok) return;
//       const latest = await res.json();
//       setWorkRequest(latest);
//     } catch (err) {
//       console.error("❌ Error fetching work request:", err);
//     }
//   };

//   const handleAcceptBid = async (bidId) => {
//     setAccepting(true);
//     try {
//       const res = await fetch(`/api/bid/accept`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           workRequestId: workRequest.id,
//           bidId,
//           userId: currentUser.id,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to accept bid");

//       toast.success("Bid accepted!");
//       await fetchWorkRequestDetails();
//     } catch (error) {
//       toast.error("Error accepting bid");
//       console.error("❌ Accept bid error:", error);
//     } finally {
//       setAccepting(false);
//     }
//   };

//   const handleUndoAcceptedBid = async (bidId) => {
//     setAccepting(true);
//     try {
//       const res = await fetch(`/api/bid/unaccept`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           workRequestId: workRequest.id,
//           userId: currentUser.id,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to undo accepted bid");

//       toast.success("Acceptance revoked");
//       await fetchWorkRequestDetails();
//     } catch (error) {
//       toast.error("Error revoking acceptance");
//     } finally {
//       setAccepting(false);
//     }
//   };

//   const handleCompleteWork = async () => {
//     if (!confirm("Are you sure this work is fully completed?")) return;

//     try {
//       const res = await fetch("/api/work-request/complete", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           workRequestId: workRequest.id,
//           userId: currentUser.id,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to mark as completed");

//       toast.success("🎉 Work marked as completed!");
//       setShowConfetti(true);
//       setTimeout(() => setShowConfetti(false), 3500);
//       await fetchWorkRequestDetails();
//     } catch (error) {
//       toast.error("Error updating status");
//     }
//   };

//   const handleReopenWork = async () => {
//     if (!confirm("Reopen this work and mark it as In Progress?")) return;

//     try {
//       const res = await fetch("/api/work-request/reopen", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           workRequestId: workRequest.id,
//           userId: currentUser.id,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to reopen work");

//       toast.success("Work reopened!");
//       await fetchWorkRequestDetails();
//     } catch (error) {
//       toast.error("Error reopening work");
//     }
//   };

//   useEffect(() => {
//     if (modalRef.current) {
//       const observer = new ResizeObserver(() => {
//         const { offsetWidth, offsetHeight } = modalRef.current;
//         setModalSize({ width: offsetWidth, height: offsetHeight });
//       });
//       observer.observe(modalRef.current);
//       return () => observer.disconnect();
//     }
//   }, []);

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     if (isCouncil && currentUser?.id && initialWorkRequest?.id) {
//       fetchWorkRequestDetails();
//     }
//     const handleEscape = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     document.addEventListener("keydown", handleEscape);
//     return () => {
//       document.body.style.overflow = "auto";
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [currentUser?.id, initialWorkRequest?.id]);

//   const toggleExpand = (bidId) => {
//     setExpandedBids((prev) => ({
//       ...prev,
//       [bidId]: !prev[bidId],
//     }));
//   };

//   return (
//     <AnimatePresence>
//       <motion.div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto"
//         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
//       >
//         <motion.div
//           initial={{ scale: 0.9, y: 40 }}
//           animate={{ scale: 1, y: 0 }}
//           exit={{ scale: 0.9, y: 40 }}
//           transition={{ duration: 0.2 }}
//           ref={modalRef}
//           className={`rounded-lg shadow-lg w-full max-w-2xl p-6 relative ${
//             theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
//           }`}
//           style={{ maxHeight: "90vh", overflowY: "auto" }}
//         >
//           {workRequest.status === "CLOSED" && showConfetti && (
//             <div className="absolute inset-0 z-40 pointer-events-none">
//               <Confetti
//                 width={modalSize.width}
//                 height={modalSize.height}
//                 numberOfPieces={200}
//                 recycle={false}
//               />
//             </div>
//           )}

//           <div className="sticky top-0 z-20 bg-inherit pb-2 border-b border-gray-200 dark:border-gray-700">
//             <div className="flex justify-end">
//               <button onClick={onClose} className={`text-lg px-2 py-1 rounded hover:text-red-500 ${
//                 theme === "dark" ? "text-gray-300" : "text-gray-700"
//               }`}>✕</button>
//             </div>

//             <h4 className="text-sm font-semibold">
//               {workRequest.user?.name || workRequest.user?.email || "Unknown User"}
//             </h4>
//             <h2 className="text-xl font-bold mt-2">{workRequest.title}</h2>
//           </div>

//           <p className={`mt-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} whitespace-pre-line`}>
//             {workRequest.description}
//           </p>

//           {/* Submission Display */}
//           {workRequest.acceptedBid?.Submission && (
//             <div className="mt-6 border-t pt-4">
//               <h3 className="font-semibold mb-2">📬 Expert Submission</h3>
//               <div className="bg-yellow-50 dark:bg-gray-800 border rounded p-4 text-sm">
//                 <p className="mb-2">
//                   <strong>Message:</strong>{" "}
//                   <span className="italic text-gray-800 dark:text-gray-300">
//                     {workRequest.acceptedBid.Submission.message}
//                   </span>
//                 </p>

//                 {workRequest.acceptedBid.Submission.fileURL && (
//                   <p className="mb-2">
//                     <strong>File:</strong>{" "}
//                     <a
//                       href={workRequest.acceptedBid.Submission.fileURL}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 underline"
//                     >
//                       {workRequest.acceptedBid.Submission.fileName || "View Submitted File"}
//                     </a>
//                   </p>
//                 )}

//                 {workRequest.acceptedBid.Submission.submittedAt && (
//                   <p className="text-xs text-gray-500">
//                     Submitted on {new Date(workRequest.acceptedBid.Submission.submittedAt).toLocaleString()}
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Mark as Completed */}
//           {isCouncil && isOwner && workRequest.status === "IN_PROGRESS" && (
//             <div className="mt-6">
//               <button
//                 onClick={handleCompleteWork}
//                 className={`px-3 py-1 text-xs font-medium rounded-md ${
//                   theme === "dark"
//                     ? "bg-green-700 hover:bg-green-600 text-white"
//                     : "bg-green-600 hover:bg-green-500 text-white"
//                 }`}
//               >
//                 ✅ Mark as Completed
//               </button>
//             </div>
//           )}

//           {/* Reopen Option */}
//           {isCouncil && isOwner && workRequest.status === "CLOSED" && (
//             <div className="mt-6">
//               <div className="text-green-600 font-semibold text-sm mb-2">
//                 🎉 This work has been marked as <strong>Completed</strong>.
//               </div>
//               <button
//                 onClick={handleReopenWork}
//                 className={`px-3 py-1 text-xs font-medium rounded-md ${
//                   theme === "dark"
//                     ? "bg-yellow-600 hover:bg-yellow-500 text-white"
//                     : "bg-yellow-300 hover:bg-yellow-400 text-black"
//                 }`}
//               >
//                 🔁 Reopen Work
//               </button>
//             </div>
//           )}

//           {/* Bid Form for Experts */}
//           {isExpert && (
//             <div className="mt-6">
//               <BidForm
//                 currentUser={currentUser}
//                 workRequest={workRequest}
//                 onBidSubmitted={fetchWorkRequestDetails}
//               />
//             </div>
//           )}
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default WorkRequestModal;
