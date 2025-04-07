// File: src/app/submissions/page.js
// This component fetches and displays work requests.
// It includes pagination, and a button to add new work requests.
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataCard from "../components/DataCard";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import WorkRequestModal from "../components/WorkRequestModal";

const Submissions = () => {
  const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [workRequests, setWorkRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);

  // Sync URL with current page
  useEffect(() => {
    router.replace(`?page=${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, router]);

  useEffect(() => {
    const fetchWorkRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/workRequests?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error("Failed to fetch work requests");

        const { data, pagination } = await res.json();
        setWorkRequests(data);
        setTotalPages(pagination.totalPages);
        setError(null);
      } catch (err) {
        console.error("Error fetching work requests:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkRequests();
  }, [page, limit]);

  return (
    <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* 🔁 Switch User Dropdown */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium">Switch User:</label>
        <select
          className="border px-3 py-1 rounded"
          value={currentUser.id}
          onChange={(e) => {
            const selected = allUsers.find(user => user.id === e.target.value);
            setCurrentUser(selected);
          }}
        >
          {allUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </div>

      {/* Add Work Request Button */}
      {currentUser.role === 'COUNCIL' && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => router.push('/new-work-request')}
            className="bg-primary text-white font-medium px-6 py-2 rounded-md shadow-md hover:bg-primary-dark transition"
          >
            + Add New Work Request
          </button>
        </div>
      )}

      {/* Work Requests */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm">Loading work requests...</div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {workRequests.map(request => (
            <DataCard
              key={request.id}
              workRequest={request}
              currentUser={currentUser}
              // onView={(req) => setSelectedRequest(req)}
              onView={async (req) => {
                // const res = await fetch(`/api/work-request/${req.id}`);
                const res = await fetch(`/api/work-request/${req.id}`, {
                  headers: {
                    'x-user-id': currentUser.id, // send user ID to backend for filtering
                  },
                })
                const fullRequest = await res.json();
                setSelectedRequest(fullRequest);
              }}
              
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page <= 1}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm">Page</span>
          <input
            type="number"
            value={page}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val > 0 && val <= totalPages) {
                setPage(val);
              }
            }}
            className="w-16 border rounded px-2 py-1 text-center"
          />
          <span className="text-sm">of {totalPages || 1}</span>
        </div>

        <button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {selectedRequest && (
        <WorkRequestModal
          workRequest={selectedRequest}
          currentUser={currentUser}
          onClose={() => setSelectedRequest(null)}
          onDeleted={(id) => {
            setWorkRequests(prev => prev.filter(req => req.id !== id));
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default Submissions;

