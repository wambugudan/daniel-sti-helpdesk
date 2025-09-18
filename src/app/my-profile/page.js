// File: src/app/my-profile/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaUpload, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

const MyProfilePage = () => {
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const router = useRouter();

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // State for tabs
  const [activeTab, setActiveTab] = useState('profile');

  // State for profile data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    image: '',
    areaOfProfessionalExperience: '',
    publications: '',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
  });

  // State for password change form
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [file, setFile] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (sessionStatus === 'authenticated' && session?.user?.id) {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch('/api/profile');
          if (!res.ok) throw new Error('Failed to fetch profile data');
          const data = await res.json();
          setProfileData({
            name: data.name || '',
            email: data.email || '',
            image: data.image || '',
            areaOfProfessionalExperience: data.areaOfProfessionalExperience || '',
            publications: data.publications || '',
            linkedinUrl: data.linkedinUrl || '',
            githubUrl: data.githubUrl || '',
            websiteUrl: data.websiteUrl || '',
          });
        } catch (err) {
          setError(err.message || 'Could not load profile.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [sessionStatus, session?.user?.id]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProfileData((prev) => ({ ...prev, image: URL.createObjectURL(e.target.files[0]) }));
    }
  };


  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setError('');

    let imageUrl = profileData?.image || null;

    // If a new file has been selected, upload it to the server API route first.
    if (file) {
      const formData = new FormData();
      formData.append('file', file); // 'file' matches the name expected by your API route
      formData.append('bucket', 'profiles'); // 'profiles' matches the bucket name

      try {
        const uploadRes = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Failed to upload image.');
        }

        const uploadResult = await uploadRes.json();
        imageUrl = uploadResult.fileURL;
        toast.success('Profile picture updated!');
      } catch (uploadError) {
        setError(uploadError.message || 'Failed to upload profile picture.');
        setIsUpdatingProfile(false);
        return;
      }
    }

    // Then, update the user profile in your database with the new image URL.
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          image: imageUrl, // Use the new imageUrl from the upload step
          areaOfProfessionalExperience: profileData.areaOfProfessionalExperience,
          publications: profileData.publications,
          linkedinUrl: profileData.linkedinUrl,
          githubUrl: profileData.githubUrl,
          websiteUrl: profileData.websiteUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      const updatedUser = await res.json();
      setProfileData(updatedUser);
      toast.success('Profile updated successfully!');
      await updateSession();
    } catch (err) {
      console.error('Profile update error:', err.message);
      setError(err.message || 'Failed to update profile.');
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
      setFile(null);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordError(null);

    if (!passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmNewPassword) {
      setPasswordError('All password fields are required.');
      setIsChangingPassword(false);
      return;
    }
    if (passwordFields.newPassword !== passwordFields.confirmNewPassword) {
      setPasswordError('New password and confirmation do not match.');
      setIsChangingPassword(false);
      return;
    }
    if (passwordFields.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      setIsChangingPassword(false);
      return;
    }

    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordFields),
      });
      if (!res.ok) throw new Error('Failed to change password.');
      toast.success('Password changed successfully! Please log in again.');
      await signOut({ callbackUrl: '/login' });
    } catch (err) {
      setPasswordError(err.message || 'Could not change password.');
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
      setPasswordFields({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
        <p className="ml-4 text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated' && !loading) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>You need to be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-6 p-6 bg-white shadow-md rounded-lg max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === 'password' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center">
                {profileData.image ? (
                  <img src={profileData.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUpload className="text-gray-400 text-5xl" />
                )}
              </div>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <span className="text-sm text-gray-600">Click image to change profile picture</span>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name || ''}
              onChange={handleProfileInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email || ''}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Area of Professional Experience */}
          <div>
            <label htmlFor="areaOfProfessionalExperience" className="block text-sm font-medium text-gray-700">
              Area of Professional Experience
            </label>
            <textarea
              id="areaOfProfessionalExperience"
              name="areaOfProfessionalExperience"
              value={profileData.areaOfProfessionalExperience || ''}
              onChange={handleProfileInputChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>

          {/* Publications */}
          <div>
            <label htmlFor="publications" className="block text-sm font-medium text-gray-700">Publications / Portfolio</label>
            <textarea
              id="publications"
              name="publications"
              value={profileData.publications || ''}
              onChange={handleProfileInputChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>

          {/* Social Media */}
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaLinkedin className="text-blue-700" /> LinkedIn
            </label>
            <input
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              value={profileData.linkedinUrl || ''}
              onChange={handleProfileInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaGithub /> GitHub
            </label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={profileData.githubUrl || ''}
              onChange={handleProfileInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaGlobe className="text-green-600" /> Website
            </label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={profileData.websiteUrl || ''}
              onChange={handleProfileInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdatingProfile ? <FaSpinner className="animate-spin mr-2" /> : 'Save Profile'}
          </button>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChangeSubmit} className="space-y-6">
          {passwordError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {passwordError}</span>
            </div>
          )}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordFields.currentPassword}
              onChange={handlePasswordInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordFields.newPassword}
              onChange={handlePasswordInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={passwordFields.confirmNewPassword}
              onChange={handlePasswordInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {isChangingPassword ? <FaSpinner className="animate-spin mr-2" /> : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default MyProfilePage;
