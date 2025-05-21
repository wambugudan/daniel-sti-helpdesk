// File: src/services/workRequestService.js

export const fetchWorkRequest = async (requestId, userId) => {
    try {
      const response = await fetch(`/api/work-request/${requestId}`, {
        headers: {
          "x-user-id": userId,
        },
      });
  
      if (!response.ok) {
        console.error("Failed to fetch Work Request");
        return null;
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching Work Request:", error);
      return null;
    }
  };
  