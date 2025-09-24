// File: src/app/components/contract/ContractModal.jsx
"use client";

import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();

  const currentUser = session?.user
  ? {
      id: session.user.id,
      role: session.user.role,
      name: session.user.name,
      email: session.user.email,
    }
  : null;

  const resolvedContract = contract || contractData;

  // ✅ Find submissionId from acceptedBid
  const submissionId = resolvedContract?.acceptedBid?.submission?.id || null;

  // console.log("📌 resolvedContract:", resolvedContract);
  // console.log("🔑 submissionId for conversation:", submissionId);

  // Submission logic
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
  } = useSubmission(resolvedContract?.acceptedBid?.id || null);

  // Conversation logic
  const {
    messages,
    newMessage,
    setNewMessage,
    newFile,
    setNewFile,
    sending,
    sendMessage,
    loading,
    error,
  } = useConversation(
    submissionId,
    currentUser
  );

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
          currentUserId={currentUser?.id}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          newFile={newFile}
          setNewFile={setNewFile}
          sending={sending}
          sendMessage={sendMessage}
          loading={loading}
          error={error}
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

