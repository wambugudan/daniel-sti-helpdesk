// File: src/app/submissions/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataCard from "../components/DataCard";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import WorkRequestModal from "../components/WorkRequestModal";
import { useTheme } from '@/context/ThemeProvider';
import clsx from 'clsx';
import { useHasMounted } from '@/hooks/useHasMounted';
import { FaSpinner, FaPlus } from 'react-icons/fa'; // Added FaPlus
import FilterControls from '../components/FilterControls';
import ModalListener from '@/app/components/ModalListener';

// Custom hook for debouncing a value
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


const Submissions = () => {
  const hasMounted = useHasMounted();
  const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
  const { data: session, status: sessionStatus } = useSession();
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

  const [redirecting, setRedirecting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [category, setCategory] = useState('ALL');
  const [sortByField, setSortByField] = useState(searchParams.get('sortByField') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  // --- NEW: Get requestId from URL search params ---
  const notificationRequestId = searchParams.get('requestId');
  // --- NEW: State to track if we've attempted to open the modal from URL ---
  const [hasOpenedModalFromUrl, setHasOpenedModalFromUrl] = useState(false);

  // --- NEW: Get submission and message flags from URL search params ---
  const submissionFlag = searchParams.get('submission') === 'true';
  const messageFlag = searchParams.get('message') === 'true';


  // --- Effects for side actions and data fetching ---

  useEffect(() => {
    if (session) {
      console.log("✅ User Role:", session.user.role);
      console.log("✅ User ID:", session.user.id);
    } else {
      console.log("❌ Not logged in");
    }
  }, [session]);

  useEffect(() => {
    if (hasMounted && sessionStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [hasMounted, sessionStatus, router]);

  
  useEffect(() => {
    if (hasMounted) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      if (searchTerm) {
        current.set('q', searchTerm);
      } else {
        current.delete('q');
      }

      if (category !== 'ALL') {
        current.set('category', category);
      } else {
        current.delete('category');
      }

      current.set('sortByField', sortByField);
      current.set('sortOrder', sortOrder);
      
      // Always update page
      current.set('page', String(page));

      // --- NEW: Remove requestId from URL after processing ---
      // We don't want to keep it in the URL if the user navigates within the page
      // It's mainly for the initial landing from a notification.
      if (current.has('requestId')) {
        current.delete('requestId');
      }
      if (current.has('submission')) { // Also clear submission/message flags
        current.delete('submission');
      }
      if (current.has('message')) {
        current.delete('message');
      }


      const query = current.toString();
      const newUrl = query ? `?${query}` : '';
      router.replace(newUrl); // Use router.replace to avoid adding to history unnecessarily
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, searchTerm, category, sortByField, sortOrder, router, hasMounted, searchParams]);


  // --- MODIFIED: Fetch Work Requests and Handle Auto-Open Modal ---
  useEffect(() => {
    if (!hasMounted || sessionStatus !== "authenticated") {
      if (workRequests.length > 0) {
        setWorkRequests([]);
        setTotalPages(1);
      }
      return;
    }

    const fetchWorkRequests = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit,
          status: 'OPEN',
          ...(category !== 'ALL' && { category }),
          sortByField,
          sortOrder,
          ...(debouncedSearchTerm && { q: debouncedSearchTerm }),
        });

        const res = await fetch(`/api/workRequests?${queryParams.toString()}`);

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
  }, [page, limit, category, sortByField, sortOrder, debouncedSearchTerm, hasMounted, sessionStatus, workRequests.length]); // Removed workRequests.length from deps as it can cause infinite loop

  // --- NEW EFFECT: Handle opening modal from URL parameter ---
  useEffect(() => {
    // Ensure user is authenticated, component is mounted, and we haven't tried to open it yet
    if (hasMounted && sessionStatus === "authenticated" && notificationRequestId && !hasOpenedModalFromUrl && currentUser?.id) {
      const openWorkRequestFromUrl = async () => {
        try {
          // Fetch the specific work request
          const res = await fetch(`/api/work-request/${notificationRequestId}`, {
            headers: { 'x-user-id': currentUser.id }, // Make sure your API expects this header
          });

          if (!res.ok) {
            console.error("Failed to fetch work request for notification:", await res.text());
            throw new Error("Failed to fetch work request for notification");
          }

          const fullRequest = await res.json();
          setSelectedRequest(fullRequest); // Open the modal
          setHasOpenedModalFromUrl(true); // Mark as attempted
          // You might also want to scroll to a specific section if 'submission' or 'message' is present
          // For now, we just open the modal.
          
          // Optional: Clear the requestId from the URL after it's handled
          // This avoids the modal re-opening if the user refreshes the page manually
          // However, we already clear it in the main useEffect for URL params, so this might be redundant.
          // const current = new URLSearchParams(Array.from(searchParams.entries()));
          // current.delete('requestId');
          // router.replace(`?${current.toString()}`);

        } catch (err) {
          console.error("Error opening work request from notification link:", err);
          // Optionally show a toast error to the user
        }
      };
      openWorkRequestFromUrl();
    }
  }, [hasMounted, sessionStatus, notificationRequestId, hasOpenedModalFromUrl, currentUser?.id]);


  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Redirecting to login...</p>
      </div>
    );
  }

  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Loading component...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
      {/* Modal listener for handling the modal open */}
      <ModalListener currentUser={currentUser} />
      {error && <p className="text-red-500">Error: {error}</p>}

      {currentUser?.role === "COUNCIL" && (
        <div
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

      <FilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        category={category}
        setCategory={setCategory}
        sortByField={sortByField}
        setSortByField={setSortByField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {currentUser.role === 'COUNCIL' && (
        <div className="flex justify-end mb-6">
          <button
            onClick={async () => {
              setRedirecting(true);
              await new Promise(resolve => setTimeout(resolve, 10));
              router.push('/new-work-request');
            }}
            disabled={redirecting}
            className={clsx(
              "font-medium px-6 py-2 rounded-md shadow-md transition duration-300",
              redirecting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark text-white",
              "hidden md:block" // Hidden on small screens, block on medium and up
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
          <button
            onClick={async () => {
              setRedirecting(true);
              await new Promise(resolve => setTimeout(resolve, 5));
              router.push('/new-work-request');
            }}
            disabled={redirecting}
            className={clsx(
              "font-medium px-4 py-2 rounded-full shadow-md transition duration-300",
              redirecting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark text-white",
              "block md:hidden" // Block on small screens, hidden on medium and up
            )}
            aria-label="Add New Work Request" // Accessibility for icon button
          >
            {redirecting ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPlus />
            )}
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
          submissionFlag={submissionFlag}
          messageFlag={messageFlag}
        />
      )}
    </div>
  );
};

export default Submissions;