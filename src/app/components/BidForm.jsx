
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const BidForm = ({ currentUser, workRequest, onBidSubmitted }) => {
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [existingBid, setExistingBid] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchExistingBid = async () => {
    const res = await fetch("/api/check-bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, workRequestId: workRequest.id }),
    });
    const { bid } = await res.json();
    setExistingBid(bid);
    setBidAmount(bid?.amount || "");
    setBidMessage(bid?.message || "");
  };

  useEffect(() => {
    if (currentUser?.id && workRequest?.id) {
      fetchExistingBid();
    }
  }, [currentUser?.id, workRequest?.id]);


  const handleBidSubmit = async () => {
    if (!bidAmount) return alert("Bid amount is required");
    setIsSubmitting(true);
    try {
        const endpoint = isEditing ? "/api/bid/update" : "/api/bid";
        const method = isEditing ? "PUT" : "POST";

        const payload = {
        userId: currentUser.id,
        workRequestId: workRequest.id,
        amount: parseFloat(bidAmount),
        message: bidMessage,
        };

        if (isEditing && existingBid?.id) {
        payload.bidId = existingBid.id; // ✅ required by backend
        }

        const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to submit bid");

        toast.success(isEditing ? "Bid updated successfully!" : "Bid placed successfully!");
        setIsEditing(false);
        fetchExistingBid();
        if (onBidSubmitted) onBidSubmitted();
    } catch (error) {
        toast.error("Error submitting bid");
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
    };

    // Function to handle bid cancellation

    // const handleCancelBid = async () => {
    // if (!confirm("Are you sure you want to cancel your bid?")) return;
    // try {
    //     const res = await fetch("/api/bid/cancel", {
    //     method: "DELETE",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ userId: currentUser.id, workRequestId: workRequest.id }),
    //     });

    //     if (!res.ok) throw new Error("Failed to cancel bid");

    //     toast.success("Bid cancelled");
    //     setExistingBid(null);
    //     setBidAmount("");
    //     setBidMessage("");
    //     if (onBidSubmitted) onBidSubmitted();
    // } catch (error) {
    //     toast.error("Error cancelling bid");
    //     console.error("Cancel error:", error);
    // }
    // };

    const handleCancelBid = async () => {
        if (!confirm("Are you sure you want to cancel your bid?")) return;
        try {
          const res = await fetch("/api/bid/cancel", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bidId: existingBid.id,        // ✅ use the actual bid ID
              userId: currentUser.id,
            }),
          });
      
          if (!res.ok) throw new Error("Failed to cancel bid");
      
          toast.success("Bid cancelled");
          setExistingBid(null);
          setBidAmount("");
          setBidMessage("");
          if (onBidSubmitted) onBidSubmitted();
        } catch (error) {
          toast.error("Error cancelling bid");
          console.error("Cancel error:", error);
        }
    };
      

  return (
    <div className="mt-6 space-y-2">
      {existingBid && !isEditing ? (
        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 p-4 rounded-md text-sm">
          <p className="text-gray-700 dark:text-gray-300 mb-1">You already placed a bid:</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">${existingBid.amount}</p>
          {existingBid.message ? (
            <blockquote className="italic text-gray-600 dark:text-gray-400 border-l-4 border-blue-400 pl-4">
              “{existingBid.message}”
            </blockquote>
          ) : (
            <p className="italic text-gray-500">No message provided.</p>
          )}
          <div className="mt-3 flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-xs rounded bg-yellow-500 hover:bg-yellow-400 text-white"
            >
              ✏️ Edit Bid
            </button>
            <button
              onClick={handleCancelBid}
              className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white"
            >
              ❌ Cancel Bid
            </button>
          </div>
        </div>
      ) : (
        <>
          <input
            type="number"
            placeholder="Your bid amount"
            className="w-full px-3 py-2 border rounded"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
          <textarea
            placeholder="Message (optional)"
            className="w-full px-3 py-2 border rounded"
            value={bidMessage}
            onChange={(e) => setBidMessage(e.target.value)}
          />
          <button
            disabled={isSubmitting}
            onClick={handleBidSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 w-full"
          >
            {isSubmitting
              ? "Submitting..."
              : isEditing
              ? "Update Bid"
              : "Submit Bid"}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setBidAmount(existingBid.amount);
                setBidMessage(existingBid.message);
              }}
              className="w-full mt-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded"
            >
              Cancel Edit
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default BidForm;