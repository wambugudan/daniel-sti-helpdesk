// // File: src/app/components/ContractModal.jsx
// // Description: A modal component for displaying contract details and allowing the user to cancel the contract.
// 'use client';

// import { useTheme } from "@/context/ThemeProvider";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import toast from "react-hot-toast";
// import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";

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

// const ContractModal = ({ contract, currentUser, onClose, onCancelled }) => {
//   const { theme } = useTheme();
//   const [loading, setLoading] = useState(false);
//   const [submissionMessage, setSubmissionMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [submitting, setSubmitting] = useState(false);


//   const handleSubmit = async () => {
//     if (!submissionMessage && !file) {
//       toast.error("Please provide a message or upload a file.");
//       return;
//     }
  
//     try {
//       setSubmitting(true);
//       const formData = new FormData();
//       formData.append("userId", currentUser.id);
//       formData.append("workRequestId", contract.id);
//       formData.append("message", submissionMessage);
//       if (file) formData.append("file", file);
  
//       const res = await fetch("/api/contract/submit", {
//         method: "POST",
//         body: formData,
//       });
  
//       if (!res.ok) throw new Error("Submission failed");
  
//       toast.success("Work submitted successfully!");
//       setSubmissionMessage("");
//       setFile(null);
//     } catch (error) {
//       toast.error("Failed to submit work");
//       console.error("Submission error:", error);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCancelContract = async () => {
//     const confirmed = confirm("Are you sure you want to cancel this contract?");
//     if (!confirmed) return;

//     try {
//       setLoading(true);
//       const res = await fetch(`/api/contract/cancel`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ workRequestId: contract.id, userId: currentUser.id }),
//       });

//       if (!res.ok) throw new Error("Failed to cancel contract");

//       toast.success("Contract cancelled successfully");
//       if (onCancelled) onCancelled(contract.id);
//       onClose();
//     } catch (error) {
//       toast.error("Error cancelling contract");
//       console.error("Cancel contract error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const duration =
//     contract.deadline && contract.createdAt
//       ? Math.ceil((new Date(contract.deadline) - new Date(contract.createdAt)) / (1000 * 60 * 60 * 24))
//       : "N/A";

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <motion.div
//           className={`w-full max-w-xl rounded-lg p-6 shadow-lg relative ${
//             theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
//           }`}
//           initial={{ scale: 0.9, y: 40 }}
//           animate={{ scale: 1, y: 0 }}
//           exit={{ scale: 0.9, y: 40 }}
//           transition={{ duration: 0.2 }}
//         >
//           {/* Close Button */}
//           <button
//             className={`absolute top-3 right-4 text-lg font-bold ${
//               theme === "dark" ? "text-gray-300" : "text-gray-700"
//             }`}
//             onClick={onClose}
//             aria-label="Close"
//           >
//             ×
//           </button>

//           {/* Title and Category */}
//           <h2 className="text-xl font-bold mb-1">{contract.title}</h2>
//           <p className="text-sm mb-4">
//             <strong>Category:</strong> {contract.category}
//           </p>

//           {/* Basic Info */}
//           <div className="mb-3 space-y-1 text-sm">
//             <p><strong>Client:</strong> {contract.user?.name || "N/A"}</p>
//             <p><strong>Budget:</strong> ${contract.budget}</p>
//             <p><strong>Duration:</strong> {duration} days</p>
//             <p><strong>Status:</strong> <span className="uppercase">{contract.status}</span></p>
//           </div>

//           {/* Work Description */}
//           <hr className="my-4" />
//           <div className="mb-4 text-sm whitespace-pre-line">
//             <h3 className="font-semibold mb-2">📄 Work Description</h3>
//             <p>{contract.description}</p>
//           </div>

//           {/* File Attachment */}
//           {contract.fileURL && (
//             <div className="flex items-center gap-2 mb-4">
//               {getFileIcon(contract.fileURL)}
//               <a
//                 href={contract.fileURL}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 underline"
//               >
//                 View Attachment
//               </a>
//             </div>
//           )}

//           {/* Accepted Bid Info */}
//           <div className="mb-4">
//             <h3 className="font-semibold mb-2">🎯 Your Accepted Bid</h3>
//             <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
//               ${contract.acceptedBid?.amount}
//             </p>
//             <p className="text-sm italic mt-2">
//               {contract.acceptedBid?.message || "No message provided."}
//             </p>
//           </div>

//           {/* Expert Submission (Only for IN_PROGRESS + current expert) */}
//           {contract.status === "IN_PROGRESS" && currentUser?.id === contract.acceptedBid?.userId && (
//             <div className="mt-6 border-t pt-4">
//               <h3 className="font-semibold mb-2">📬 Submit Your Work</h3>
              
//               <textarea
//                 placeholder="Enter a brief message about your submission"
//                 rows={3}
//                 className="w-full p-2 border rounded mb-3 text-sm"
//                 value={submissionMessage}
//                 onChange={(e) => setSubmissionMessage(e.target.value)}
//               />

//               <input
//                 type="file"
//                 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                 className="mb-3"
//                 onChange={(e) => setFile(e.target.files[0])}
//               />

//               <button
//                 disabled={submitting}
//                 onClick={handleSubmit}
//                 className={`px-4 py-2 rounded text-sm font-semibold ${
//                   theme === "dark"
//                     ? "bg-teal-600 text-white hover:bg-teal-500"
//                     : "bg-teal-500 text-white hover:bg-teal-400"
//                 }`}
//               >
//                 {submitting ? "Submitting..." : "Submit Work"}
//               </button>
//             </div>
//           )}


//           {/* Actions */}
//           <div className="mt-6 flex justify-end">
//             <button
//               disabled={loading}
//               onClick={handleCancelContract}
//               className={`px-4 py-1 text-sm font-semibold rounded-md ${
//                 theme === "dark"
//                   ? "bg-red-600 text-white hover:bg-red-500"
//                   : "bg-red-500 text-white hover:bg-red-400"
//               }`}
//             >
//               Cancel Contract
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default ContractModal;



// // File: src/app/components/ContractModal.jsx
// 'use client';

// import { useTheme } from "@/context/ThemeProvider";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import toast from "react-hot-toast";
// import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";

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

// const ContractModal = ({ contract, currentUser, onClose, onCancelled }) => {
//   const { theme } = useTheme();
//   const [loading, setLoading] = useState(false);
//   const [submissionMessage, setSubmissionMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [submissionComplete, setSubmissionComplete] = useState(false);
//   const [markingDone, setMarkingDone] = useState(false);
//   const [submitted, setSubmitted] = useState(!!contract.acceptedBid?.submissionMessage || !!contract.acceptedBid?.submissionFileURL);
//   const [editingSubmission, setEditingSubmission] = useState(false);

//   const duration =
//     contract.deadline && contract.createdAt
//       ? Math.ceil((new Date(contract.deadline) - new Date(contract.createdAt)) / (1000 * 60 * 60 * 24))
//       : "N/A";

//   const handleSubmit = async () => {
//     if (!submissionMessage && !file) {
//       toast.error("Please provide a message or upload a file.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const formData = new FormData();
//       formData.append("userId", currentUser.id);
//       formData.append("workRequestId", contract.id);
//       formData.append("message", submissionMessage);
//       if (file) formData.append("file", file);

//       const xhr = new XMLHttpRequest();
//       xhr.open("POST", "/api/contract/submit", true);
//       xhr.upload.onprogress = (e) => {
//         if (e.lengthComputable) {
//           const percent = Math.round((e.loaded / e.total) * 100);
//           setUploadProgress(percent);
//         }
//       };
//       xhr.onload = () => {
//         if (xhr.status === 200) {
//           toast.success("Work submitted successfully!");
//           setSubmissionComplete(true);
//           // toast.success("Work submitted successfully!");
//           setSubmitted(true);
//           setEditingSubmission(false);

//         } else {
//           toast.error("Failed to submit work");
//         }
//         setSubmitting(false);
//       };
//       xhr.onerror = () => {
//         toast.error("Network error during submission");
//         setSubmitting(false);
//       };
//       xhr.send(formData);
//     } catch (error) {
//       toast.error("Error submitting work");
//       setSubmitting(false);
//     }
//   };

//   const handleMarkAsDone = async () => {
//     try {
//       setMarkingDone(true);
//       const res = await fetch("/api/work-request/complete", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           workRequestId: contract.id,
//           userId: currentUser.id,
//         }),
//       });
//       if (!res.ok) throw new Error("Failed to mark as completed");
//       toast.success("Marked as completed!");
//       onClose(); // Optionally close modal
//     } catch (error) {
//       toast.error("Error marking as done");
//     } finally {
//       setMarkingDone(false);
//     }
//   };

//   const handleCancelContract = async () => {
//     if (!confirm("Are you sure you want to cancel this contract?")) return;
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/contract/cancel`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ workRequestId: contract.id, userId: currentUser.id }),
//       });
//       if (!res.ok) throw new Error("Failed to cancel contract");
//       toast.success("Contract cancelled");
//       if (onCancelled) onCancelled(contract.id);
//       onClose();
//     } catch (err) {
//       toast.error("Error cancelling contract");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <motion.div
//           className={`w-full max-w-xl rounded-lg p-6 shadow-lg relative ${
//             theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
//           }`}
//           initial={{ scale: 0.9, y: 40 }}
//           animate={{ scale: 1, y: 0 }}
//           exit={{ scale: 0.9, y: 40 }}
//         >
//           {/* <button
//             onClick={onClose}
//             className={`absolute top-3 right-4 text-lg font-bold ${
//               theme === "dark" ? "text-gray-300" : "text-gray-700"
//             }`}
//           >
//             ×
//           </button>

//           <h2 className="text-xl font-bold">{contract.title}</h2>
//           <p className="text-sm mb-2"><strong>Category:</strong> {contract.category}</p>

//           <div className="text-sm space-y-1 mb-4">
//             <p><strong>Client:</strong> {contract.user?.name}</p>
//             <p><strong>Budget:</strong> ${contract.budget}</p>
//             <p><strong>Duration:</strong> {duration} days</p>
//             <p><strong>Status:</strong> {contract.status}</p>
//           </div>

//           <hr className="my-3" />

//           <div className="mb-4">
//             <h3 className="font-semibold mb-1">Your Bid</h3>
//             <p className="text-green-600 dark:text-green-400 font-semibold text-lg">${contract.acceptedBid?.amount}</p>
//             <p className="italic text-sm mt-1">{contract.acceptedBid?.message || "No message provided."}</p>
//           </div> */}

//           {/* Close Button */}
//            <button
//              className={`absolute top-3 right-4 text-lg font-bold ${
//                theme === "dark" ? "text-gray-300" : "text-gray-700"
//              }`}
//              onClick={onClose}
//              aria-label="Close"
//            >
//              ×
//            </button>

//            {/* Title and Category */}
//            <h2 className="text-xl font-bold mb-1">{contract.title}</h2>
//            <p className="text-sm mb-4">
//              <strong>Category:</strong> {contract.category}
//            </p>

//            {/* Basic Info */}
//            <div className="mb-3 space-y-1 text-sm">
//              <p><strong>Client:</strong> {contract.user?.name || "N/A"}</p>
//              <p><strong>Budget:</strong> ${contract.budget}</p>
//              <p><strong>Duration:</strong> {duration} days</p>
//              <p><strong>Status:</strong> <span className="uppercase">{contract.status}</span></p>
//            </div>

//            {/* Work Description */}
//            <hr className="my-4" />
//            <div className="mb-4 text-sm whitespace-pre-line">
//              <h3 className="font-semibold mb-2">📄 Work Description</h3>
//              <p>{contract.description}</p>
//            </div>

//            {/* File Attachment */}
//            {contract.fileURL && (
//              <div className="flex items-center gap-2 mb-4">
//                {getFileIcon(contract.fileURL)}
//                <a
//                  href={contract.fileURL}
//                  target="_blank"
//                  rel="noopener noreferrer"
//                  className="text-blue-600 underline"
//                >
//                  View Attachment
//               </a>
//              </div>
//            )}

//            {/* Accepted Bid Info */}
//            <div className="mb-4">
//              <h3 className="font-semibold mb-2">🎯 Your Accepted Bid</h3>
//              <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
//                ${contract.acceptedBid?.amount}
//              </p>
//              <p className="text-sm italic mt-2">
//                {contract.acceptedBid?.message || "No message provided."}
//              </p>
//            </div>


//           {/* {contract.status === "IN_PROGRESS" && currentUser?.id === contract.acceptedBid?.userId && (
//             <div className="mt-5 border-t pt-4">
//               <h3 className="font-semibold mb-2">📬 Submit Your Work</h3>

//               <textarea
//                 value={submissionMessage}
//                 onChange={(e) => setSubmissionMessage(e.target.value)}
//                 placeholder="Write a message about your submission..."
//                 rows={3}
//                 className="w-full border rounded px-2 py-1 mb-2 text-sm"
//               />

//               <input
//                 type="file"
//                 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                 onChange={(e) => setFile(e.target.files[0])}
//                 className="mb-2"
//               />

//               {uploadProgress > 0 && uploadProgress < 100 && (
//                 <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
//                   <div
//                     className="bg-blue-500 h-2 rounded-full"
//                     style={{ width: `${uploadProgress}%` }}
//                   />
//                 </div>
//               )}

//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={handleSubmit}
//                   disabled={submitting}
//                   className={`px-4 py-1 text-sm font-semibold rounded ${
//                     theme === "dark"
//                       ? "bg-teal-600 text-white hover:bg-teal-500"
//                       : "bg-teal-500 text-white hover:bg-teal-400"
//                   }`}
//                 >
//                   {submitting ? "Submitting..." : "Submit Work"}
//                 </button>

//                 {submissionComplete && (
//                   <button
//                     onClick={handleMarkAsDone}
//                     disabled={markingDone}
//                     className={`px-4 py-1 text-sm font-semibold rounded ${
//                       theme === "dark"
//                         ? "bg-green-700 text-white hover:bg-green-600"
//                         : "bg-green-600 text-white hover:bg-green-500"
//                     }`}
//                   >
//                     {markingDone ? "Finalizing..." : "✅ Mark as Done"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           )} */}

//           {contract.status === "IN_PROGRESS" && currentUser?.id === contract.acceptedBid?.userId && (
//             <div className="mt-6 border-t pt-4">
//               <h3 className="font-semibold mb-2">📬 Work Submission</h3>

//               {submitted && !editingSubmission ? (
//                 <div className="space-y-2 text-sm">
//                   <p><strong>Message:</strong> {contract.acceptedBid.submissionMessage}</p>
//                   {contract.acceptedBid.submissionFileURL && (
//                     <p>
//                       <strong>File:</strong>{" "}
//                       <a href={contract.acceptedBid.submissionFileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//                         View Submitted File
//                       </a>
//                     </p>
//                   )}
//                   <button
//                     onClick={() => setEditingSubmission(true)}
//                     className="mt-3 px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-400"
//                   >
//                     ✏️ Edit Submission
//                   </button>
//                 </div>
//               ) : (
//                 <>
//                   <textarea
//                     placeholder="Enter a brief message about your submission"
//                     rows={3}
//                     className="w-full p-2 border rounded mb-3 text-sm"
//                     value={submissionMessage}
//                     onChange={(e) => setSubmissionMessage(e.target.value)}
//                   />

//                   <input
//                     type="file"
//                     accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     className="mb-3"
//                     onChange={(e) => setFile(e.target.files[0])}
//                   />

//                   <button
//                     disabled={submitting}
//                     onClick={handleSubmit}
//                     className={`px-4 py-2 rounded text-sm font-semibold ${
//                       theme === "dark"
//                         ? "bg-teal-600 text-white hover:bg-teal-500"
//                         : "bg-teal-500 text-white hover:bg-teal-400"
//                     }`}
//                   >
//                     {submitting ? "Submitting..." : "Submit Work"}
//                   </button>
//                 </>
//               )}
//             </div>
//           )}


//           <div className="mt-6 flex justify-end">
//             <button
//               disabled={loading}
//               onClick={handleCancelContract}
//               className={`px-4 py-1 text-sm font-semibold rounded ${
//                 theme === "dark"
//                   ? "bg-red-600 text-white hover:bg-red-500"
//                   : "bg-red-500 text-white hover:bg-red-400"
//               }`}
//             >
//               Cancel Contract
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default ContractModal;



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

  const isOwner = currentUser?.id === contract?.acceptedBid?.userId;
  const hasSubmission = !!contract?.acceptedBid?.submissionMessage || !!contract?.acceptedBid?.submissionFileURL;

  const [localSubmission, setLocalSubmission] = useState({
    message: contract?.acceptedBid?.submissionMessage || "",
    fileURL: contract?.acceptedBid?.submissionFileURL || ""
  });

  const duration =
    contract.deadline && contract.createdAt
      ? Math.ceil((new Date(contract.deadline) - new Date(contract.createdAt)) / (1000 * 60 * 60 * 24))
      : "N/A";

  const handleSubmit = async () => {
    if (!submissionMessage && !file) {
      toast.error("Please provide a message or file.");
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
          toast.success("Work submitted successfully!");
          setLocalSubmission({
            message: submissionMessage,
            fileURL: file ? URL.createObjectURL(file) : localSubmission.fileURL
          });
          setEditingSubmission(false);
          setSubmissionMessage("");
          setFile(null);
        } else {
          toast.error("Submission failed.");
        }
        setSubmitting(false);
      };
      xhr.onerror = () => {
        toast.error("Network error.");
        setSubmitting(false);
      };
      xhr.send(formData);
    } catch (err) {
      toast.error("Error submitting.");
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
              <a href={contract.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                View Attachment
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
                      <a href={localSubmission.fileURL} target="_blank" className="text-blue-600 underline">
                        View File
                      </a>
                    </p>
                  )}
                  <button
                    onClick={() => setEditingSubmission(true)}
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
