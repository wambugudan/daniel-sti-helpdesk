// File: src/app/components/contract/submission/SubmissionSection.jsx
import SubmissionForm from "./SubmissionForm";
import SubmissionPreview from "./SubmissionPreview";

const SubmissionSection = ({
  localSubmission,
  editingSubmission,
  setEditingSubmission,
  submissionMessage,
  setSubmissionMessage,
  file,
  setFile,
  uploadProgress,
  submitting,
  handleSubmit,
}) => {
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-2">📬 Work Submission</h3>

      {localSubmission && !editingSubmission ? (
        <SubmissionPreview
          localSubmission={localSubmission}
          onEdit={() => {
            setSubmissionMessage(localSubmission?.message || "");
            // If file exists, keep reference for preview but allow replacing
            setFile(null);
            setEditingSubmission(true);
          }}
        />
      ) : (
        <SubmissionForm
          submissionMessage={submissionMessage}
          setSubmissionMessage={setSubmissionMessage}
          file={file}
          setFile={setFile}
          uploadProgress={uploadProgress}
          submitting={submitting}
          handleSubmit={handleSubmit}
          existingFileName={localSubmission?.fileName}
        />
      )}
    </div>
  );
};

export default SubmissionSection;
