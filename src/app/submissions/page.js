'use client'

import {useState, useEffect} from 'react'
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/utils/firebase"
import DataCard from "../components/DataCard"


const Submissions = () => {

  // Setting up variable to store work requests
  const [workRequests, setWorkRequests] = useState([])

  // Setting up a useEffect to allow for the component to interact with db
  useEffect(() => {
    const fetchWorkRequest = async () => {
      const quertSnapshot = await getDocs(collection(db, "work_requests"))
      const request = quertSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      setWorkRequests(request)
    }

    fetchWorkRequest()
  }, [])

   // Displaying the data cards
    return(
      <div className="container mx-auto my-6 px-4 md:px-6 lg:px-8">
        <div className=" grid grid-cols-1 gap-8">
          {
            workRequests.map(request => (
              <DataCard 
                key={request.id} 
                workRequest={request} 
              />
            ))
          }
        </div>
      </div>
    )
}

export default Submissions