// File: DataCard.jsx
// Description: This component is a card that displays information about a work request. 
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";
import { useState } from "react";
import WorkRequestModal from "./WorkRequestModal";
import Badge from "./Badge"; 
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";
import clsx from "clsx";

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
  const isOwner = currentUser?.id === workRequest.userId;
  const isCouncil = currentUser?.role === "COUNCIL";
  const isExpert = currentUser?.role === "EXPERT";

  const { theme } = useTheme();
  const router = useRouter();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this work request?")) return;
    try {
      const response = await fetch(`/api/work-request/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete request");
      toast.success("Work request deleted!");
    } catch (error) {
      toast.error("Failed to delete request!");
    }
  };

  const duration =
    workRequest.deadline && workRequest.createdAt
      ? Math.ceil((new Date(workRequest.deadline) - new Date(workRequest.createdAt)) / (1000 * 60 * 60 * 24))
      : null;

  // Status Styles

  const getStatusClasses = (status, theme) => {
    return clsx(
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
  };



  return (
    <div
      className={`relative shadow-lg rounded-lg p-4 w-full sm:w-3/4 md:w-4/5 lg:w-4/5 xl:w-2/3 mx-auto transition-transform duration-300 hover:scale-105 hover:shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}      
    >
      {/* Status Badge */}
      {showStatus && workRequest.status && (
        <div         
          className={getStatusClasses(workRequest.status, theme)}
        >
          {workRequest.status.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
        </div>
      )}

      <h4 className="text-sm font-semibold">
        {workRequest.user?.name || workRequest.user?.email || 'Unknown User'}
      </h4>

      <h3 className="text-lg font-bold">{workRequest.title}</h3>

      {(workRequest._count?.bids ?? 0) > 0 && (
        <Badge count={workRequest._count.bids || 0} />
      )}

      <h3 className="text-sm mt-1">
        Budget: <span className="font-medium text-green-400">$ {workRequest.budget}</span>
      </h3>

      <h3 className="text-sm mt-1">
        Duration: <span className="font-medium text-yellow-500">{duration ?? 'N/A'} days</span>
      </h3>

      <p className="text-sm mt-2">
        {workRequest.description ? workRequest.description.split(" ").slice(0, 50).join(" ") : "No description available"}...
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

      <button
        className={`mt-3 px-3 py-1 text-xs font-medium rounded-full ${
          theme === "dark" ? "bg-teal-900 text-teal-300" : "bg-teal-100 text-teal-700"
        }`}
      >
        {workRequest.category}
      </button>

      {isCouncil && isOwner && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push(`/work-request/${workRequest.id}`)}
            className={`px-3 py-1 text-xs font-medium rounded-md ${
              theme === "dark" ? "bg-teal-600 hover:bg-teal-500 text-white" : "bg-teal-500 hover:bg-teal-400 text-white"
            }`}
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(workRequest.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md ${
              theme === "dark" ? "bg-red-600 text-white hover:bg-red-500" : "bg-red-500 text-white hover:bg-red-400"
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
            theme === "dark" ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-400 text-white"
          }`}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default DataCard;



