// File: src/app/submissions/page.js

'use client';

import { useState, useEffect } from 'react'; // Removed useMemo as it's not strictly needed for debounced value
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataCard from "../components/DataCard";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import WorkRequestModal from "../components/WorkRequestModal";
import { useTheme } from '@/context/ThemeProvider';
import clsx from 'clsx';
import { useHasMounted } from '@/hooks/useHasMounted';
import { FaSpinner } from 'react-icons/fa';
import FilterControls from '../components/FilterControls';

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

  // New state for search term
  const [searchTerm, setSearchTerm] = useState('');
  // Debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce by 500ms

  // Keep category and sortBy as before
  const [category, setCategory] = useState('ALL');
  // const [sortBy, setSortBy] = useState('newest');
  const [sortByField, setSortByField] = useState(searchParams.get('sortByField') || 'createdAt'); // Renamed from 'sortBy'
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc'); // New state for 'asc' or 'desc'


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

  // useEffect(() => {
  //   if (hasMounted) {
  //     // Update URL parameters for all filters including search
  //     const current = new URLSearchParams(Array.from(searchParams.entries()));

  //     // Update params for search, category, sortBy, and page
  //     if (searchTerm) {
  //       current.set('q', searchTerm);
  //     } else {
  //       current.delete('q');
  //     }

  //     if (category !== 'ALL') {
  //       current.set('category', category);
  //     } else {
  //       current.delete('category');
  //     }

  //     if (sortBy) {
  //       current.set('sortBy', sortBy);
  //     } else {
  //       current.delete('sortBy');
  //     }
      
  //     // Always update page
  //     current.set('page', String(page));


  //     const query = current.toString();
  //     const newUrl = query ? `?${query}` : '';
  //     router.replace(newUrl);
  //     window.scrollTo({ top: 0, behavior: 'smooth' });
  //   }
  // }, [page, searchTerm, category, sortBy, router, hasMounted, searchParams]); // Removed 'status' from dependencies

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

      // UPDATED: Set both sortByField and sortOrder
      current.set('sortByField', sortByField);
      current.set('sortOrder', sortOrder);
      
      // Always update page
      current.set('page', String(page));


      const query = current.toString();
      const newUrl = query ? `?${query}` : '';
      router.replace(newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, searchTerm, category, sortByField, sortOrder, router, hasMounted, searchParams]); // UPDATED DEPENDENCIES

  // Effect for fetching work requests - now depends on debouncedSearchTerm
  // useEffect(() => {
  //   if (!hasMounted || sessionStatus !== "authenticated") {
  //     if (workRequests.length > 0) {
  //       setWorkRequests([]);
  //       setTotalPages(1);
  //     }
  //     return;
  //   }

  //   const fetchWorkRequests = async () => {
  //     setLoading(true);
  //     try {
  //       const queryParams = new URLSearchParams({
  //         page,
  //         limit,
  //         status: 'OPEN', // <<< ALWAYS FETCH 'OPEN' WORK REQUESTS HERE
  //         ...(category !== 'ALL' && { category }),
  //         ...(sortBy && { sortBy }),
  //         ...(debouncedSearchTerm && { q: debouncedSearchTerm }), // Add debounced search term
  //       });

  //       const res = await fetch(`/api/workRequests?${queryParams.toString()}`);

  //       if (!res.ok) throw new Error("Failed to fetch work requests");

  //       const { data, pagination } = await res.json();
  //       setWorkRequests(data);
  //       setTotalPages(pagination.totalPages);
  //       setError(null);
  //     } catch (err) {
  //       console.error("Error fetching work requests:", err);
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchWorkRequests();
  // }, [page, limit, category, sortBy, debouncedSearchTerm, hasMounted, sessionStatus]); // Removed 'status' from dependencies

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
          // UPDATED: Pass both sortByField and sortOrder
          sortByField, // Pass the field
          sortOrder,   // Pass the order
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
  }, [page, limit, category, sortByField, sortOrder, debouncedSearchTerm, hasMounted, sessionStatus, workRequests.length]); // UPDATED DEPENDENCIES

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

      {/* Pass searchTerm and its setter to FilterControls */}
      {/* <FilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        // Removed status and setStatus from props
        category={category}
        setCategory={setCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      /> */}
      <FilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        category={category}
        setCategory={setCategory}
        sortByField={sortByField}   // NEW PROP
        setSortByField={setSortByField} // NEW PROP
        sortOrder={sortOrder}       // NEW PROP
        setSortOrder={setSortOrder} // NEW PROP
        // You might also need to pass availableCategories if you added that earlier
        // categories={availableCategories}
      />

      {/* Add Work Request Button */}
      {currentUser.role === 'COUNCIL' && (
        <div className="flex justify-end mb-6">
          <button
            onClick={async () => {
              setRedirecting(true);
              await new Promise(resolve => setTimeout(resolve, 100));
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