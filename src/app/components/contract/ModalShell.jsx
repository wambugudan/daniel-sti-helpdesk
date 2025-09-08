// src/app/components/contract/ModalShell.jsx
import { motion } from "framer-motion";

const ModalShell = ({ children, onClose, theme }) => (
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
    >
      <button
        onClick={onClose}
        className={`absolute top-3 right-4 text-lg font-bold ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        ×
      </button>

      {children}
    </motion.div>
  </motion.div>
);

export default ModalShell;
