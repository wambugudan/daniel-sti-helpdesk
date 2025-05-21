'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
// import DataCard from '@/app/components/DataCard';
import ContractCard from '@/app/components/ContractCard';
import ContractModal from '@/app/components/ContractModal';
import ModalListener from '@/app/components/ModalListener';


const MyContracts = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useCurrentUser();

  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    router.replace(`?page=${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, router]);


  useEffect(() => {
    if (!currentUser?.id) return;
  
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/contract/my-contracts?userId=${currentUser.id}&page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch contracts');
        const { data, total } = await res.json();
  
        setContracts(data);
        setTotalPages(Math.ceil(total / limit));
        setError(null);
      } catch (err) {
        console.error("Error fetching contracts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchContracts();
  }, [currentUser?.id, page, limit]); // Add limit to dependencies

  
  return (
    <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
      {/* Modal listener for handling the modal open */}
      <ModalListener currentUser={currentUser} />
      <h2 className="text-xl font-semibold mb-6">My Contracts</h2>
      {error && <p className="text-red-500">Error: {error}</p>}

      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm">Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">You don’t have any accepted contracts yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {contracts.map((contract) => (          
            <ContractCard
                key={contract.id}
                contract={contract}
                onView={async (req) => {
                    const res = await fetch(`/api/work-request/${req.id}`, {
                    headers: { 'x-user-id': currentUser.id },
                    });
                    const fullContract = await res.json();
                    setSelectedContract(fullContract);
                }}
            />

          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Contract Modal */}
      {selectedContract && (
        <ContractModal
          contract={selectedContract}
          currentUser={currentUser}
          onClose={() => setSelectedContract(null)}
          onCancelled={(id) => {
            setContracts(prev => prev.filter(c => c.id !== id));
            setSelectedContract(null);
          }}
        />
      )}

    </div>
  );
};

export default MyContracts;
