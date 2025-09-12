// Description: A modal component for displaying and interacting with work requests in a project management application.
// File: src/app/components/WorkRequestModal.jsx
'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link'; // Import Link for user profile navigation
import { useTheme } from "@/context/ThemeProvider";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import BidForm from "./BidForm"; 
import clsx from "clsx"; // Import clsx for conditional class names

import { useSignedUrl } from "@/hooks/useSignedUrl";
// import { getFileIcon } from "./contract/utils/fileIcons";


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

    const [submissionFileUrl, setSubmissionFileUrl] = useState(null); // New state for signed URL
    const [workRequest, setWorkRequest] = useState(initialWorkRequest);
    const [bidAmount, setBidAmount] = useState(""); // Kept for consistency, though BidForm might abstract this
    const [bidMessage, setBidMessage] = useState(""); // Kept for consistency
    const [isSubmitting, setIsSubmitting] = useState(false); // Kept for consistency
    const [existingBid, setExistingBid] = useState(null);
    const [showBids, setShowBids] = useState(false);
    const [expandedBids, setExpandedBids] = useState({});
    const [accepting, setAccepting] = useState(false);

    const [showConfetti, setShowConfetti] = useState(false);

    const modalRef = useRef(null);
    const [modalSize, setModalSize] = useState({ width: 0, height: 0 });

    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackStatus, setFeedbackStatus] = useState(null); // "APPROVED" or "REJECTED"
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [newFile, setNewFile] = useState(null);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const isOwner = currentUser?.id === workRequest.userId;
    const isCouncil = currentUser?.role === "COUNCIL";
    const isExpert = currentUser?.role === "EXPERT";

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

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

    // Use custom hook to get signed URL for submission file
    const { signedFileUrl, loadingFileUrl } = useSignedUrl(
        // submission?.fileURL,
        workRequest.acceptedBid?.submission?.fileURL,
        "submissions"
    );

    const fetchExistingBid = async () => {
        const res = await fetch("/api/check-bid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id, workRequestId: workRequest.id }),
        });
        const { bid } = await res.json();
        setExistingBid(bid);
    };

    const refreshNotifications = async () => {
        try {
            await fetch('/api/notifications/refresh', {
                method: 'POST',
                headers: {
                    'x-user-id': currentUser.id,
                },
            });
        } catch (error) {
            console.error("Failed to refresh notifications", error);
        }
    };

    const toggleExpand = (bidId) => {
        setExpandedBids((prev) => ({
            ...prev,
            [bidId]: !prev[bidId],
        }));
    };

    useEffect(() => {
        if (!modalRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const modal = entries[0]?.target;
            if (modal) {
                const { offsetWidth, offsetHeight } = modal;
                setModalSize({ width: offsetWidth, height: offsetHeight });
            }
        });

        observer.observe(modalRef.current);

        return () => observer.disconnect();
    }, []);

    const fetchMessages = async () => {
        if (!workRequest?.acceptedBid?.submission?.id) return;
        try {
            const res = await fetch(`/api/submission/message/${workRequest.acceptedBid.submission.id}`);
            if (!res.ok) throw new Error("Failed to load messages");
            const data = await res.json();
            setMessages(data.messages || []);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    };

    useEffect(() => {
        document.body.style.overflow = "hidden";

        if (isCouncil && currentUser?.id && initialWorkRequest?.id) {
            fetchWorkRequestDetails();
            fetchMessages();
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
    }, [currentUser?.id, initialWorkRequest?.id, workRequest?.id, isCouncil, isExpert]); // Added dependencies for clarity

    // Function to fetch the signed URL for the submission file
    const fetchSubmissionFileUrl = async () => {
        if (!workRequest.acceptedBid?.submission?.fileURL) {
            return;
        }

        try {
            const response = await fetch('/api/get-signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filePath: workRequest.acceptedBid.submission.fileName,
                    bucketName: 'submissions', // Specify the new bucket
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get signed URL for submission file.');
            }

            const data = await response.json();
            setSubmissionFileUrl(data.signedUrl);
        } catch (error) {
            console.error("Error fetching submission file URL:", error);
            toast.error("Failed to load submission file link.");
        }
    };

    // Fetch submission file URL when workRequest changes
    useEffect(() => {
        fetchSubmissionFileUrl();
    }, [workRequest]);

    const handleBidSubmit = async () => {
        if (!bidAmount) return toast.error("Bid amount is required"); // Changed alert to toast

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

            await fetchExistingBid();
            await fetchWorkRequestDetails();
            await refreshNotifications();
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
        if (accepting) return;
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
            console.log("🟢 Accept bid triggered for bid ID:", bidId);

            await fetchWorkRequestDetails();
            await refreshNotifications();
        } catch (error) {
            toast.error("Error accepting bid or creating contract");
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
            await fetchWorkRequestDetails();
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
            setTimeout(() => setShowConfetti(false), 3500);
            await fetchWorkRequestDetails();
        } catch (error) {
            toast.error("Error updating status");
            console.error("❌ Completion Error:", error);
        }
    };

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

    // const handleSendMessage = async () => {
    //     if (!newMessage.trim() && !newFile) {
    //         toast.error("Cannot send empty message");
    //         return;
    //     }

    //     setSending(true);
    //     try {
    //         const formData = new FormData();
    //         formData.append("submissionId", workRequest.acceptedBid?.submission?.id);
    //         formData.append("senderId", currentUser.id);
    //         formData.append("senderRole", currentUser.role);
    //         formData.append("content", newMessage.trim());
    //         if (newFile) formData.append("file", newFile);

    //         const res = await fetch("/api/submission/message/send", {
    //             method: "POST",
    //             body: formData,
    //         });

    //         if (!res.ok) throw new Error("Failed to send message");

    //         toast.success("Message sent!");
    //         setNewMessage("");
    //         setNewFile(null);

    //         await fetchMessages(); // Refresh conversation
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Failed to send");
    //     } finally {
    //         setSending(false);
    //     }
    // };

    
    // const handleSendMessage = async () => {
    //     if (!newMessage.trim() && !newFile) {
    //         toast.error("Cannot send empty message");
    //         return;
    //     }

    //     setSending(true);
    //     try {
    //         let fileURL = null;

    //         // ✅ If a file is selected, upload to Supabase first
    //         if (newFile) {
    //         const fileName = `${Date.now()}-${newFile.name}`;
    //         const { error: uploadError } = await supabase.storage
    //             .from("submission_messages") // or "submissions" if you want
    //             .upload(fileName, newFile);

    //         if (uploadError) throw uploadError;
    //         fileURL = fileName;
    //         }

    //         // ✅ Send JSON instead of FormData
    //         const res = await fetch("/api/submission/message/send", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 submissionId: workRequest.acceptedBid?.submission?.id,
    //                 senderId: currentUser.id,
    //                 senderRole: currentUser.role,
    //                 content: newMessage.trim(),
    //                 fileURL,
    //             }),
    //         });

    //         if (!res.ok) throw new Error("Failed to send message");

    //         toast.success("Message sent!");
    //         setNewMessage("");
    //         setNewFile(null);

    //         await fetchMessages(); // Refresh conversation
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Failed to send");
    //     } finally {
    //         setSending(false);
    //     }
    // };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !newFile) {
            toast.error("Cannot send empty message");
            return;
        }

        setSending(true);
        try {
            let fileURL = null;

            // ✅ Upload file first (if present)
            if (newFile) {
            const formData = new FormData();
            formData.append("file", newFile);
            formData.append("bucket", "submission_messages");

            const uploadRes = await fetch("/api/uploads", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                throw new Error(`Upload failed: ${await uploadRes.text()}`);
            }

            const uploaded = await uploadRes.json();
            fileURL = uploaded.fileURL;
            }

            // ✅ Send message payload as JSON
            const payload = {
            submissionId: workRequest.acceptedBid?.submission?.id,
            senderId: currentUser.id,
            senderRole: currentUser.role,
            content: newMessage.trim() || null,
            fileURL,
            };

            const res = await fetch("/api/submission/message/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to send message");

            toast.success("Message sent!");
            setNewMessage("");
            setNewFile(null);

            await fetchMessages(); // Refresh conversation
        } catch (error) {
            console.error("❌ handleSendMessage error:", error);
            toast.error("Failed to send");
        } finally {
            setSending(false);
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
                    className={clsx(
                        `rounded-lg shadow-lg w-full max-w-2xl p-6 relative`,
                        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                    )}
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

                    {/* Header */}
                    <div className="bg-inherit pb-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-end">
                            <button onClick={onClose} className={clsx(
                                `text-lg px-2 py-1 rounded hover:text-red-500`,
                                theme === "dark" ? "text-gray-300" : "text-gray-700"
                            )}>✕</button>
                        </div>

                        {/* Work Request Owner (Council) */}
                        <h4 className="text-sm font-semibold">
                            Submitted by:{' '}
                            {workRequest.userId ? (
                                <Link
                                    href={`/profile/${workRequest.userId}`}
                                    className={clsx(
                                        "font-medium hover:underline",
                                        theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                                    )}
                                >
                                    {workRequest.user?.name || workRequest.user?.email || "Unknown User"}
                                </Link>
                            ) : (
                                <span className={clsx(
                                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                                )}>
                                    {workRequest.user?.name || workRequest.user?.email || "Unknown User"}
                                </span>
                            )}
                        </h4>
                        <h2 className="text-xl font-bold mt-2">{workRequest.title}</h2>
                        <div className="inline-block ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                            {workRequest._count?.bids > 0
                                ? `${workRequest._count.bids} ${workRequest._count.bids === 1 ? 'bid' : 'bids'}`
                                : 'No bids yet'}
                        </div>
                        <p className={clsx(theme === "dark" ? "text-gray-300" : "text-gray-700")}><strong>Budget:</strong> ${workRequest.budget}</p>
                        <p className={clsx(theme === "dark" ? "text-gray-300" : "text-gray-700")}><strong>Duration:</strong> {duration ?? "N/A"} days</p>
                    </div>

                    <p className={clsx(
                        `mt-4 text-sm whitespace-pre-line`,
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                    )}>
                        {workRequest.description}
                    </p>

                    {workRequest.fileURL && (
                        // <div className="flex items-center gap-2 mt-3">
                        //     {getFileIcon(workRequest.fileURL)}
                        //     <a 
                        //         // href={workRequest.fileURL} 
                        //         href={`/api/serve-file?filePath=${encodeURIComponent(workRequest.fileURL)}`}
                        //         target="_blank" rel="noopener noreferrer" 
                        //         className="text-blue-600 underline"
                        //     >
                        //         View File
                        //     </a>
                        // </div>
                        <div className="mt-4">
                            <h3 className="font-semibold text-lg mb-2">Attached File:</h3>
                            <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {getFileIcon(workRequest.fileURL)}
                                <a
                                href={`/api/serve-file?filePath=${encodeURIComponent(workRequest.fileURL)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-500"
                                >
                                View File
                                </a>
                            </div>
                            |
                            {/* New Download Link */}
                            <a
                                href={`/api/serve-file?filePath=${encodeURIComponent(workRequest.fileURL)}&download=true`}
                                download
                                // className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                className="text-blue-600 underline hover:text-blue-500"
                            >
                                Download File
                            </a>
                            </div>
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
                                    className={clsx(
                                        `px-3 py-1 text-xs font-medium rounded-md`,
                                        theme === "dark"
                                            ? "bg-teal-600 hover:bg-teal-500 text-white"
                                            : "bg-teal-500 hover:bg-teal-400 text-white"
                                    )}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(workRequest.id)}
                                    className={clsx(
                                        `px-3 py-1 text-xs font-medium rounded-md`,
                                        theme === "dark"
                                            ? "bg-red-600 text-white hover:bg-red-500"
                                            : "bg-red-500 text-white hover:bg-red-400"
                                    )}
                                >
                                    Delete
                                </button>
                            </div>

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
                                                const hasSubmission = !!bid.submissionMessage || !!bid.submissionFileURL; // This variable isn't used. Can remove if not needed.

                                                return (
                                                    <div
                                                        key={bid.id}
                                                        className={clsx(
                                                            `relative flex flex-col justify-between rounded-md p-3 border`,
                                                            theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"
                                                        )}
                                                    >
                                                        {/* Bid Header */}
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                💬{' '}
                                                                {bid.userId ? (
                                                                    <Link
                                                                        href={`/profile/${bid.userId}`}
                                                                        className={clsx(
                                                                            "font-medium hover:underline",
                                                                            theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                                                                        )}
                                                                    >
                                                                        {bid.user?.name || "Expert"}
                                                                    </Link>
                                                                ) : (
                                                                    <span>{bid.user?.name || "Expert"}</span>
                                                                )}
                                                                {' '} - ${bid.amount}
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
                                                                            if (confirmed) handleUndoAcceptedBid(); // Removed bid.id as handleUndoAcceptedBid doesn't use it
                                                                        }}
                                                                        className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500"
                                                                    >
                                                                        Undo
                                                                    </button>
                                                                </>
                                                            ) : !workRequest.acceptedBidId ? (
                                                                <button
                                                                    disabled={accepting}
                                                                    onClick={() => handleAcceptBid(bid.id)}
                                                                    className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-500"
                                                                >
                                                                    {accepting ? "Processing..." : "Accept Bid"}
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

                            {/* 📬 Expert Submission Block */}
                            {workRequest.acceptedBid?.submission && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">📬 Expert Submission</h3>

                                    <div className="bg-yellow-50 dark:bg-gray-800 border rounded p-4 text-sm">
                                        {/* 👤 Expert Details */}
                                        <p className="mb-2">
                                            <strong>Submitted by:</strong>{" "}
                                            {workRequest.acceptedBid.userId ? (
                                                <Link
                                                    href={`/profile/${workRequest.acceptedBid.userId}`}
                                                    className={clsx(
                                                        "font-medium hover:underline",
                                                        theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                                                    )}
                                                >
                                                    {workRequest.acceptedBid.user?.name || "Unnamed Expert"}
                                                </Link>
                                            ) : (
                                                <span className={clsx(
                                                    "text-gray-800 dark:text-gray-200 font-medium",
                                                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                                                )}>
                                                    {workRequest.acceptedBid.user?.name || "Unnamed Expert"}
                                                </span>
                                            )}
                                            {" "}
                                            <span className="text-gray-500 text-xs">({workRequest.acceptedBid.user?.email})</span>
                                        </p>

                                        <p className="mb-2">
                                            <strong>Message:</strong>{" "}
                                            <span className="italic text-gray-800 dark:text-gray-300">
                                                {workRequest.acceptedBid.submission?.message}
                                            </span>
                                        </p>                                        

                                        {/* Submission file display */}
                                        {workRequest.acceptedBid?.submission?.fileURL && (                                            
                                            <div className="flex items-center gap-2">
                                                {getFileIcon(workRequest.acceptedBid.submission.fileURL)}

                                                {loadingFileUrl ? (
                                                    <span className="text-gray-500 text-xs">Loading attachment...</span>
                                                ) : signedFileUrl ? (
                                                    <>
                                                    <a
                                                        href={`/api/serve-file?filePath=${encodeURIComponent(
                                                        // submission.fileURL
                                                        submissionFileUrl
                                                        )}&bucket=submissions`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline text-xs"
                                                    >
                                                        {/* {submissionFileUrl || "📎 View Attachment"} */}
                                                        View Attachment
                                                    </a>
                                                    |
                                                    <a
                                                        href={`/api/serve-file?filePath=${encodeURIComponent(
                                                        // submission.fileURL
                                                        submissionFileUrl
                                                        )}&bucket=submissions&download=true`}
                                                        download={submissionFileUrl}
                                                        className="text-blue-600 underline text-xs hover:text-blue-500"
                                                    >
                                                        Download Attachment
                                                    </a>
                                                    </>
                                                ) : (
                                                    <span className="text-red-500 text-xs">File unavailable</span>
                                                )}
                                            </div>
                                        )}

                                        {workRequest.acceptedBid.submission?.submittedAt && (
                                            <p className="text-xs text-gray-500">
                                                Submitted on {new Date(workRequest.acceptedBid.submission.submittedAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Conversation */}
                            {workRequest.acceptedBid?.submission && (
                                <div className="mt-6 border-t pt-4">
                                    <h3 className="font-semibold mb-2">💬 Conversation</h3>

                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                        {isClient && messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={clsx(
                                                    `p-3 rounded-lg`,
                                                    msg.senderId === currentUser.id
                                                        ? "bg-blue-100 dark:bg-blue-900 text-right ml-auto max-w-[80%]"
                                                        : "bg-gray-100 dark:bg-gray-800 text-left mr-auto max-w-[80%]"
                                                )}
                                            >
                                                <p className="text-xs font-bold mb-1">
                                                    {msg.senderId ? ( // Check if senderId exists for the link
                                                        <Link
                                                            href={`/profile/${msg.senderId}`}
                                                            className={clsx(
                                                                "font-medium hover:underline",
                                                                theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                                                            )}
                                                        >
                                                            {msg.sender?.name || "Unknown"}
                                                        </Link>
                                                    ) : (
                                                        <span>{msg.sender?.name || "Unknown"}</span>
                                                    )}
                                                    {' '} ({msg.senderRole})
                                                </p>
                                                <p className="text-sm">{msg.content}</p>
                                                
                                                {msg.fileURL && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getFileIcon(msg.fileName)}

                                                        {loadingFileUrl ? (
                                                            <span className="text-gray-500 text-xs">
                                                            Loading attachment...
                                                            </span>
                                                        ) : signedFileUrl ? (
                                                            <>
                                                                <a
                                                                    href={`/api/serve-file?filePath=${encodeURIComponent(
                                                                    msg.fileURL
                                                                    )}&bucket=submission_messages`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-blue-600 underline"
                                                                >
                                                                    View Attachment
                                                                </a>
                                                                |
                                                                <a
                                                                    href={`/api/serve-file?filePath=${encodeURIComponent(
                                                                    msg.fileURL
                                                                    )}&bucket=submission_messages&download=true`}
                                                                    download={msg.fileName}
                                                                    className="text-xs text-blue-600 underline hover:text-blue-500"
                                                                >
                                                                    Download Attachment
                                                                </a>
                                                            </>
                                                        ) : (
                                                            <span className="text-red-500 text-xs">
                                                                File unavailable
                                                            </span>
                                                        )}
                                                    </div>
                                                )}                                                    

                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {new Date(msg.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2">
                                        <textarea
                                            placeholder="Type your message..."
                                            rows={2}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="w-full p-2 border rounded text-sm bg-inherit dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                                        />

                                        <input
                                            type="file"
                                            onChange={(e) => setNewFile(e.target.files[0])}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            className={clsx(
                                                "w-full text-xs cursor-pointer",
                                                theme === "dark" ? "text-gray-300 file:bg-gray-700 file:text-gray-200" : "text-gray-700 file:bg-gray-200 file:text-gray-800"
                                            )}
                                        />

                                        <button
                                            disabled={sending}
                                            onClick={handleSendMessage} // Use the new dedicated handler
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                                        >
                                            {sending ? "Sending..." : "Send"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ✅ Mark as Completed Button */}
                            {workRequest.status === "IN_PROGRESS" && (
                                <button
                                    onClick={handleCompleteWork}
                                    className={clsx(
                                        `px-3 py-1 text-xs font-medium rounded-md`,
                                        theme === "dark"
                                            ? "bg-green-700 hover:bg-green-600 text-white"
                                            : "bg-green-600 hover:bg-green-500 text-white"
                                    )}
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
                                        className={clsx(
                                            `px-3 py-1 text-xs font-medium rounded-md`,
                                            theme === "dark"
                                                ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                                                : "bg-yellow-300 hover:bg-yellow-400 text-black"
                                        )}
                                    >
                                        🔁 Reopen Work
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Expert Bidding - BidForm handles this */}
                    {isExpert && (
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