// File: src/utils/withAdminAuth.js
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// You can create a simple Loading component or use a direct message
const LoadingComponent = () => (
  <div className="text-center py-20 text-gray-500">Checking access...</div>
);

export default function withAdminAuth(Component) {
  return function ProtectedAdminPage(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      // If session is still loading, do nothing yet.
      if (status === 'loading') {
        return;
      }

      // If there's no session or the user is not an ADMIN, redirect.
      if (!session || session.user.role !== 'ADMIN') {
        // You can choose to redirect to /login or /unauthorized
        router.push('/unauthorized'); // Or '/login?message=unauthorized'
      }
    }, [status, session, router]); // Dependencies to re-run the effect

    // While loading, show a loading indicator.
    if (status === 'loading') {
      return <LoadingComponent />;
    }

    // If the session exists and the user is an admin, render the component.
    if (session && session.user.role === 'ADMIN') {
      return <Component {...props} />;
    }

    // If we've reached here, it means the user is not an admin,
    // and they are in the process of being redirected by the useEffect.
    // We can return null or a simple message here as a fallback,
    // as the redirect should take over.
    return null; // Or <p>Access Denied. Redirecting...</p>
  };
}