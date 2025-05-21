// File: src/app/components/ModalListener.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WorkRequestModal from "./WorkRequestModal";
import ContractModal from "./ContractModal";
import { fetchWorkRequest } from "@/services/workRequestService";
import { fetchContract } from "@/services/contractService";
import toast from "react-hot-toast";

const ModalListener = ({ currentUser }) => {
  const [modalRequest, setModalRequest] = useState(null);
  const [modalContract, setModalContract] = useState(null);
  const [loading, setLoading] = useState(false); // NEW
  const [error, setError] = useState(null); // NEW
  const router = useRouter();

  // 1️⃣ Listen for query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get("requestId");
    const contractId = params.get("contractId");

    setLoading(true); // Start Loading

    // 2️⃣ Fetch WorkRequest if requestId is present
    if (requestId) {
      (async () => {
        const data = await fetchWorkRequest(requestId, currentUser?.id);
        if (data) {
          setModalRequest(data);
        } else {
          setError("Failed to load Work Request");
          toast.error("Failed to load Work Request");
        }
        setLoading(false); // End Loading
      })();
    }

    // 3️⃣ Fetch Contract if contractId is present
    if (contractId) {
      (async () => {
        const data = await fetchContract(contractId, currentUser?.id);
        if (data) {
          setModalContract(data);
        } else {
          setError("Failed to load Contract");
          toast.error("Failed to load Contract");
        }
        setLoading(false); // End Loading
      })();
    }

    // log the values for debugging
    console.log("Trying to fetch contract:", contractId);
    console.log("Trying to fetch work request:", requestId);
    console.log("Current user ID:", currentUser?.id);
  }, [router, currentUser]);

  // 4️⃣ Render the modals if data is available
  return (
    <>
      {loading && <div>Loading...</div>}

      {error && (
        <div className="text-red-500">
          <p>{error}</p>
        </div>
      )}

      {modalRequest && (
        <WorkRequestModal
          workRequest={modalRequest}
          currentUser={currentUser}
          onClose={() => {
            setModalRequest(null);
            const url = new URL(window.location);
            url.searchParams.delete("requestId");
            window.history.pushState({}, "", url);
          }}
        />
      )}

      {modalContract && (
        <ContractModal
          contract={modalContract}
          currentUser={currentUser}
          onClose={() => {
            setModalContract(null);
            const url = new URL(window.location);
            url.searchParams.delete("contractId");
            window.history.pushState({}, "", url);
          }}
        />
      )}
    </>
  );
};

export default ModalListener;

