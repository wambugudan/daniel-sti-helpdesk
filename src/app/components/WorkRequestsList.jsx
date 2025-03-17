import { useEffect, useState } from "react";
import DataCard from "./DataCard"; // Ensure this is correctly imported

const WorkRequestsList = () => {
  const [workRequests, setWorkRequests] = useState([]);

  useEffect(() => {
    fetch("/api/workRequests")
      .then((res) => res.json())
      .then((data) => setWorkRequests(data))
      .catch((error) => console.error("Error fetching work requests:", error));
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workRequests.length > 0 ? (
        workRequests.map((workRequest) => (
          <DataCard key={workRequest.id} workRequest={workRequest} />
        ))
      ) : (
        <p>No work requests available</p>
      )}
    </div>
  );
};

export default WorkRequestsList;
