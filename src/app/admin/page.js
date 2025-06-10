// // File: src/app/admin/page.js
// 'use client';

// import { useEffect, useState } from 'react';
// import withAdminAuth from '@/utils/withAdminAuth';

// function AdminDashboard() {
//   const [pendingUsers, setPendingUsers] = useState([]);
//   const [error, setError] = useState('');

//   const fetchPendingUsers = async () => {
//     try {
//       const res = await fetch('/api/admin/pending-users');
//       const data = await res.json();
//       setPendingUsers(data.users);
//     } catch (err) {
//       setError('Failed to fetch pending users');
//     }
//   };

//   const handleApprove = async (userId) => {
//     try {
//       await fetch(`/api/admin/approve-user`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId }),
//       });
//       setPendingUsers(prev => prev.filter(user => user.id !== userId));
//     } catch (err) {
//       alert('Failed to approve user');
//     }
//   };

//   useEffect(() => {
//     fetchPendingUsers();
//   }, []);

//   return (
//     <div className="max-w-2xl mx-auto py-10">
//       <h1 className="text-2xl font-bold mb-6">🛡️ Admin Dashboard</h1>

//       {error && <p className="text-red-500">{error}</p>}

//       {pendingUsers.length === 0 ? (
//         <p>No pending users.</p>
//       ) : (
//         <ul className="space-y-4">
//           {pendingUsers.map(user => (
//             <li key={user.id} className="border p-4 rounded">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <p><strong>{user.name}</strong></p>
//                   <p className="text-sm text-gray-500">{user.email} ({user.role})</p>
//                 </div>
//                 <button
//                   onClick={() => handleApprove(user.id)}
//                   className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
//                 >
//                   Approve
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

// export default withAdminAuth(AdminDashboard);


'use client';

import { useEffect, useState } from 'react';
import withAdminAuth from '@/utils/withAdminAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);
  const [bids, setBids] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ... (fetchUsers, fetchWorkRequests, fetchBids, fetchSubmissions - these remain the same) ...
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/work-requests');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setWorkRequests(data.workRequests);
    } catch (err) {
      console.error('Failed to fetch work requests:', err);
      setError('Failed to fetch work requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/bids');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBids(data.bids);
    } catch (err) {
      console.error('Failed to fetch bids:', err);
      setError('Failed to fetch bids.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/submissions');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSubmissions(data.submissions);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  };

  // const handleApprove = async (userId) => {
  //   if (!confirm('Are you sure you want to approve this user?')) return;
  //   try {
  //     const res = await fetch(`/api/admin/approve-user`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ userId }),
  //     });
  //     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  //     fetchUsers();
  //     alert('User approved successfully!');
  //   } catch (err) {
  //     console.error('Failed to approve user:', err);
  //     alert('Failed to approve user.');
  //   }
  // };

  const handleApprove = async (userId) => {
    const confirmed = confirm('Are you sure you want to approve this user?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/approve-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      toast.success('User approved successfully!');
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Failed to approve user:', err);
      toast.error('Failed to approve user.');
    }
  };

  // const handleToggleAdminRole = async (userId, currentRole) => {
  //   const newRole = currentRole === 'ADMIN' ? 'EXPERT' : 'ADMIN';
  //   if (!confirm(`Are you sure you want to change ${userId}'s role to ${newRole}?`)) return;

  //   try {
  //     const res = await fetch(`/api/admin/users/${userId}/role`, {
  //       method: 'PATCH',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ role: newRole }),
  //     });
  //     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  //     fetchUsers();
  //     alert(`User role updated to ${newRole} successfully!`);
  //   } catch (err) {
  //     console.error('Failed to update user role:', err);
  //     alert('Failed to update user role.');
  //   }
  // };

  const handleToggleAdminRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'EXPERT' : 'ADMIN';

    const confirmed = confirm(`Are you sure you want to change ${userId}'s role to ${newRole}?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      toast.success(`User role updated to ${newRole} successfully!`);
      fetchUsers(); // Refresh the list after success
    } catch (err) {
      console.error('Failed to update user role:', err);
      toast.error('Failed to update user role.');
    }
  };


  // const handleResetPassword = async (userId, userEmail) => {
  //   const newPassword = prompt(`Enter new temporary password for ${userEmail}:`);
  //   if (!newPassword) {
  //     toast.error("Password reset cancelled or no password provided.");
  //     return;
  //   }

  //   if (newPassword.length < 8) {
  //     toast.error("New password must be at least 8 characters long.");
  //     return;
  //   }

  //   const confirmed = confirm(`Confirm new temporary password for ${userEmail}:\n\n"${newPassword}"`);
  //   if (!confirmed) return;

  //   const resetPromise = fetch(`/api/admin/users/${userId}/reset-password`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ newPassword }),
  //   });

  //   toast.promise(resetPromise, {
  //     loading: 'Resetting password...',
  //     success: async (res) => {
  //       if (!res.ok) {
  //         const errorData = await res.json();
  //         throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  //       }
  //       // Optional follow-up toast after success
  //       setTimeout(() => {
  //         toast(
  //           `IMPORTANT: Share this password "${newPassword}" securely with ${userEmail}`,
  //           { duration: 8000 }
  //         );
  //       }, 500);
  //       return `Password for ${userEmail} reset successfully.`;
  //     },
  //     error: (err) => `Failed to reset password: ${err.message}`,
  //   });
  // };


  const handleResetPassword = async (userId, userEmail) => {
    const newPassword = prompt(`Enter new temporary password for ${userEmail}:`);
    if (!newPassword) {
      toast.error("Password reset cancelled or no password provided.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    const confirmed = confirm(`Confirm new temporary password for ${userEmail}: "${newPassword}"`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      toast.success(`Password for ${userEmail} has been reset successfully.`);
      toast(
        `IMPORTANT: Share this password "${newPassword}" with ${userEmail} OUTSIDE of this system.`,
        { duration: 8000, icon: '⚠️' }
      );
    } catch (err) {
      console.error('Failed to reset password:', err);
      toast.error(`Failed to reset password: ${err.message}`);
    }
  };
  

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'workRequests') {
      fetchWorkRequests();
    } else if (activeTab === 'bids') {
      fetchBids();
    } else if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">🛡️ Admin Dashboard</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['users', 'workRequests', 'bids', 'submissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab === 'users' && 'User Management'}
              {tab === 'workRequests' && 'Work Requests'}
              {tab === 'bids' && 'Bids Overview'}
              {tab === 'submissions' && 'Submissions'}
            </button>
          ))}
        </nav>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-gray-600">Loading data...</p>}

      {activeTab === 'users' && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">User Management</h2>
          {!loading && users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.approved ? 'Yes' : 'No'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {!user.approved && user.role !== 'ADMIN' && (
                                        <button
                                            onClick={() => handleApprove(user.id)}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 mr-2"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleToggleAdminRole(user.id, user.role)}
                                        className={`${user.role === 'ADMIN' ? 'bg-yellow-600' : 'bg-indigo-600'} text-white px-3 py-1 rounded text-xs hover:${user.role === 'ADMIN' ? 'bg-yellow-700' : 'bg-indigo-700'} mr-2`}
                                    >
                                        {user.role === 'ADMIN' ? 'Demote to Expert' : 'Promote to Admin'}
                                    </button>
                                    <button
                                        onClick={() => handleResetPassword(user.id, user.email)}
                                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                                    >
                                        Reset Password
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </section>
      )}

      {/* Other tabs remain the same as before */}
      {activeTab === 'workRequests' && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Work Requests Overview</h2>
          {!loading && workRequests.length === 0 ? (
            <p>No work requests found.</p>
          ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Council</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {workRequests.map(req => (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.user?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.budget}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req._count.bids}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'bids' && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Bids Overview</h2>
          {!loading && bids.length === 0 ? (
            <p>No bids found.</p>
          ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Request</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expert</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bids.map(bid => (
                            <tr key={bid.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bid.workRequest?.title || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.user?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bid.message?.substring(0, 50)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {bid.acceptedIn ? 'Accepted' : 'Pending/Rejected'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(bid.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'submissions' && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Submissions Overview</h2>
          {!loading && submissions.length === 0 ? (
            <p>No submissions found.</p>
          ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Request</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expert</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {submissions.map(sub => (
                            <tr key={sub.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.bid?.workRequest?.title || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.bid?.user?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <a href={sub.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {sub.fileName}
                                    </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.message?.substring(0, 50)}...</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default withAdminAuth(AdminDashboard);