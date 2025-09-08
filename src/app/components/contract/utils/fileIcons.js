// File: src/app/components/contract/utils/fileIcons.js
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";

export const getFileIcon = (fileURL) => {
  if (!fileURL) return <FaFileAlt className="text-gray-500" />;

  const ext = fileURL.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
      return <FaFilePdf className="text-red-500" />;
    case "doc":
    case "docx":
      return <FaFileWord className="text-blue-500" />;
    case "jpg":
    case "jpeg":
    case "png":
      return <FaFileImage className="text-green-500" />;
    default:
      return <FaFileAlt className="text-gray-500" />;
  }
};
