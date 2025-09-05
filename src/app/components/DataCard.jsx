// // File: DataCard.jsx
// // Description: This component is a card that displays information about a work request. 
// 'use client'; // Ensure this is present if you're using client-side hooks like useRouter

// import { useRouter } from "next/navigation";
// import Link from 'next/link'; // Import Link for user profile navigation
// import { useTheme } from "@/context/ThemeProvider";
// import { useState, useEffect } from "react";
// import WorkRequestModal from "./WorkRequestModal"; // Keep if used elsewhere or remove if only in submissions/page.js
// import Badge from "./Badge";
// import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";
// import clsx from "clsx";
// import CardWrapper from "./CardWrapper";
// import toast from 'react-hot-toast'; // Import toast for notifications

// const getFileIcon = (fileURL) => {
//     if (!fileURL) return <FaFileAlt className="text-gray-500 text-2xl" />;

//     const ext = fileURL.split(".").pop().toLowerCase();

//     switch (ext) {
//         case "pdf":
//             return <FaFilePdf className="text-red-500 text-2xl" />;
//         case "doc":
//         case "docx":
//             return <FaFileWord className="text-blue-500 text-2xl" />;
//         case "jpg":
//         case "jpeg":
//         case "png":
//             return <FaFileImage className="text-green-500 text-2xl" />;
//         default:
//             return <FaFileAlt className="text-gray-500 text-2xl" />;
//     }
// };

// // Ensure onView, currentUser, and showStatus props are correctly defined
// const DataCard = ({ workRequest, currentUser, onView, showStatus = false }) => {

//      // A check to prevent errors if workRequest is undefined
//     if (!workRequest) {
//         return null;
//     }

//     const isOwner = currentUser?.id === workRequest.userId;
//     const isCouncil = currentUser?.role === "COUNCIL";
    
//     const { theme } = useTheme();
//     const router = useRouter();

//     // State to hold the signed URL and its loading status
//     const [signedFileUrl, setSignedFileUrl] = useState(null);
//     const [loadingFileUrl, setLoadingFileUrl] = useState(false);

    
//     // Function to fetch the signed URL from your API route
//     const fetchSignedUrl = async () => {
//         setLoadingFileUrl(true);
//         let filePath = '';
//         try {
//             if (typeof workRequest.fileURL === 'string' && workRequest.fileURL !== '') {
//                 let extractedFilename = '';
                
//                 // First, try to extract the filename from a full Supabase URL
//                 if (workRequest.fileURL.includes('/jobs/')) {
//                     const url = new URL(workRequest.fileURL);
//                     const pathSegments = url.pathname.split('/');
//                     extractedFilename = pathSegments[pathSegments.length - 1];
//                 } else if (workRequest.fileURL.startsWith('/uploads/')) {
//                     // Fallback for relative paths
//                     extractedFilename = workRequest.fileURL.split('/').pop();
//                 } else {
//                     console.error("Unknown URL format:", workRequest.fileURL);
//                     setLoadingFileUrl(false);
//                     return;
//                 }

//                 // Decode the filename to ensure it's in its raw, unencoded form
//                 if (extractedFilename) {
//                     filePath = decodeURIComponent(extractedFilename);
//                 }
//             }
            
//             if (!filePath) {
//                 console.error("Failed to extract file path from URL:", workRequest.fileURL);
//                 setLoadingFileUrl(false);
//                 return;
//             }

//             console.log("Extracted and decoded file path (sent to server):", filePath);

//             const response = await fetch('/api/get-signed-url', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ filePath, bucketName: 'jobs' }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || 'Failed to get signed URL');
//             }
            
//             const data = await response.json();
//             setSignedFileUrl(data.signedUrl);
//         } catch (error) {
//             console.error("Error fetching signed URL:", error);
//             toast.error("Failed to load file link: " + error.message);
//         } finally {
//             setLoadingFileUrl(false);
//         }
//     };

//     // Use a useEffect hook to fetch the URL when the component mounts
//     useEffect(() => {
//         if (workRequest.fileURL) {
//             fetchSignedUrl();
//         }
//     }, [workRequest.fileURL]);

    
//     const handleDelete = async (id) => {
//         if (!confirm("Are you sure you want to delete this work request?")) return;
        
//         try {
//             // Fetch the work request to get the correct fileURL
//             const workRequestResponse = await fetch(`/api/work-request/${id}`);
//             if (!workRequestResponse.ok) throw new Error("Failed to fetch work request details.");
//             const workRequest = await workRequestResponse.json();

//             // If a fileURL exists, delete the file from Supabase storage
//             if (workRequest.fileURL) {
//                 let filePath = '';
//                 // Use the same robust logic as fetchSignedUrl to get the filename
//                 if (workRequest.fileURL.includes('/jobs/')) {
//                     const url = new URL(workRequest.fileURL);
//                     const pathSegments = url.pathname.split('/');
//                     filePath = pathSegments[pathSegments.length - 1];
//                 } else if (workRequest.fileURL.startsWith('/uploads/')) {
//                     // This is a relative path, so extract the filename directly
//                     filePath = workRequest.fileURL.split('/').pop();
//                 }

//                 if (filePath) {
//                     // Now, send the extracted file path to the delete-file API
//                     const fileDeleteResponse = await fetch('/api/delete-file', {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({ filePath, bucketName: "jobs" }),
//                     });

//                     if (!fileDeleteResponse.ok) {
//                         console.error("Failed to delete file from Supabase storage.");
//                     } else {
//                         console.log("File deleted successfully from Supabase storage.");
//                     }
//                 }
//             }

//             // Now, delete the work request from the database
//             const response = await fetch(`/api/work-request/${id}`, { method: "DELETE" });
//             if (!response.ok) throw new Error("Failed to delete request");
            
//             toast.success("Work request and associated file deleted!");
//             window.location.reload(); 
            
//         } catch (error) {
//             console.error("Deletion error:", error);
//             toast.error("Failed to delete request and file!");
//         }
//     };

//     const duration =
//         workRequest.deadline && workRequest.createdAt
//             ? Math.ceil((new Date(workRequest.deadline) - new Date(workRequest.createdAt)) / (1000 * 60 * 60 * 24))
//             : null;

//     const getStatusClasses = (status, theme) => {
//         return clsx(
//             "absolute top-3 right-3 z-10 text-xs font-semibold px-3 py-1 rounded-full",
//             {
//                 "bg-teal-100 text-teal-700": status === "OPEN" && theme !== "dark",
//                 "bg-teal-900 text-teal-200": status === "OPEN" && theme === "dark",
//                 "bg-yellow-100 text-yellow-700": status === "IN_PROGRESS" && theme !== "dark",
//                 "bg-yellow-900 text-yellow-200": status === "IN_PROGRESS" && theme === "dark",
//                 "bg-red-100 text-red-700": status === "CLOSED" && theme !== "dark",
//                 "bg-red-900 text-red-200": status === "CLOSED" && theme === "dark",
//             }
//         );
//     };

//     return (
//         <CardWrapper>
//             {/* Status Badge */}
//             {showStatus && workRequest.status && (
//                 <div
//                     className={getStatusClasses(workRequest.status, theme)}
//                 >
//                     {workRequest.status.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
//                 </div>
//             )}

//             {/* Clickable User Name */}
//             <h4 className="text-sm font-semibold">
//                 Submitted by:{' '} {/* Added "Submitted by:" for clarity */}
//                 {/* Ensure workRequest.userId exists before rendering the Link */}
//                 {workRequest.userId ? (
//                     <Link
//                         href={`/profile/${workRequest.userId}`}
//                         className={clsx(
//                             "font-medium hover:underline",
//                             theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
//                         )}
//                     >
//                         {workRequest.user?.name || workRequest.user?.email || 'Unknown User'}
//                     </Link>
//                 ) : (
//                     <span className={clsx(
//                         theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     )}>
//                         {workRequest.user?.name || workRequest.user?.email || 'Unknown User'}
//                     </span>
//                 )}
//             </h4>

//             <h3 className="text-lg font-bold">{workRequest.title}</h3>

//             {(workRequest._count?.bids ?? 0) > 0 && (
//                 <Badge count={workRequest._count.bids || 0} />
//             )}

//             <h3 className="text-sm mt-1">
//                 Budget: <span className="font-medium text-green-400">$ {workRequest.budget}</span>
//             </h3>

//             <h3 className="text-sm mt-1">
//                 Duration: <span className="font-medium text-yellow-500">{duration ?? 'N/A'} days</span>
//             </h3>

//             <p className="text-sm mt-2">
//                 {workRequest.description ? workRequest.description.split(" ").slice(0, 50).join(" ") : "No description available"}...
//             </p>

//             {/* {workRequest.fileURL && (
//                 <div className="flex items-center gap-2 mt-3">
//                     {getFileIcon(workRequest.fileURL)}
//                     <a
//                         href={workRequest.fileURL}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 underline"
//                     >
//                         View File
//                     </a>
//                 </div>
//             )} */}

//             {workRequest.fileURL && (
//                 <div className="flex items-center gap-2 mt-3">
//                     {getFileIcon(workRequest.fileURL)}
//                     {/* Conditional rendering based on loading state and signed URL */}
//                     {loadingFileUrl ? (
//                         <span className="text-gray-500">Loading file...</span>
//                     ) : signedFileUrl ? (
//                         <a
//                             href={signedFileUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-blue-600 underline"
//                         >
//                             View File
//                         </a>
//                     ) : (
//                         <span className="text-red-500">File link unavailable</span>
//                     )}
//                 </div>
//             )}

//             <button
//                 className={`mt-3 px-3 py-1 text-xs font-medium rounded-full ${
//                     theme === "dark" ? "bg-teal-900 text-teal-300" : "bg-teal-100 text-teal-700"
//                 }`}
//             >
//                 {workRequest.category}
//             </button>

//             {isCouncil && isOwner && (
//                 <div className="mt-4 flex gap-3">
//                     <button
//                         onClick={() => router.push(`/work-request/${workRequest.id}`)}
//                         className={`px-3 py-1 text-xs font-medium rounded-md ${
//                             theme === "dark" ? "bg-teal-600 hover:bg-teal-500 text-white" : "bg-teal-500 hover:bg-teal-400 text-white"
//                         }`}
//                     >
//                         Edit
//                     </button>

//                     <button
//                         onClick={() => handleDelete(workRequest.id)}
//                         className={`px-3 py-1 text-xs font-medium rounded-md ${
//                             theme === "dark" ? "bg-red-600 text-white hover:bg-red-500" : "bg-red-500 text-white hover:bg-red-400"
//                         }`}
//                     >
//                         Delete
//                     </button>
//                 </div>
//             )}

//             <div className="mt-4 flex justify-end">
//                 <button
//                     onClick={() => onView(workRequest)}
//                     className={`mt-4 px-3 py-1 text-sm font-medium rounded-md ${
//                         theme === "dark" ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-400 text-white"
//                     }`}
//                 >
//                     View Details
//                 </button>
//             </div>
//         </CardWrapper>
//     );
// };

// export default DataCard;


// File: DataCard.jsx
'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeProvider";
import WorkRequestModal from "./WorkRequestModal";
import Badge from "./Badge";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";
import clsx from "clsx";
import CardWrapper from "./CardWrapper";
import toast from "react-hot-toast";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { parseFilePath } from "@/utils/parseFilePath";

const getFileIcon = (fileURL) => {
  if (!fileURL) return <FaFileAlt className="text-gray-500 text-2xl" />;

  const ext = fileURL.split(".").pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return <FaFilePdf className="text-red-500 text-2xl" />;
    case "doc":
    case "docx":
      return <FaFileWord className="text-blue-500 text-2xl" />;
    case "jpg":
    case "jpeg":
    case "png":
      return <FaFileImage className="text-green-500 text-2xl" />;
    default:
      return <FaFileAlt className="text-gray-500 text-2xl" />;
  }
};

const DataCard = ({ workRequest, currentUser, onView, showStatus = false }) => {
  if (!workRequest) return null;

  const isOwner = currentUser?.id === workRequest.userId;
  const isCouncil = currentUser?.role === "COUNCIL";

  const { theme } = useTheme();
  const router = useRouter();

  // Signed URL hook
  const { signedFileUrl, loadingFileUrl } = useSignedUrl(workRequest.fileURL, "jobs");

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this work request?")) return;

    try {
      const workRequestResponse = await fetch(`/api/work-request/${id}`);
      if (!workRequestResponse.ok) throw new Error("Failed to fetch work request details.");
      const workRequest = await workRequestResponse.json();

      if (workRequest.fileURL) {
        const filePath = parseFilePath(workRequest.fileURL, "jobs");
        if (filePath) {
          const fileDeleteResponse = await fetch("/api/delete-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath, bucketName: "jobs" }),
          });

          if (!fileDeleteResponse.ok) {
            console.error("Failed to delete file from Supabase storage.");
          } else {
            console.log("File deleted successfully from Supabase storage.");
          }
        }
      }

      const response = await fetch(`/api/work-request/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete request");

      toast.success("Work request and associated file deleted!");
      window.location.reload();
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error("Failed to delete request and file!");
    }
  };

  const duration =
    workRequest.deadline && workRequest.createdAt
      ? Math.ceil(
          (new Date(workRequest.deadline) - new Date(workRequest.createdAt)) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const getStatusClasses = (status, theme) =>
    clsx(
      "absolute top-3 right-3 z-10 text-xs font-semibold px-3 py-1 rounded-full",
      {
        "bg-teal-100 text-teal-700": status === "OPEN" && theme !== "dark",
        "bg-teal-900 text-teal-200": status === "OPEN" && theme === "dark",
        "bg-yellow-100 text-yellow-700": status === "IN_PROGRESS" && theme !== "dark",
        "bg-yellow-900 text-yellow-200": status === "IN_PROGRESS" && theme === "dark",
        "bg-red-100 text-red-700": status === "CLOSED" && theme !== "dark",
        "bg-red-900 text-red-200": status === "CLOSED" && theme === "dark",
      }
    );

  return (
    <CardWrapper>
      {showStatus && workRequest.status && (
        <div className={getStatusClasses(workRequest.status, theme)}>
          {workRequest.status
            .replace("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
      )}

      <h4 className="text-sm font-semibold">
        Submitted by:{" "}
        {workRequest.userId ? (
          <Link
            href={`/profile/${workRequest.userId}`}
            className={clsx(
              "font-medium hover:underline",
              theme === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
            )}
          >
            {workRequest.user?.name || workRequest.user?.email || "Unknown User"}
          </Link>
        ) : (
          <span
            className={clsx(theme === "dark" ? "text-gray-400" : "text-gray-600")}
          >
            {workRequest.user?.name || workRequest.user?.email || "Unknown User"}
          </span>
        )}
      </h4>

      <h3 className="text-lg font-bold">{workRequest.title}</h3>

      {(workRequest._count?.bids ?? 0) > 0 && (
        <Badge count={workRequest._count.bids || 0} />
      )}

      <h3 className="text-sm mt-1">
        Budget:{" "}
        <span className="font-medium text-green-400">$ {workRequest.budget}</span>
      </h3>

      <h3 className="text-sm mt-1">
        Duration:{" "}
        <span className="font-medium text-yellow-500">{duration ?? "N/A"} days</span>
      </h3>

      <p className="text-sm mt-2">
        {workRequest.description
          ? workRequest.description.split(" ").slice(0, 50).join(" ")
          : "No description available"}
        ...
      </p>

      {workRequest.fileURL && (
        // <div className="flex items-center gap-2 mt-3">
        //   {getFileIcon(workRequest.fileURL)}
        //   {loadingFileUrl ? (
        //     <span className="text-gray-500">Loading file...</span>
        //   ) : signedFileUrl ? (
        //     <a
        //       // href={signedFileUrl}
        //       href={`/api/serve-file?filePath=${encodeURIComponent(workRequest.fileURL)}`}
        //       target="_blank"
        //       rel="noopener noreferrer"
        //       className="text-blue-600 underline"
        //     >
        //       View File
        //     </a>
        //   ) : (
        //     <span className="text-red-500">File link unavailable</span>
        //   )}
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

      <button
        className={`mt-3 px-3 py-1 text-xs font-medium rounded-full ${
          theme === "dark"
            ? "bg-teal-900 text-teal-300"
            : "bg-teal-100 text-teal-700"
        }`}
      >
        {workRequest.category}
      </button>

      {isCouncil && isOwner && (
        <div className="mt-4 flex gap-3">
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

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onView(workRequest)}
          className={`mt-4 px-3 py-1 text-sm font-medium rounded-md ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-blue-500 hover:bg-blue-400 text-white"
          }`}
        >
          View Details
        </button>
      </div>
    </CardWrapper>
  );
};

export default DataCard;
