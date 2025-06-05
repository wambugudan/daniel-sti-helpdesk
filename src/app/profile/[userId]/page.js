// File: src/app/profile/[userId]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaSpinner, FaLinkedin, FaGithub, FaGlobe, FaEnvelope, FaBriefcase, FaBook } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

const UserProfilePage = () => {
    const { userId } = useParams();
    const router = useRouter();
    const { status: sessionStatus } = useSession();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (userId) {
            const fetchUserProfile = async () => {
                setLoading(true);
                setError(null);
                try {
                    const res = await fetch(`/api/profile/${userId}`);
                    if (!res.ok) {
                        if (res.status === 404) {
                            throw new Error('User not found.');
                        }
                        throw new Error('Failed to fetch user profile.');
                    }
                    const data = await res.json();
                    setProfileData(data);
                } catch (err) {
                    console.error("Fetch user profile error:", err);
                    setError(err.message || 'Could not load user profile.');
                } finally {
                    setLoading(false);
                }
            };
            fetchUserProfile();
        }
    }, [userId, sessionStatus, router]);

    if (sessionStatus === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-4xl text-gray-500" />
                <p className="ml-4 text-lg text-gray-700">Loading user profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                <p className="text-xl font-semibold">{error}</p>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-600">
                <p className="text-xl font-semibold">Profile data not available.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto my-6 p-6 bg-white shadow-md rounded-lg max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">{profileData.name || 'User Profile'}</h1>

            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-gray-100">
                    {profileData.image ? (
                        <img src={profileData.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-400 text-6xl flex items-center justify-center w-full h-full">👤</span>
                    )}
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">{profileData.name}</h2>
                <p className="text-gray-600 flex items-center gap-2">
                    <FaEnvelope /> {profileData.email}
                </p>
            </div>

            <div className="space-y-6">
                {profileData.areaOfProfessionalExperience && (
                    <div>
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <FaBriefcase className="text-blue-600" /> Area of Professional Experience
                        </h3>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                            {profileData.areaOfProfessionalExperience}
                        </p>
                    </div>
                )}

                {profileData.publications && (
                    <div>
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            <FaBook className="text-purple-600" /> Publications / Portfolio Links
                        </h3>
                        <div className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap">
                            {profileData.publications}
                        </div>
                    </div>
                )}

                {(profileData.linkedinUrl || profileData.githubUrl || profileData.websiteUrl) && (
                    <div>
                        <h3 className="text-xl font-semibold mb-2 border-b pb-2">Connect</h3>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {profileData.linkedinUrl && (
                                <a
                                    href={profileData.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-700 hover:underline hover:text-blue-800"
                                >
                                    <FaLinkedin className="text-xl" /> LinkedIn
                                </a>
                            )}
                            {profileData.githubUrl && (
                                <a
                                    href={profileData.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-gray-800 hover:underline hover:text-black"
                                >
                                    <FaGithub className="text-xl" /> GitHub
                                </a>
                            )}
                            {profileData.websiteUrl && (
                                <a
                                    href={profileData.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-green-600 hover:underline hover:text-green-700"
                                >
                                    <FaGlobe className="text-xl" /> Website
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={() => router.back()}
                className="mt-8 px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
            >
                Back
            </button>
        </div>
    );
};

export default UserProfilePage;