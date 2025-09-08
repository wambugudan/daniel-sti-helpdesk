// File: src/app/components/contract/ContractModal.jsx
"use client";

import { AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeProvider";

import ModalShell from "./ModalShell";
import ContractHeader from "./ContractHeader";
import ContractDetails from "./ContractDetails";
import SubmissionSection from "./submission/SubmissionSection";
import ConversationSection from "./conversation/ConversationSection";
import ContractActions from "./ContractActions";

import { useSubmission } from "./hooks/useSubmission";
import { useConversation } from "./hooks/useConversation";

const ContractModal = ({ contract, contractData, onClose, handleCancelContract }) => {
  const { theme } = useTheme();

  // ✅ Always use the full contract for bidId resolution
  const resolvedContract = contract || contractData;
  const bidId = resolvedContract?.acceptedBid?.id || null;

  console.log("📌 resolvedContract:", resolvedContract);
  console.log("🔑 bidId for submission:", bidId);

  // Submission logic hook
  const {
    submissionMessage,
    setSubmissionMessage,
    file,
    setFile,
    uploadProgress,
    submitting,
    editingSubmission,
    setEditingSubmission,
    handleSubmit,
    localSubmission,
  } = useSubmission(bidId);

  // Conversation logic hook
  const {
    messages,
    newMessage,
    setNewMessage,
    newFile,
    setNewFile,
    sending,
    sendMessage,
  } = useConversation(resolvedContract?.id);

  return (
    <AnimatePresence>
      <ModalShell onClose={onClose} theme={theme}>
        <ContractHeader contractData={resolvedContract} />

        <ContractDetails contractData={resolvedContract} />

        {resolvedContract?.status === "IN_PROGRESS" && (
          <SubmissionSection
            localSubmission={localSubmission}
            editingSubmission={editingSubmission}
            setEditingSubmission={setEditingSubmission}
            submissionMessage={submissionMessage}
            setSubmissionMessage={setSubmissionMessage}
            file={file}
            setFile={setFile}
            uploadProgress={uploadProgress}
            submitting={submitting}
            handleSubmit={handleSubmit}
          />
        )}

        <ConversationSection
          messages={messages}
          currentUserId={resolvedContract?.currentUser?.id}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          newFile={newFile}
          setNewFile={setNewFile}
          sending={sending}
          sendMessage={sendMessage}
        />

        <ContractActions
          theme={theme}
          loading={false}
          handleCancelContract={handleCancelContract}
        />
      </ModalShell>
    </AnimatePresence>
  );
};

export default ContractModal;
