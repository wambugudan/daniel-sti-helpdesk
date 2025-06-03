// src/app/expert-profiles/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaLinkedin, FaGithub, FaGlobe, FaUserCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ExpertsPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Client-side authentication and authorization check
    if (sessionStatus === 'loading') return; // Still loading session

    if (sessionStatus === 'unauthenticated') {
      toast.error('You must be logged in to view this page.');
      router.push('/login');
      return;
    }

    // Based on your requirement, only 'COUNCIL' users can view this page.
    // Your schema has a 'role' enum with 'COUNCIL', 'EXPERT', 'ADMIN'.
    if (session.user.role !== 'COUNCIL') {
      toast.error('Access Denied: You do not have permission to view this page.');
      router.push('/'); // Redirect to home or a forbidden page
      return;
    }

    // Fetch experts if authenticated and authorized
    const fetchExperts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/expert-profiles'); // Calls the API route created above
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch expert profiles.');
        }
        const data = await res.json();
        setExperts(data);
      } catch (err) {
        console.error("Fetch experts error:", err);
        setError(err.message || 'Could not load expert profiles.');
        toast.error(err.message || 'Failed to load expert profiles.');
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [sessionStatus, session, router]); // Dependency array includes session and router

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Loading expert profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Only render content if user is authenticated and authorized as COUNCIL
  if (sessionStatus === 'authenticated' && session.user.role === 'COUNCIL') {
    return (
      <div className="container mx-auto my-6 p-6 bg-white shadow-md rounded-lg max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Approved Experts Profiles</h1>

        {experts.length === 0 ? (
          <p className="text-center text-gray-600">No expert profiles found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <div key={expert.id} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
                {expert.image ? (
                  <img
                    src={expert.image}
                    alt={expert.name || 'Expert Profile'}
                    className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-400"
                  />
                ) : (
                  <FaUserCircle className="w-24 h-24 text-gray-400 mb-4" />
                )}
                <h2 className="text-xl font-semibold mb-2">{expert.name || 'N/A'}</h2>
                <p className="text-gray-600 text-sm mb-2">
                  {expert.areaOfProfessionalExperience || 'No professional experience area specified.'}
                </p>
                {/* You can choose to display email if desired, it's fetched by the API */}
                <p className="text-gray-700 text-sm mb-4">Email: {expert.email || 'N/A'}</p>


                <div className="flex justify-center gap-4 mt-auto"> {/* Use mt-auto to push to bottom */}
                  {expert.linkedinUrl && (
                    <a href={expert.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
                      <FaLinkedin className="text-2xl" />
                    </a>
                  )}
                  {expert.githubUrl && (
                    <a href={expert.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-black">
                      <FaGithub className="text-2xl" />
                    </a>
                  )}
                  {expert.websiteUrl && (
                    <a href={expert.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                      <FaGlobe className="text-2xl" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null; // Fallback if session is still loading or unauthorized, though redirects handle most cases
};

export default ExpertsPage;