// File: src/app/new-work-request/page.jsx
// import WorkRequestForm from "@/app/components/workRequestForm";

// const NewWorkRequestPage = () => {
//   return (
//     <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
//       <h1 className="text-2xl font-bold mb-4">Create New Work Request</h1>
//       <WorkRequestForm requestId="new" />
//     </div>
//   );
// };

// export default NewWorkRequestPage;


'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import WorkRequestForm from '@/app/components/workRequestForm';

const NewWorkRequestPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Only render form if authenticated
  if (status !== 'authenticated') {
    return null; // or loading UI
  }

  return (
    <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4">Create New Work Request</h1>
      <WorkRequestForm requestId="new" />
    </div>
  );
};

export default NewWorkRequestPage;
