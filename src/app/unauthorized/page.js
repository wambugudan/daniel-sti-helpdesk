export default function UnauthorizedPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <a href="/" className="mt-6 inline-block text-blue-600 underline">
        Return to homepage
      </a>
    </div>
  );
}
