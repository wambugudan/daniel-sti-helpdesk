'use client';
import { useTheme } from "@/context/ThemeProvider";

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
      className={`relative rounded-lg shadow-md p-4 w-full transition duration-300 hover:shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Status Badge */}
      <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}>
        {contract.status.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold">{contract.title}</h3>

      {/* Council Name */}
      <p className="text-sm">
        <strong>Client:</strong> {contract.user?.name || contract.user?.email}
      </p>

      {/* Budget & Duration */}
      <p className="text-sm">
        <strong>Budget:</strong> ${contract.budget}
      </p>
      <p className="text-sm">
        <strong>Duration:</strong> {duration} days
      </p>

      {/* Accepted Bid Amount */}
      {contract.acceptedBid && (
        <p className="text-sm">
          <strong>My Winning Bid:</strong> ${contract.acceptedBid.amount}
        </p>
      )}

      {/* View Details Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onView(contract)}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            theme === "dark" ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-400 text-white"
          }`}
        >
          View Contract
        </button>
      </div>
    </div>
  );
};

export default ContractCard;
