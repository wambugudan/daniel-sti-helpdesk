// File: components/Badge.jsx
import { FaGavel, FaMinusCircle } from "react-icons/fa";

const Badge = ({ count }) => {
  const hasBids = count > 0;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
        hasBids ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
      }`}
    >
      {hasBids ? <FaGavel /> : <FaMinusCircle />}
      {hasBids ? `${count} ${count === 1 ? "bid" : "bids"}` : "No bids"}
    </div>
  );
};

export default Badge;
