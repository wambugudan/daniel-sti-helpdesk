// Description: A modal component for displaying contract details and allowing the user to submit work or cancel the contract.
// File: src/app/components/ContractModal.jsx

'use client';

import { useTheme } from "@/context/ThemeProvider";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import clsx from "clsx";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";
import { useSignedUrl } from "@/hooks/useSignedUrl";


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


const refreshNotifications = async (userId) => { // Accept userId as a parameter
  try {
    await fetch('/api/notifications/refresh', {
      method: 'POST', // Assuming it's a POST request as per your logs
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId, // Pass the userId in the header
      },
      // You might need to send a body if your refresh endpoint expects one,
      // but based on your route.js, it primarily checks the header.
      body: JSON.stringify({}) // Send an empty JSON object if no body is needed
    });
    toast.success('Notifications refreshed!');
  } catch (error) {
    console.error("Failed to refresh notifications:", error);
    toast.error('Failed to refresh notifications.');
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
  // const [submitted, setSubmitted] = useState(!!contract?.acceptedBid?.Submission?.Message || !!contract?.acceptedBid?.Submission?.FileURL);
  const [submitted, setSubmitted] = useState(
    !!contract?.acceptedBid?.submission?.message || !!contract?.acceptedBid?.submission?.fileURL
  );
  
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [contractData, setContractData] = useState(contract); // <== Replace all "contract" references with "contractData"

  // New state variable to hold the signed URL for the work request file
  // const [workRequestFileUrl, setWorkRequestFileUrl] = useState(null);

  const modalRef = useRef(null);
  const [modalSize, setModalSize] = useState({ width: 0, height: 0 });

  // State for message and file upload
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const isOwner = currentUser?.id === contract?.acceptedBid?.userId;
  // const hasSubmission = !!contract?.acceptedBid?.Submission?.Message || !!contract?.acceptedBid?.Submission?.FileURL;
  const hasSubmission = !!contract?.acceptedBid?.submission?.Message || !!contract?.acceptedBid?.Submission?.FileURL;
  
  const [replyDrafts, setReplyDrafts] = useState({});


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);


  const submission = contract.acceptedBid?.submission;
  const [localSubmission, setLocalSubmission] = useState({
    message: submission?.message || "",
    fileURL: submission?.fileURL || "",
    fileName: submission?.fileName || null,
  });

  
  const calculateWorkRequestDuration = (workRequest) => {
    // Check for existence of workRequest and its properties
    if (!workRequest || !workRequest.deadline || !workRequest.createdAt) return "N/A";
    
    const start = new Date(workRequest.createdAt);
    const end = new Date(workRequest.deadline);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  // const fetchWorkRequestFileUrl = async () => {
  //   const filePath = contractData.workRequest?.fileName;
  //   if (!filePath) {
  //     setWorkRequestFileUrl(null);
  //     return;
  //   }
  //   try {
  //     const response = await fetch('/api/get-signed-url', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         filePath: filePath,
  //         bucketName: 'jobs',
  //       }),
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       setWorkRequestFileUrl(data.signedUrl);
  //     } else {
  //       console.error('Failed to get signed URL for work request file:', data.error);
  //       setWorkRequestFileUrl(null);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching work request signed URL:', error);
  //     setWorkRequestFileUrl(null);
  //   }
  // };

  // useEffect(() => {
  //   fetchWorkRequestFileUrl();
  // }, [contractData]);
  
  const { signedFileUrl: workRequestFileUrl, loadingFileUrl } = useSignedUrl(
    contractData?.workRequest?.fileURL, "jobs"
  );


  const handleSubmit = async () => {
    if (!submissionMessage && !file) {
      toast.error("Please provide a message or upload a file.");
      return;
    }
  
    try {
      setSubmitting(true);

      console.log("🧠 Submitting with:", {
        userId: currentUser.id,
        workRequestId: contractData.acceptedBid?.workRequestId || contractData.id,
        message: submissionMessage,
      });
  
      const formData = new FormData();
      formData.append("userId", currentUser.id);   
      
      formData.append("workRequestId", contractData.acceptedBid?.workRequestId || contractData.id);
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
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
  
          toast.success("Work submitted successfully!");
          refreshNotifications(); // Refresh notifications after submission
  
          // ⬇️ Set submission preview info
          setLocalSubmission({
            message: submissionMessage,
            fileURL: response.submission?.FileURL,
            fileName: response.submission.fileName || "Uploaded File",
          });
  
          // ⬇️ Reset form state and toggle display
          // setSubmissionComplete(true);
          setSubmitted(true);
          setEditingSubmission(false);
          setSubmissionMessage("");
          setFile(null);
          setUploadProgress(0);
        } else {
          console.error("Unexpected status code:", xhr.status, xhr.responseText);
          toast.error("Something went wrong submitting your work.");
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


  const fetchContractDetails = async () => {
    try {
      const res = await fetch(`/api/contract/${contract.id}`, {
        headers: { 'x-user-id': currentUser.id },
      });

      console.log("🟢 Full contractData from API:", updated);
      console.log("🟢 Current contractData:", contractData);

      if (!res.ok) throw new Error("Failed to fetch contract details");

      const updated = await res.json();

      // Ensure the fetched data has all necessary parts
      if (!updated.workRequest?.user || !updated.workRequest?.budget) {
        console.warn("⚠️ Missing workRequest.user or budget in fetched contract data");
      }

      setContractData(updated); // ⬅️ this replaces the original "full" contractData

      setLocalSubmission({
        message: updated.acceptedBid?.submission?.message || "",
        fileURL: updated.acceptedBid?.submission?.fileURL || "",
        fileName: updated.acceptedBid?.submission?.fileName || null,
      });
    } catch (error) {
      console.error("Failed to refresh contract:", error);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (feedbackId) => {
    const message = replyDrafts[feedbackId];
    if (!message?.trim()) return toast.error("Reply cannot be empty.");
  
    try {
      const res = await fetch("/api/submission/feedback/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId, replyMessage: message.trim() }),
      });
  
      if (!res.ok) throw new Error("Reply failed");
  
      toast.success("Reply sent!");
      setReplyDrafts((prev) => ({ ...prev, [feedbackId]: "" }));
  
      // 🔁 Refetch contract data here
      await fetchContractDetails();
  
    } catch (err) {
      console.error("Reply Error:", err);
      toast.error("Failed to send reply");
    }
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

  // Fetch messages for the contract
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/submission/message/${contract.acceptedBid?.submission?.id}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data.messages);
      setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  useEffect(() => {
    if (contract.acceptedBid?.submission?.id) {
      fetchMessages();
    }
  }, [contract.acceptedBid?.submission?.id]);
  
  // const sendMessage = async () => {

  //   if (!newMessage.trim() && !newFile) return toast.error("Cannot send empty message");

  //     setSending(true);
  //     try {
  //       const formData = new FormData();
  //       formData.append("submissionId", contract.acceptedBid?.submission?.id);
  //       formData.append("senderId", currentUser.id);
  //       formData.append("senderRole", currentUser.role);
  //       formData.append("content", newMessage.trim());
  //       if (newFile) formData.append("file", newFile);

  //       const res = await fetch("/api/submission/message/send", {
  //         method: "POST",
  //         body: formData,
  //       });

  //       console.log([...formData.entries()])

  //       if (!res.ok) throw new Error("Failed to send message");


  //       toast.success("Message sent!");
  //       setNewMessage("");
  //       setNewFile(null);

  //       await fetchMessages(); // Refresh chat

  //     } catch (error) {
  //       console.error(error);
  //       toast.error("Failed to send");
  //     } finally {
  //       setSending(false);
  //     }
  // }

  // Handle contract cancellation
  
  const sendMessage = async () => {
    if (newMessage.trim() === '' && !newFile) {
      toast.error("Please enter a message or select a file.");
      return;
    }

    setSending(true);

    let fileURL = null;
    let fileName = null;

    try {
      // Step 1: Upload the file if one is selected
      if (newFile) {
        const formData = new FormData();
        formData.append("file", newFile);
        // Specify the 'submissions' bucket
        formData.append("bucket", "submissions");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("File upload failed.");
        }
        
        const uploadData = await uploadResponse.json();
        fileURL = uploadData.fileURL;
        fileName = uploadData.fileName;
      }

      // Step 2: Save the message and file URL to the database
      const messageResponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          senderId: currentUser.id,
          submissionId: contract.submissionId,
          fileURL, // Add the file URL to the message payload
          fileName, // Add the filename to the message payload
        }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to send message.");
      }

      toast.success("Message sent successfully!");
      setNewMessage("");
      setNewFile(null);

      // Refresh data in the UI
      refreshNotifications(currentUser.id);
      fetchMessages();

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message: " + error.message);
    } finally {
      setSending(false);
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

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-lg relative ${
            theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
          initial={{ scale: 0.95, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 30 }}
          transition={{ duration: 0.2 }}
          ref={modalRef}
          style={{ maxHeight: "90vh", overflowY: "auto" }} // Ensure modal is scrollable
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
          {/* <h2 className="text-xl font-bold mb-1">{contract.title}</h2> */}
          <h2 className="text-xl font-bold mb-1">{contractData?.workRequest?.title || contractData.title}</h2>
          {/* <p className="text-sm mb-4"><strong>Category:</strong> {contract.category}</p> */}
          <p className="text-sm mb-4"><strong>Category:</strong> {contractData.workRequest?.category || contractData.category}</p>

          {/* Details */}
          <div className="space-y-1 text-sm mb-4">
            {/* <p><strong>Client:</strong> {contract.user?.name}</p> */}
            <p><strong>Client:</strong> {contractData.workRequest?.user?.name || contractData.user?.name }</p>
            {/* <p><strong>Budget:</strong> ${contract.budget}</p> */}
            <p><strong>Budget:</strong> ${contractData.workRequest?.budget || contractData.budget}</p>
            <p><strong>Duration:</strong> {calculateWorkRequestDuration(contract.workRequest)}</p>
            <p><strong>Status:</strong> {contractData.workRequest?.status || contractData.status}</p>
            {console.log("🟢 ContractData:", contractData)}

          </div>

          <hr className="my-3" />          

          <div className="mb-4 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-base">📝 Contract Details</h3>
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="text-xs text-blue-500 underline"
              >
                {isDetailsExpanded ? "Collapse" : "Expand"}
              </button>
            </div>

            {isDetailsExpanded && (
              <div className="space-y-4 transition-all duration-300">
                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-1">📄 Work Description</h4>
                  <p className="whitespace-pre-line text-sm">
                    {/* {contract.description} */}
                    {/* {contractData?.workRequest?.description || contractData?.description || "No description provided."} */}
                    {contractData.workRequest?.description || contractData.description || "No description provided."}
                  </p>
                </div>

                {/* Attachment */}
                {(contractData.workRequest?.fileURL) && (
                  // <div className="flex items-center gap-2">
                  //   {/* {getFileIcon(contract.fileURL)} */}
                  //   {getFileIcon(contractData.workRequest?.fileURL)}
                  //   <a
                  //     // href={contract.fileURL}
                  //     href={contractData.workRequest?.fileURL}
                  //     target="_blank"
                  //     rel="noopener noreferrer"
                  //     className="text-blue-600 underline"
                  //   >
                  //     {/* {contract.fileName || "View File"} */}
                  //     {contractData.workRequest?.fileName || "View File"}
                  //   </a>
                  // </div>
                  <div className="flex items-center gap-2">
                    {getFileIcon(contractData.workRequest?.fileURL)}
                    {loadingFileUrl ? (
                      <span className="text-gray-500 text-sm">Loading file...</span>
                    ) : workRequestFileUrl ? (
                      <a
                        href={workRequestFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {contractData.workRequest?.fileName || "View File"}
                      </a>
                    ) : (
                      <span className="text-red-500 text-sm">File unavailable</span>
                    )}
                  </div>
                )}

                {/* Accepted Bid */}
                <div>
                  <h4 className="font-semibold mb-1">🎯 Your Accepted Bid</h4>
                  <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                    ${contract.acceptedBid?.amount}
                  </p>
                  <p className="italic text-sm">
                    {contract.acceptedBid?.message || "No message provided."}
                  </p>
                </div>
              </div>
            )}
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

          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">💬 Conversation</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.senderId === currentUser.id
                      ? "bg-blue-100 dark:bg-blue-900 text-right ml-auto max-w-[80%]"
                      : "bg-gray-100 dark:bg-gray-800 text-left mr-auto max-w-[80%]"
                  }`}
                >
                  <p className="text-xs font-bold mb-1">{msg.sender.name} ({msg.senderRole})</p>
                  <p className="text-sm">{msg.content}</p>
                  {msg.fileURL && (
                    <a href={msg.fileURL} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                      📎 Attachment
                    </a>
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
                className="w-full p-2 border rounded text-sm"
              />

              <input
                type="file"
                onChange={(e) => setNewFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full text-xs"
              />

              <button
                disabled={sending}
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>  

          </div>
    



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

// ==================================================

// "use client";

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X } from "lucide-react";
// import { useModal } from "@/context/ModalContext";
// import {useSignedUrl} from "@/hooks/useSignedUrl";

// export default function ContractModal() {
//   const { modalContract, closeModal } = useModal();
//   const [contract, setContract] = useState(null);

//   // 🔹 Signed URL for work request file
//   const workFileUrl = useSignedUrl(contract?.workRequest?.fileURL);

//   // 🔹 Signed URL for first submission file (latest submission)
//   const submissionFileUrl = useSignedUrl(
//     contract?.submissions?.[0]?.fileURL
//   );

//   useEffect(() => {
//     if (modalContract) {
//       console.log("📄 ModalContract received:", modalContract);
//       setContract(modalContract);
//     }
//   }, [modalContract]);

//   if (!contract) return null;

//   // ✅ Helper for signed URL fallback for message attachments
//   const MessageAttachment = ({ fileURL }) => {
//     const signedUrl = useSignedUrl(fileURL);
//     const finalUrl = signedUrl || fileURL;

//     useEffect(() => {
//       console.log("📎 Resolving message attachment URL:", {
//         original: fileURL,
//         signed: signedUrl,
//       });
//     }, [fileURL, signedUrl]);

//     if (!fileURL) return null;

//     return (
//       <a
//         href={finalUrl}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-500 underline ml-2"
//       >
//         View File
//       </a>
//     );
//   };

//   return (
//     <AnimatePresence>
//       {contract && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//           >
//             {/* Close Button */}
//             <button
//               onClick={closeModal}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <X size={24} />
//             </button>

//             {/* Contract Title */}
//             <h2 className="text-2xl font-bold mb-4">
//               {contract.workRequest?.title}
//             </h2>

//             {/* Basic Info */}
//             <div className="mb-4 text-sm text-gray-700 space-y-1">
//               <p>
//                 <span className="font-semibold">Category:</span>{" "}
//                 {contract.workRequest?.category}
//               </p>
//               <p>
//                 <span className="font-semibold">Council:</span>{" "}
//                 {contract.council?.name}
//               </p>
//               <p>
//                 <span className="font-semibold">Expert:</span>{" "}
//                 {contract.expert?.name}
//               </p>
//               <p>
//                 <span className="font-semibold">Budget:</span> $
//                 {contract.workRequest?.budget}
//               </p>
//               <p>
//                 <span className="font-semibold">Duration:</span>{" "}
//                 {contract.workRequest?.duration} days
//               </p>
//               <p>
//                 <span className="font-semibold">Status:</span>{" "}
//                 {contract.status}
//               </p>
//             </div>

//             {/* Work Request File */}
//             {contract.workRequest?.fileURL && (
//               <div className="mb-4">
//                 <p className="font-semibold">Work Request File:</p>
//                 <a
//                   href={workFileUrl || contract.workRequest.fileURL}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-500 underline"
//                 >
//                   View File
//                 </a>
//               </div>
//             )}

//             {/* Submission File */}
//             {contract.submissions?.length > 0 && (
//               <div className="mb-4">
//                 <p className="font-semibold">Latest Submission:</p>
//                 <a
//                   href={submissionFileUrl || contract.submissions[0].fileURL}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-500 underline"
//                 >
//                   View File
//                 </a>
//               </div>
//             )}

//             {/* Messages */}
//             {contract.messages?.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="text-lg font-semibold mb-2">Messages</h3>
//                 <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
//                   {contract.messages.map((msg) => (
//                     <div
//                       key={msg.id}
//                       className="p-2 border-b last:border-b-0 text-sm"
//                     >
//                       <p className="font-semibold">{msg.sender?.name}:</p>
//                       <p>{msg.content}</p>
//                       {msg.fileURL && (
//                         <MessageAttachment fileURL={msg.fileURL} />
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// =====================================================







// Description: A modal component for displaying contract details and allowing the user to submit work or cancel the contract.

// 'use client';

// import { useTheme } from "@/context/ThemeProvider";
// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import toast from "react-hot-toast";
// import clsx from "clsx";
// import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";

// import { useSignedUrl } from "@/hooks/useSignedUrl"; // ✅ NEW

// const ContractModal = ({ isOpen, onClose, contractData, onSubmitWork, onCancelContract }) => {
//   const { theme } = useTheme();
//   const modalRef = useRef();

//   // State for work submission
//   const [workDescription, setWorkDescription] = useState("");
//   const [workFile, setWorkFile] = useState(null);

//   // Hook for fetching signed URL for work request file
//   const { signedFileUrl: workRequestFileUrl, loadingFileUrl: loadingWorkRequestFile } =
//     useSignedUrl(contractData?.workRequest?.fileURL, "jobs");

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setWorkDescription("");
//       setWorkFile(null);
//     }
//   }, [isOpen]);

//   // Close modal if click outside content
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (modalRef.current && !modalRef.current.contains(e.target)) {
//         onClose();
//       }
//     };
//     if (isOpen) document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isOpen, onClose]);

//   const handleFileChange = (e) => {
//     setWorkFile(e.target.files[0]);
//   };

//   const handleSubmit = async () => {
//     if (!workDescription) {
//       toast.error("Please provide a description of your work.");
//       return;
//     }
//     onSubmitWork(workDescription, workFile);
//     onClose();
//   };

//   const getFileIcon = (fileName) => {
//     if (!fileName) return <FaFileAlt className="text-gray-500" />;
//     const ext = fileName.split(".").pop().toLowerCase();
//     if (ext === "pdf") return <FaFilePdf className="text-red-500" />;
//     if (ext === "doc" || ext === "docx") return <FaFileWord className="text-blue-500" />;
//     if (["png", "jpg", "jpeg", "gif"].includes(ext)) return <FaFileImage className="text-green-500" />;
//     return <FaFileAlt className="text-gray-500" />;
//   };

//   if (!isOpen) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <motion.div
//           ref={modalRef}
//           className={clsx(
//             "w-full max-w-2xl p-6 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]",
//             theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
//           )}
//           initial={{ y: "-100vh" }}
//           animate={{ y: 0 }}
//           exit={{ y: "-100vh" }}
//         >
//           <h2 className="text-xl font-semibold mb-4">Contract Details</h2>

//           {/* Work Request Details */}
//           <div className="mb-4">
//             <h3 className="font-semibold text-lg">📌 Work Request</h3>
//             <p><strong>Title:</strong> {contractData.workRequest?.title}</p>
//             <p><strong>Description:</strong> {contractData.workRequest?.description}</p>
//             {contractData.workRequest?.fileURL && (
//               <div className="flex items-center gap-2 mt-2">
//                 {getFileIcon(contractData.workRequest?.fileURL)}
//                 {loadingWorkRequestFile ? (
//                   <span className="text-gray-500">Loading file...</span>
//                 ) : workRequestFileUrl ? (
//                   <a
//                     href={workRequestFileUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 underline"
//                   >
//                     {contractData.workRequest?.fileName || "View File"}
//                   </a>
//                 ) : (
//                   <span className="text-red-500">File unavailable</span>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Bidder Info */}
//           <div className="mb-4">
//             <h3 className="font-semibold text-lg">👤 Bidder</h3>
//             <p><strong>Name:</strong> {contractData.bid?.bidder?.name}</p>
//             <p><strong>Email:</strong> {contractData.bid?.bidder?.email}</p>
//             <p><strong>Bid Amount:</strong> ${contractData.bid?.bidAmount}</p>
//           </div>

//           {/* Contract Actions */}
//           <div className="mb-4">
//             <h3 className="font-semibold text-lg">⚡ Actions</h3>
//             <textarea
//               placeholder="Describe the work you’ve completed..."
//               className="w-full p-2 border rounded-md mb-2 text-black"
//               value={workDescription}
//               onChange={(e) => setWorkDescription(e.target.value)}
//             />
//             <input
//               type="file"
//               onChange={handleFileChange}
//               className="mb-2"
//             />
//             <div className="flex gap-3">
//               <button
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md"
//                 onClick={handleSubmit}
//               >
//                 Submit Work
//               </button>
//               <button
//                 className="bg-red-600 text-white px-4 py-2 rounded-md"
//                 onClick={onCancelContract}
//               >
//                 Cancel Contract
//               </button>
//               <button
//                 className="bg-gray-500 text-white px-4 py-2 rounded-md"
//                 onClick={onClose}
//               >
//                 Close
//               </button>
//             </div>
//           </div>

//           {/* Submission (if exists) */}
//           {contractData.submission && (
//             <div className="mb-4">
//               <h3 className="font-semibold text-lg">📬 Work Submission</h3>
//               <p><strong>Description:</strong> {contractData.submission.description}</p>
//               {contractData.submission.fileURL && (
//                 <div className="flex items-center gap-2 mt-2">
//                   {getFileIcon(contractData.submission.fileURL)}
//                   <a
//                     href={contractData.submission.fileURL}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 underline"
//                   >
//                     {contractData.submission.fileName || "View Submission"}
//                   </a>
//                 </div>
//               )}
//             </div>
//           )}
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default ContractModal;


// File: src/app/components/ContractModal.jsx
// "use client";

// import { useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function ContractModal({ contract, onClose }) {
//   useEffect(() => {
//     console.log("📦 ContractModal props:", { contract });
//   }, [contract]);

//   if (!contract) return null; // Don’t render if no contract

//   const {
//     id,
//     status,
//     finalAmount,
//     startDate,
//     endDate,
//     workRequest,
//     council,
//     expert,
//   } = contract;

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <motion.div
//           className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]"
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//         >
//           <div className="flex justify-between items-center border-b pb-3 mb-4">
//             <h2 className="text-xl font-bold">Contract Details</h2>
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-800"
//             >
//               ✕
//             </button>
//           </div>

//           <div className="space-y-4">
//             {/* Work Request */}
//             <section>
//               <h3 className="font-semibold text-lg mb-1">
//                 Work Request: {workRequest?.title}
//               </h3>
//               <p className="text-gray-600">{workRequest?.description}</p>
//               <p className="text-sm text-gray-500">
//                 Category: {workRequest?.category}
//               </p>
//             </section>

//             {/* Parties */}
//             <section>
//               <h3 className="font-semibold text-lg">Parties</h3>
//               <p>
//                 <span className="font-medium">Council:</span>{" "}
//                 {council?.name} ({council?.email})
//               </p>
//               <p>
//                 <span className="font-medium">Expert:</span>{" "}
//                 {expert?.name} ({expert?.email})
//               </p>
//             </section>

//             {/* Contract Info */}
//             <section>
//               <h3 className="font-semibold text-lg">Contract Info</h3>
//               <p>
//                 <span className="font-medium">Status:</span> {status}
//               </p>
//               <p>
//                 <span className="font-medium">Amount:</span> ${finalAmount}
//               </p>
//               <p>
//                 <span className="font-medium">Start Date:</span>{" "}
//                 {new Date(startDate).toLocaleDateString()}
//               </p>
//               <p>
//                 <span className="font-medium">End Date:</span>{" "}
//                 {new Date(endDate).toLocaleDateString()}
//               </p>
//               <p>
//                 <span className="font-medium">Contract ID:</span> {id}
//               </p>
//             </section>
//           </div>

//           <div className="mt-6 flex justify-end gap-3">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
//             >
//               Close
//             </button>
//             <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
//               Submit Work
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

