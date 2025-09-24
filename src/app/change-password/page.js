// src/app/change-password/page.js
'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname for safety
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const { data: session, update: updateSession, status } = useSession(); // Also get status
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Use useEffect to handle redirects based on session status
  useEffect(() => {
    // If session is still loading, do nothing
    if (status === 'loading') return;

    // If unauthenticated, redirect to login (if not already there)
    if (status === 'unauthenticated') {
      if (pathname !== '/login') { // Avoid infinite redirects if login page is /login
        router.push('/login');
      }
      return;
    }

    // If authenticated and password change is NOT required, redirect to submissions
    if (session?.user && !session.user.forcePasswordChange) {
      if (pathname !== '/submissions') {
        // console.log("Redirecting to /submissions from useEffect (password change complete).");
        router.push('/submissions');
      }
      return; // Stop further execution in this effect
    }

    // If authenticated and password change IS required, ensure user is on /change-password
    if (session?.user && session.user.forcePasswordChange) {
      if (pathname !== '/change-password') {
        // console.log("Redirecting to /change-password from useEffect (password change required).");
        router.push('/change-password');
      }
      return; // Stop further execution in this effect
    }

  }, [session, status, router, pathname]); // Dependencies

  // Render loading state while session is being fetched
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is authenticated and does not need to change password, or is unauthenticated (handled by useEffect),
  // prevent rendering the form until redirect takes place.
  if (status === 'authenticated' && !session.user.forcePasswordChange) {
    return null;
  }

  // If unauthenticated after loading, also return null to let useEffect handle redirect
  if (status === 'unauthenticated') {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully! Redirecting...');
      // Update the session: this will trigger the useEffect above to handle the redirect
      await updateSession({ forcePasswordChange: false });

      // No direct router.push here; let the useEffect handle it after session update
      return; // Stop further execution in handleSubmit

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🔒 Change Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You must change your password to continue.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="new-password" className="sr-only">New Password</label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm New Password</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}