// File: src/app/components/contract/ContractDetails.jsx
import { useState, useEffect } from "react";
import { getFileIcon } from "./utils/fileIcons";
import { useSignedUrl } from "@/hooks/useSignedUrl";

const ContractDetails = ({ contractData }) => {
  const [expanded, setExpanded] = useState(false);

  // ✅ Pick the right file URL (top-level or nested)
  const fileUrl = contractData?.fileURL || contractData?.workRequest?.fileURL;

  // 🔑 Use signed URL hook for attachments
  const { signedFileUrl: signedFileUrl, loadingFileUrl } = useSignedUrl(
    fileUrl,
    "jobs"
  );

  useEffect(() => {
    console.log("📝 Full contractData in ContractDetails:", contractData);
  }, [contractData]);

  useEffect(() => {
    console.log("🎯 Accepted Bid object:", contractData?.acceptedBid);
  }, [contractData]);


  return (
    <div className="mb-4 border-t pt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-base">📝 Contract Details</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-500 underline"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Work description */}
          <div>
            <h4 className="font-semibold mb-1">📄 Work Description</h4>
            <p className="whitespace-pre-line text-sm">
              {contractData?.workRequest?.description ||
                contractData?.description ||
                "No description provided."}
            </p>
          </div>

          {/* Attachment */}
          {fileUrl ? (
            <div className="flex items-center gap-2">
              {getFileIcon(fileUrl)}

              {loadingFileUrl ? (
                <span className="text-gray-500 text-sm">Loading file...</span>
              ) : signedFileUrl ? (
                <>
                  <a
                    href={`/api/serve-file?filePath=${encodeURIComponent(fileUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {contractData?.workRequest?.fileName ||
                      contractData?.fileName ||
                      "View File"}
                  </a>
                  |
                  <a
                    href={`/api/serve-file?filePath=${encodeURIComponent(fileUrl)}&download=true`}
                    download
                    className="text-blue-600 underline hover:text-blue-500"
                  >
                    Download File
                  </a>
                </>
              ) : (
                <span className="text-red-500 text-sm">File unavailable</span>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No file uploaded</p>
          )}

          {/* Accepted bid */}
          <div>
            <h4 className="font-semibold mb-1">🎯 Your Accepted Bid</h4>
            <p className="text-green-600 font-bold text-lg">
              ${contractData?.acceptedBid?.amount}
            </p>
            <p className="italic text-sm">
              {contractData?.acceptedBid?.message || "No message provided."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetails;

