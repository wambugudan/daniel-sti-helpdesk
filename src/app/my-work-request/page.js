// File: src/app/my-work-request/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataCard from "../components/DataCard";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import WorkRequestModal from "../components/WorkRequestModal";
import ModalListener from '../components/ModalListener';
import { FaSpinner } from 'react-icons/fa';
import clsx from "clsx";


const MyWorkRequest = () => {
  // const { currentUser } = useCurrentUser();
  const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
  

  const router = useRouter();
  const searchParams = useSearchParams();

  const [workRequests, setWorkRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [redirecting, setRedirecting] = useState(false);

  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    router.replace(`?page=${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, router]);

  useEffect(() => {
    const fetchWorkRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/my-work-requests?userId=${currentUser.id}&page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error("Failed to fetch work requests");

        const { data, total } = await res.json();
        setWorkRequests(data);
        setTotalPages(Math.ceil(total / limit));
        setError(null);
      } catch (err) {
        console.error("Error fetching my work requests:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) fetchWorkRequests();
  }, [currentUser, page, limit]);

  return (
    <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
      {/* Modal listener for handling the modal open */}
      <ModalListener currentUser={currentUser} />
      {error && <p className="text-red-500">Error: {error}</p>}

      <h2 className="text-xl font-semibold mb-6">My Work Requests</h2>

      {/* Add Work Request Button */}
      {currentUser?.role === 'COUNCIL' && (
        <div className="flex justify-end mb-6">
          
          <button
            onClick={async () => {
              setRedirecting(true);
              await new Promise(resolve => setTimeout(resolve, 100)); // Optional: delay for animation
              router.push('/new-work-request');
            }}
            disabled={redirecting}
            className={clsx(
              "font-medium px-6 py-2 rounded-md shadow-md transition duration-300",
              redirecting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark text-white"
            )}
          >
            
            {redirecting ? (
              <div className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                Loading...
              </div>
            ) : (
              "+ Add New Work Request"
            )}
          </button>

        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm">Loading work requests...</div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {workRequests.map(request => (
            <DataCard
              key={request.id}
              workRequest={request}
              currentUser={currentUser}
              showStatus={true}
              onView={async (req) => {
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

export default MyWorkRequest;
