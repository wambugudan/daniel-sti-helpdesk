// File: src/app/admin/page.js
'use client';

import { useEffect, useState } from 'react';
import withAdminAuth from '@/utils/withAdminAuth';

function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('/api/admin/pending-users');
      const data = await res.json();
      setPendingUsers(data.users);
    } catch (err) {
      setError('Failed to fetch pending users');
    }
  };

  const handleApprove = async (userId) => {
    try {
      await fetch(`/api/admin/approve-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">🛡️ Admin Dashboard</h1>

      {error && <p className="text-red-500">{error}</p>}

      {pendingUsers.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        <ul className="space-y-4">
          {pendingUsers.map(user => (
            <li key={user.id} className="border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>{user.name}</strong></p>
                  <p className="text-sm text-gray-500">{user.email} ({user.role})</p>
                </div>
                <button
                  onClick={() => handleApprove(user.id)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAdminAuth(AdminDashboard);
