// src/app/components/contract/ContractActions.jsx
const ContractActions = ({ theme, loading, handleCancelContract }) => (
  <div className="mt-6 flex justify-end">
    <button
      disabled={loading}
      onClick={handleCancelContract}
      className={`px-4 py-1 text-sm font-semibold rounded ${
        theme === "dark"
          ? "bg-red-600 text-white hover:bg-red-500"
          : "bg-red-500 text-white hover:bg-red-400"
      }`}
    >
      Cancel Contract
    </button>
  </div>
);

export default ContractActions;
