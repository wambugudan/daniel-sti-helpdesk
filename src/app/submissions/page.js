// File: src/app/submissions/page.js
// This component fetches and displays work requests.
// It includes pagination, and a button to add new work requests.
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataCard from "../components/DataCard";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import WorkRequestModal from "../components/WorkRequestModal";
import { useTheme } from '@/context/ThemeProvider';
import clsx from 'clsx';
import { useHasMounted } from '@/hooks/useHasMounted';


const Submissions = () => {
  
  const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  

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

  // All for hydration
  const hasMounted = useHasMounted()
  if (!hasMounted) return null;

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

      {/* Note for Council */}
      {currentUser?.role === "COUNCIL" && (
        <div 
          // className={`mb-6 px-4 py-2 rounded-md border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 ${ theme === "dark" && "bg-blue-900 text-blue-100 transition-colors"}`}
          className={clsx(
            "mb-6 px-4 py-2 rounded-md",
            theme === "dark"
              ? "border-blue-700 bg-blue-900 text-blue-100"
              : "border-blue-300 bg-blue-50 text-blue-800"
          )}
        >
          💡 <strong>Note:</strong> Only <span className="font-semibold">open</span> work requests are shown here.
          To view all your work requests, visit{" "}
          <a
            href="/my-work-request"
            // className={`underline text-teal-600 hover:text-teal-900 ${ theme === "dark" && "text-teal-300 hover:text-teal-200 transition-colors"}`}
            className={`underline ${
              theme === "dark"
                ? "text-teal-300 hover:text-teal-200"
                : "text-teal-600 hover:text-teal-900"
            }`}
          >
            My Work Requests
          </a>.
        </div>
      )}


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
      ) : workRequests.length === 0 ? (
        currentUser.role === "COUNCIL" ? (
          <p className="text-center text-gray-600 mt-10">
            You have no <strong>open</strong> work requests at the moment.
            <br />
            Go to{" "}
            <a href="/my-work-request" className="underline text-blue-600 hover:text-blue-500">
              My Work Requests
            </a>{" "}
            to view all your submissions.
          </p>
        ) : (
          <p className="text-center text-gray-600 mt-10">No work requests available.</p>
        )
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {workRequests.map(request => (
            <DataCard
              key={request.id}
              workRequest={request}
              currentUser={currentUser}
              onView={async (req) => {
                const res = await fetch(`/api/work-request/${req.id}`, {
                  headers: { 'x-user-id': currentUser.id },
                });
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

