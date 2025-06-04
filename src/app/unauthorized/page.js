// // File: src/app/unauthorized/page.js
// export default function UnauthorizedPage() {
//   return (
//     <div className="text-center py-20">
//       <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
//       <p>You do not have permission to view this page.</p>
//       <a href="/" className="mt-6 inline-block text-blue-600 underline">
//         Return to homepage
//       </a>
//     </div>
//   );
// }


// File: src/app/unauthorized/page.js
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
      <p className="text-lg text-gray-800 mb-8 text-center">
        You do not have the necessary permissions to view this page.
      </p>
      <Link href="/" className="px-6 py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition duration-300">
        Go to Home
      </Link>
      <Link href="/login" className="mt-4 text-primary hover:underline">
        Login as a different user
      </Link>
    </div>
  );
}