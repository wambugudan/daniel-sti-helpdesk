// // File: src/services/contractService.js
// export const createContract = async (contractData) => {
//   try {
//     const response = await fetch("/api/contract/create", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(contractData),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       console.error("Failed to create contract:", error);
//       return { error: error.error || "Unknown error" };
//     }

//     const contract = await response.json();
//     return { contract };
//   } catch (error) {
//     console.error("Contract creation error:", error);
//     return { error: "Failed to create contract due to network or server error." };
//   }
// };


// export const fetchContract = async (contractId, userId) => {
//   try {
//     const response = await fetch(`/api/contract/${contractId}`, {
//       headers: {
//         "x-user-id": userId,
//       },
//     });

//     if (!response.ok) {
//       console.error("Failed to fetch Contract");
//       return null;
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching Contract:", error);
//     return null;
//   }
// };


// File: src/services/contractService.js

export const createContract = async (contractData) => {
  try {
    const response = await fetch("/api/contract/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contractData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Failed to create contract:", error);
      return { error: error.error || "Unknown error" };
    }

    const contract = await response.json();
    console.log("✅ Contract created:", contract);
    return { contract };
  } catch (error) {
    console.error("💥 Contract creation error:", error);
    return { error: "Failed to create contract due to network or server error." };
  }
};


export const fetchContract = async (contractId, userId) => {
  try {
    console.log("📡 Fetching contract from API:", { contractId, userId });

    const response = await fetch(`/api/contract/${contractId}`, {
      headers: {
        "x-user-id": userId,
      },
    });

    console.log("🔎 Raw response status:", response.status);

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ Failed to fetch Contract. Response text:", err);
      return null;
    }

    const data = await response.json();
    console.log("✅ Contract data received from API:", data);

    return data;
  } catch (error) {
    console.error("💥 Error fetching Contract:", error);
    return null;
  }
};
