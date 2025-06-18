// // File: src/app/components/ModalListener.jsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import WorkRequestModal from "./WorkRequestModal";
// import ContractModal from "./ContractModal";
// import { fetchWorkRequest } from "@/services/workRequestService";
// import { fetchContract } from "@/services/contractService";
// import toast from "react-hot-toast";

// const ModalListener = ({ currentUser }) => {
//   const [modalRequest, setModalRequest] = useState(null);
//   const [modalContract, setModalContract] = useState(null);
//   const [loading, setLoading] = useState(false); // NEW
//   const [error, setError] = useState(null); // NEW
//   const router = useRouter();

//   // 1️⃣ Listen for query parameters
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const requestId = params.get("requestId");
//     const contractId = params.get("contractId");

//     setLoading(true); // Start Loading

//     // 2️⃣ Fetch WorkRequest if requestId is present
//     if (requestId) {
//       (async () => {
//         const data = await fetchWorkRequest(requestId, currentUser?.id);
//         if (data) {
//           setModalRequest(data);
//         } else {
//           setError("Failed to load Work Request");
//           toast.error("Failed to load Work Request");
//         }
//         setLoading(false); // End Loading
//       })();
//     }

//     // 3️⃣ Fetch Contract if contractId is present
//     if (contractId) {
//       (async () => {
//         const data = await fetchContract(contractId, currentUser?.id);
//         if (data) {
//           setModalContract(data);
//         } else {
//           setError("Failed to load Contract");
//           toast.error("Failed to load Contract");
//         }
//         setLoading(false); // End Loading
//       })();
//     }

//     // log the values for debugging
//     console.log("Trying to fetch contract:", contractId);
//     console.log("Trying to fetch work request:", requestId);
//     console.log("Current user ID:", currentUser?.id);
//   }, [router, currentUser]);

//   // 4️⃣ Render the modals if data is available
//   return (
//     <>
//       {loading && <div>Loading...</div>}

//       {error && (
//         <div className="text-red-500">
//           <p>{error}</p>
//         </div>
//       )}

//       {modalRequest && (
//         <WorkRequestModal
//           workRequest={modalRequest}
//           currentUser={currentUser}
//           onClose={() => {
//             setModalRequest(null);
//             const url = new URL(window.location);
//             url.searchParams.delete("requestId");
//             window.history.pushState({}, "", url);
//           }}
//         />
//       )}

//       {modalContract && (
//         <ContractModal
//           contract={modalContract}
//           currentUser={currentUser}
//           onClose={() => {
//             setModalContract(null);
//             const url = new URL(window.location);
//             url.searchParams.delete("contractId");
//             window.history.pushState({}, "", url);
//           }}
//         />
//       )}
//     </>
//   );
// };

// export default ModalListener;






// File: src/app/components/ModalListener.jsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
// import WorkRequestModal from "./WorkRequestModal";
// import ContractModal from "./ContractModal";
// import toast from "react-hot-toast";

// // Assuming these services return data or null/throw an error on failure
// import { fetchWorkRequest } from "@/services/workRequestService";
// import { fetchContract } from "@/services/contractService";

// const ModalListener = ({ currentUser }) => {
//   const [modalRequest, setModalRequest] = useState(null);
//   const [modalContract, setModalContract] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const router = useRouter();
//   const searchParams = useSearchParams(); // Use useSearchParams hook

//   console.log("ModalListener: Initial currentUser:", currentUser);

//   useEffect(() => {
//     // Get query parameters from useSearchParams
//     const requestId = searchParams.get("requestId");
//     const contractId = searchParams.get("contractId");

//     console.log("ModalListener: useEffect triggered. Current params:", { requestId, contractId });
//     console.log("ModalListener: useEffect currentUser.id:", currentUser?.id);


//     // Reset states at the start of each effect run
//     setModalRequest(null);
//     setModalContract(null);
//     setError(null);

//     // Only proceed if an ID is present and currentUser is available
//     if ((requestId || contractId) && currentUser?.id) {
//       setLoading(true);
//       const fetches = [];

//       if (requestId) {
//         fetches.push(
//           fetchWorkRequest(requestId, currentUser.id)
//             .then(data => {
//               if (data) {
//                 setModalRequest(data);
//               } else {
//                 // If data is null/undefined but fetch was successful, treat as a soft error
//                 console.warn(`Work Request with ID ${requestId} not found.`);
//                 return Promise.reject(new Error("Work Request not found."));
//               }
//             })
//             .catch(err => {
//               // Catch network errors or errors thrown from fetchWorkRequest
//               console.error("Error fetching Work Request:", err);
//               return Promise.reject(new Error("Failed to load Work Request."));
//             })
//         );
//       }

//       if (contractId) {
//         fetches.push(
//           fetchContract(contractId, currentUser.id)
//             .then(data => {
//               if (data) {
//                 setModalContract(data);
//               } else {
//                 // If data is null/undefined but fetch was successful, treat as a soft error
//                 console.warn(`Contract with ID ${contractId} not found.`);
//                 return Promise.reject(new Error("Contract not found."));
//               }
//             })
//             .catch(err => {
//               // Catch network errors or errors thrown from fetchContract
//               console.error("Error fetching Contract:", err);
//               return Promise.reject(new Error("Failed to load Contract."));
//             })
//         );
//       }

//       // Use Promise.allSettled to handle multiple promises, even if some fail
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
//           setLoading(false); // Always set loading to false after all attempts
//         });

//     } else if (!requestId && !contractId) {
//       // If no IDs are in the URL, ensure loading is off
//       setLoading(false);
//     }
//     // If IDs are present but currentUser is not yet available,
//     // loading remains true until currentUser resolves (and useEffect re-runs).

//   }, [searchParams, currentUser, router]); // Depend on searchParams and currentUser

//   // Function to clear query parameter using router.replace
//   const clearQueryParam = (paramName) => {
//     const newSearchParams = new URLSearchParams(searchParams.toString());
//     newSearchParams.delete(paramName);
//     // Use router.replace to update URL without adding to history, and prevent scroll
//     router.replace(`?${newSearchParams.toString()}`, { scroll: false });
//   };

//   return (
//     <>
//       {loading && (requestId || contractId) && ( // Only show loading if there's an ID to fetch
//         <div className="flex justify-center items-center h-full">
//           <p>Loading...</p>
//         </div>
//       )}

//       {error && (
//         <div className="text-red-500 p-4 text-center">
//           <p>{error}</p>
//         </div>
//       )}

//       {/* Render WorkRequestModal if modalRequest is set and no contract modal is open */}
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

//       {/* Render ContractModal if modalContract is set and no work request modal is open */}
//       {modalContract && !modalRequest && (
//         <ContractModal
//           contract={modalContract}
//           currentUser={currentUser}
//           onClose={() => {
//             setModalContract(null);
//             clearQueryParam("contractId");
//           }}
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
import ContractModal from "./ContractModal";
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

  console.log("ModalListener: Initial currentUser:", currentUser);

  useEffect(() => {
    const requestId = searchParams.get("requestId");
    const contractId = searchParams.get("contractId");

    console.log("ModalListener: useEffect triggered. Current params:", { requestId, contractId });
    console.log("ModalListener: useEffect currentUser.id:", currentUser?.id);


    setModalRequest(null);
    setModalContract(null);
    setError(null);

    if ((requestId || contractId) && currentUser?.id) {
      setLoading(true);
      const fetches = [];

      if (requestId) {
        console.log("ModalListener: Fetching WorkRequest for ID:", requestId);
        fetches.push(
          fetchWorkRequest(requestId, currentUser.id)
            .then(data => {
              if (data) {
                console.log("ModalListener: WorkRequest fetched successfully:", data);
                setModalRequest(data);
              } else {
                console.warn(`ModalListener: Work Request with ID ${requestId} not found (data was null).`);
                return Promise.reject(new Error("Work Request not found."));
              }
            })
            .catch(err => {
              console.error("ModalListener: Error fetching Work Request:", err);
              return Promise.reject(new Error("Failed to load Work Request."));
            })
        );
      }

      if (contractId) {
        console.log("ModalListener: Fetching Contract for ID:", contractId);
        fetches.push(
          fetchContract(contractId, currentUser.id)
            .then(data => {
              if (data) {
                console.log("ModalListener: Contract fetched successfully:", data);
                setModalContract(data);
              } else {
                console.warn(`ModalListener: Contract with ID ${contractId} not found (data was null).`);
                return Promise.reject(new Error("Contract not found."));
              }
            })
            .catch(err => {
              console.error("ModalListener: Error fetching Contract:", err);
              return Promise.reject(new Error("Failed to load Contract."));
            })
        );
      }

      Promise.allSettled(fetches)
        .then((results) => {
          const rejectedReasons = results
            .filter(result => result.status === 'rejected')
            .map(result => result.reason.message);

          if (rejectedReasons.length > 0) {
            const combinedError = rejectedReasons.join('; ');
            setError(combinedError);
            toast.error(combinedError);
          }
        })
        .finally(() => {
          console.log("ModalListener: Fetches completed. Setting loading to false.");
          setLoading(false);
        });

    } else if (!requestId && !contractId) {
      console.log("ModalListener: No requestId or contractId in params.");
      setLoading(false);
    } else {
      console.log("ModalListener: Awaiting currentUser.id to fetch data for ID:", requestId || contractId);
    }

  }, [searchParams, currentUser, router]);

  console.log("ModalListener: Render state -", { modalRequest, modalContract, loading, error });

  const clearQueryParam = (paramName) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete(paramName);
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* THIS LINE WAS MODIFIED: Use searchParams.get() directly in JSX */}
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
          currentUser={currentUser}
          onClose={() => {
            setModalContract(null);
            clearQueryParam("contractId");
          }}
        />
      )}
    </>
  );
};

export default ModalListener;