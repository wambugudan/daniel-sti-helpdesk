'use client'

import { useState, useEffect } from 'react'
import DataCard from "../components/DataCard"

const Submissions = () => {
  const [workRequests, setWorkRequests] = useState([])
  const [error, setError] = useState(null)

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
      <div className="grid grid-cols-1 gap-8">
        {workRequests.map(request => (
          <DataCard key={request.id} workRequest={request} />
        ))}
      </div>
    </div>
  )
}

export default Submissions
