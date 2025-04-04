// src/hooks/useCurrentUser.js
'use client';
import { useEffect, useState } from "react";

const mockUsers = [
  { id: "user-council-01", name: "Alice Muthoni", email: "alice.muthoni@gov.ke", role: "COUNCIL" },
  { id: "user-council-02", name: "Samuel Otieno", email: "samuel.otieno@gov.ke", role: "COUNCIL" },
  { id: "user-expert-01", name: "Jane Mwikali", email: "jane.mwikali@freelance.co.ke", role: "EXPERT" },
  { id: "user-expert-02", name: "Tom Barasa", email: "tom.barasa@devhub.co.ke", role: "EXPERT" },
];

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(mockUsers[0]);

  // Load user from localStorage (on initial load)
  useEffect(() => {
    const storedUserId = localStorage.getItem("mockUserId");
    if (storedUserId) {
      const user = mockUsers.find(u => u.id === storedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, []);

  // Save user to localStorage (when it changes)
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem("mockUserId", currentUser.id);
    }
  }, [currentUser]);

  return { currentUser, setCurrentUser, allUsers: mockUsers };
};