'use client'

// This file is a Next.js page component that fetches and displays work requests.
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DataCard from "../components/DataCard"

const Submissions = () => {
  const [workRequests, setWorkRequests] = useState([])
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchWorkRequests = async () => {
      try {
        const response = await fetch('/api/workRequests')

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`) 
        }

        const data = await response.json()
        setWorkRequests(data)
      } catch (error) {
        console.error("Error fetching work requests:", error)
        setError(error.message)
      }
    }

    fetchWorkRequests()
  }, [])

  return (
    <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Button section added without breaking the theme */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => router.push('/new-work-request')}
          className="bg-primary text-white font-medium px-6 py-2 rounded-md shadow-md hover:bg-primary-dark transition"
        >
          + Add New Work Request
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {workRequests.map(request => (
          <DataCard key={request.id} workRequest={request} />
        ))}
      </div>
    </div>
  )
}

export default Submissions
