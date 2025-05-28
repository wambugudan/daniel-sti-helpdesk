'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function withAdminAuth(Component) {
  return function ProtectedAdminPage(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;

      if (!session || session.user.role !== 'ADMIN') {
        router.push('/unauthorized'); // Create this page to show a 403 message
      }
    }, [status, session, router]);

    if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
      return <div className="text-center py-20 text-gray-500">Checking access...</div>;
    }

    return <Component {...props} />;
  };
}
