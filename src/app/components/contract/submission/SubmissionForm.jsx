// File: src/app/components/contract/submission/SubmissionForm.jsx
const SubmissionForm = ({
  submissionMessage,
  setSubmissionMessage,
  file,
  setFile,
  uploadProgress,
  submitting,
  handleSubmit,
  existingFileName,
}) => {
  return (
    <div className="flex flex-col">
      <textarea
        placeholder="Enter a message"
        rows={3}
        className="w-full p-2 border rounded mb-3 text-sm"
        value={submissionMessage}
        onChange={(e) => setSubmissionMessage(e.target.value)}
      />

      {existingFileName && (
        <p className="text-sm text-gray-500 mb-2">
          Current File: <span className="font-medium">{existingFileName}</span>
        </p>
      )}

      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="mb-3"
        onChange={(e) => {
          if (e.target.files?.length > 0) setFile(e.target.files[0]);
        }}
      />

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className={`px-4 py-2 rounded text-sm font-semibold text-white ${
          submitting ? "bg-gray-400" : "bg-teal-500 hover:bg-teal-400"
        }`}
      >
        {submitting ? "Submitting..." : "Submit Work"}
      </button>
    </div>
  );
};

export default SubmissionForm;
