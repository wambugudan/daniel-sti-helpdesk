'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react'; // Import signOut
import { useRouter } from 'next/navigation';
import { FaSpinner, FaUpload, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyProfilePage = () => {
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const router = useRouter();

  // State for general profile data
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
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false); // Distinct state for profile update
  const [isChangingPassword, setIsChangingPassword] = useState(false); // Distinct state for password change
  const [error, setError] = useState(null); // General error
  const [passwordError, setPasswordError] = useState(null); // Specific error for password change
  const [file, setFile] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (sessionStatus === 'authenticated' && session?.user?.id) {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch('/api/profile');
          if (!res.ok) {
            throw new Error('Failed to fetch profile data');
          }
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
          console.error("Fetch profile error:", err);
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
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFields(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProfileData(prev => ({ ...prev, image: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setError(null); // Clear general errors

    let imageUrl = profileData.image;

    // Step 1: Upload the profile picture if a new file is selected
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.message || 'Failed to upload image.');
        }
        const uploadResult = await uploadRes.json();
        imageUrl = uploadResult.url;
        toast.success('Profile picture uploaded!');
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        setError(uploadError.message || 'Failed to upload profile picture.');
        setIsUpdatingProfile(false);
        return;
      }
    }

    // Step 2: Update the user's profile in the database
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          image: imageUrl,
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
      await updateSession(); // Refresh NextAuth session
    } catch (updateError) {
      console.error("Profile update error:", updateError);
      setError(updateError.message || 'Could not update profile.');
      toast.error(updateError.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
      setFile(null); // Clear file input after submission
    }
  };

  // --- NEW: Handle Password Change ---
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordError(null); // Clear password-specific errors

    // Client-side validation
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
    if (passwordFields.newPassword.length < 6) { // Example: min length
        setPasswordError('New password must be at least 6 characters long.');
        setIsChangingPassword(false);
        return;
    }

    try {
      const res = await fetch('/api/profile/change-password', { // Call the new password change API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordFields),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to change password.');
      }

      toast.success('Password changed successfully! Please log in again.');
      // Optional: Force logout to invalidate current session and require re-login
      await signOut({ callbackUrl: '/login' }); // Redirect to login page after sign out
    } catch (err) {
      console.error("Password change error:", err);
      setPasswordError(err.message || 'Could not change password.');
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
      // Clear password fields regardless of success/failure for security
      setPasswordFields({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
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

      {/* General Profile Update Form */}
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Personal Details & Links</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      <form onSubmit={handleProfileSubmit} className="space-y-6 mb-10">
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
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Your full name"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email || ''}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Area of Professional Experience */}
        <div>
          <label htmlFor="areaOfProfessionalExperience" className="block text-sm font-medium text-gray-700">Area of Professional Experience</label>
          <textarea
            id="areaOfProfessionalExperience"
            name="areaOfProfessionalExperience"
            value={profileData.areaOfProfessionalExperience || ''}
            onChange={handleProfileInputChange}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="e.g., Software Development, Civil Engineering, Marketing, Healthcare"
          ></textarea>
        </div>

        {/* Publications */}
        <div>
          <label htmlFor="publications" className="block text-sm font-medium text-gray-700">Publications / Portfolio Links</label>
          <textarea
            id="publications"
            name="publications"
            value={profileData.publications || ''}
            onChange={handleProfileInputChange}
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="List your publications, research papers, or links to your portfolio/projects, separated by commas or new lines."
          ></textarea>
        </div>

        {/* Social Media Links */}
        <h3 className="text-xl font-semibold mt-8 mb-4 border-b pb-2">Social Media & Links</h3>

        {/* LinkedIn URL */}
        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">
            <FaLinkedin className="inline-block mr-2 text-blue-700" /> LinkedIn Profile URL
          </label>
          <input
            type="url"
            id="linkedinUrl"
            name="linkedinUrl"
            value={profileData.linkedinUrl || ''}
            onChange={handleProfileInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">
            <FaGithub className="inline-block mr-2" /> GitHub Profile URL
          </label>
          <input
            type="url"
            id="githubUrl"
            name="githubUrl"
            value={profileData.githubUrl || ''}
            onChange={handleProfileInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="https://github.com/yourusername"
          />
        </div>

        {/* Personal Website/Portfolio URL */}
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
            <FaGlobe className="inline-block mr-2 text-green-600" /> Personal Website / Portfolio URL
          </label>
          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            value={profileData.websiteUrl || ''}
            onChange={handleProfileInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="https://yourwebsite.com"
          />
        </div>

        {/* Submit Profile Button */}
        <button
          type="submit"
          disabled={isUpdatingProfile}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdatingProfile ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            'Save Profile Details'
          )}
        </button>
      </form>

      {/* --- NEW: Password Change Form --- */}
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2 pt-6">Change Password</h2>
      {passwordError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {passwordError}</span>
        </div>
      )}
      <form onSubmit={handlePasswordChangeSubmit} className="space-y-6">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={passwordFields.currentPassword}
            onChange={handlePasswordInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChangingPassword ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            'Change Password'
          )}
        </button>
      </form>
    </div>
  );
};

export default MyProfilePage;