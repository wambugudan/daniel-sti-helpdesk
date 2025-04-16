'use client';
import { useTheme } from "@/context/ThemeProvider";
import { FaMoneyBillWave, FaClock, FaCheckCircle, FaUser } from "react-icons/fa";

const ContractCard = ({ contract, onView }) => {
  const { theme } = useTheme();

  const duration =
    contract.deadline && contract.createdAt
      ? Math.ceil((new Date(contract.deadline) - new Date(contract.createdAt)) / (1000 * 60 * 60 * 24))
      : "N/A";

  const statusColor = {
    OPEN: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    CLOSED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  }[contract.status];

  return (
    <div
      className={`relative rounded-xl shadow-sm p-6 w-full transition duration-300 hover:shadow-lg border 
      ${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`}
    >
      {/* Status Badge */}
      <div className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
        {contract.status.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-3">{contract.title}</h3>

      {/* Info Grid */}
      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <FaUser className="text-gray-500" />
          <strong>Client:</strong> {contract.user?.name || contract.user?.email}
        </p>
        <p className="flex items-center gap-2">
          <FaMoneyBillWave className="text-green-500" />
          <strong>Budget:</strong> ${contract.budget}
        </p>
        <p className="flex items-center gap-2">
          <FaClock className="text-yellow-500" />
          <strong>Duration:</strong> {duration} days
        </p>
        {contract.acceptedBid && (
          <p className="flex items-center gap-2">
            <FaCheckCircle className="text-blue-500" />
            <strong>My Winning Bid:</strong> ${contract.acceptedBid.amount}
          </p>
        )}
      </div>

      {/* View Contract Button */}
      <div className="mt-5 flex justify-end">
        <button
          onClick={() => onView(contract)}
          className={`px-4 py-2 text-sm font-semibold rounded-md ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-blue-500 hover:bg-blue-400 text-white"
          }`}
        >
          View Contract
        </button>
      </div>
    </div>
  );
};

export default ContractCard;
