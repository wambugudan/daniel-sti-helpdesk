// // File: src/app/components/ModalListener.jsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import WorkRequestModal from "./WorkRequestModal";
// // import ContractModal from "./ContractModal";

// // Uses the new ContractModal path
// import ContractModal from "./contract/ContractModal";
// import toast from "react-hot-toast";

// import { fetchWorkRequest } from "@/services/workRequestService";
// import { fetchContract } from "@/services/contractService";

// const ModalListener = ({ currentUser }) => {
//   const [modalRequest, setModalRequest] = useState(null);
//   const [modalContract, setModalContract] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   console.log("ModalListener: Initial currentUser:", currentUser);

//   useEffect(() => {
//     const requestId = searchParams.get("requestId");
//     const contractId = searchParams.get("contractId");

//     console.log("ModalListener: useEffect triggered. Current params:", { requestId, contractId });
//     console.log("ModalListener: useEffect currentUser.id:", currentUser?.id);


//     setModalRequest(null);
//     setModalContract(null);
//     setError(null);

//     if ((requestId || contractId) && currentUser?.id) {
//       setLoading(true);
//       const fetches = [];

//       if (requestId) {
//         console.log("ModalListener: Fetching WorkRequest for ID:", requestId);
//         fetches.push(
//           fetchWorkRequest(requestId, currentUser.id)
//             .then(data => {
//               if (data) {
//                 console.log("ModalListener: WorkRequest fetched successfully:", data);
//                 setModalRequest(data);
//               } else {
//                 console.warn(`ModalListener: Work Request with ID ${requestId} not found (data was null).`);
//                 return Promise.reject(new Error("Work Request not found."));
//               }
//             })
//             .catch(err => {
//               console.error("ModalListener: Error fetching Work Request:", err);
//               return Promise.reject(new Error("Failed to load Work Request."));
//             })
//         );
//       }

//       if (contractId) {
//         console.log("ModalListener: Fetching Contract for ID:", contractId);
//         fetches.push(
//           fetchContract(contractId, currentUser.id)
//             .then(data => {
//               if (data) {
//                 console.log("ModalListener: Contract fetched successfully:", data);
//                 setModalContract(data);
//               } else {
//                 console.warn(`ModalListener: Contract with ID ${contractId} not found (data was null).`);
//                 return Promise.reject(new Error("Contract not found."));
//               }
//             })
//             .catch(err => {
//               console.error("ModalListener: Error fetching Contract:", err);
//               return Promise.reject(new Error("Failed to load Contract."));
//             })
//         );
//       }

//       Promise.allSettled(fetches)
//         .then((results) => {
//           const rejectedReasons = results
//             .filter(result => result.status === 'rejected')
//             .map(result => result.reason.message);

//           if (rejectedReasons.length > 0) {
//             const combinedError = rejectedReasons.join('; ');
//             setError(combinedError);
//             toast.error(combinedError);
//           }
//         })
//         .finally(() => {
//           console.log("ModalListener: Fetches completed. Setting loading to false.");
//           setLoading(false);
//         });

//     } else if (!requestId && !contractId) {
//       console.log("ModalListener: No requestId or contractId in params.");
//       setLoading(false);
//     } else {
//       console.log("ModalListener: Awaiting currentUser.id to fetch data for ID:", requestId || contractId);
//     }

//   }, [searchParams, currentUser, router]);

//   console.log("ModalListener: Render state -", { modalRequest, modalContract, loading, error });

//   const clearQueryParam = (paramName) => {
//     const newSearchParams = new URLSearchParams(searchParams.toString());
//     newSearchParams.delete(paramName);
//     router.replace(`?${newSearchParams.toString()}`, { scroll: false });
//   };

//   return (
//     <>
//       {/* THIS LINE WAS MODIFIED: Use searchParams.get() directly in JSX */}
//       {loading && (searchParams.get("requestId") || searchParams.get("contractId")) && (
//         <div className="flex justify-center items-center h-screen w-screen fixed inset-0 bg-black bg-opacity-50 z-50">
//           <p className="text-white text-lg">Loading modal data...</p>
//         </div>
//       )}

//       {error && (
//         <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl text-red-700">
//             <p>{error}</p>
//             <button
//               onClick={() => setError(null)}
//               className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {modalRequest && !modalContract && (
//         <WorkRequestModal
//           workRequest={modalRequest}
//           currentUser={currentUser}
//           onClose={() => {
//             setModalRequest(null);
//             clearQueryParam("requestId");
//           }}
//         />
//       )}

//       {modalContract && !modalRequest && (
//         <ContractModal
//           contract={modalContract}
//           contractData={modalContract.workRequest}
//           currentUser={currentUser}
//           onClose={() => {
//             setModalContract(null);
//             clearQueryParam("contractId");
//           }}
//           // Temporary handlers for contract actions
//           handleCancelContract={() => console.log("Cancel contract", modalContract.id)}
//         />
//       )}
//     </>
//   );
// };

// export default ModalListener;


// File: src/app/components/ModalListener.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WorkRequestModal from "./WorkRequestModal";
import ContractModal from "./contract/ContractModal";
import toast from "react-hot-toast";

import { fetchWorkRequest } from "@/services/workRequestService";
import { fetchContract } from "@/services/contractService";

const ModalListener = ({ currentUser }) => {
  const [modalRequest, setModalRequest] = useState(null);
  const [modalContract, setModalContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const requestId = searchParams.get("requestId");
    const contractId = searchParams.get("contractId");

    setModalRequest(null);
    setModalContract(null);
    setError(null);

    if ((requestId || contractId) && currentUser?.id) {
      setLoading(true);
      const fetches = [];

      if (requestId) {
        fetches.push(
          fetchWorkRequest(requestId, currentUser.id)
            .then(data => data ? setModalRequest(data) : Promise.reject(new Error("Work Request not found")))
            .catch(err => Promise.reject(new Error("Failed to load Work Request")))
        );
      }

      if (contractId) {
        fetches.push(
          fetchContract(contractId, currentUser.id)
            .then(data => data ? setModalContract(data) : Promise.reject(new Error("Contract not found")))
            .catch(err => Promise.reject(new Error("Failed to load Contract")))
        );
      }

      Promise.allSettled(fetches)
        .then(results => {
          const rejectedReasons = results
            .filter(r => r.status === "rejected")
            .map(r => r.reason.message);
          if (rejectedReasons.length > 0) {
            const combinedError = rejectedReasons.join("; ");
            setError(combinedError);
            toast.error(combinedError);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams, currentUser]);

  const clearQueryParam = (paramName) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete(paramName);
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
  };

  return (
    <>
      {loading && (searchParams.get("requestId") || searchParams.get("contractId")) && (
        <div className="flex justify-center items-center h-screen w-screen fixed inset-0 bg-black bg-opacity-50 z-50">
          <p className="text-white text-lg">Loading modal data...</p>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-red-700">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {modalRequest && !modalContract && (
        <WorkRequestModal
          workRequest={modalRequest}
          currentUser={currentUser}
          onClose={() => {
            setModalRequest(null);
            clearQueryParam("requestId");
          }}
        />
      )}

      {modalContract && !modalRequest && (
        <ContractModal
          contract={modalContract}
          contractData={modalContract} // ✅ Pass the full contract for useSubmission
          currentUser={currentUser}
          onClose={() => {
            setModalContract(null);
            clearQueryParam("contractId");
          }}
          handleCancelContract={() => console.log("Cancel contract", modalContract.id)}
        />
      )}
    </>
  );
};

export default ModalListener;
