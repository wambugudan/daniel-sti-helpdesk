// src/app/components/contract/ContractHeader.jsx
const ContractHeader = ({ contractData }) => (
  <div className="mb-4">
    <h2 className="text-xl font-bold mb-1">
      {contractData?.workRequest?.title || contractData.title}
    </h2>
    <p className="text-sm">
      <strong>Category:</strong>{" "}
      {contractData?.workRequest?.category || contractData.category}
    </p>
  </div>
);

export default ContractHeader;
