// // src/hooks/useCurrentUser.js
// 'use client';
// import { useEffect, useState } from "react";

// const mockUsers = [
//   { id: "user-council-01", name: "Alice Muthoni", email: "alice.muthoni@gov.ke", role: "COUNCIL" },
//   { id: "user-council-02", name: "Samuel Otieno", email: "samuel.otieno@gov.ke", role: "COUNCIL" },
//   { id: "user-expert-01", name: "Jane Mwikali", email: "jane.mwikali@freelance.co.ke", role: "EXPERT" },
//   { id: "user-expert-02", name: "Tom Barasa", email: "tom.barasa@devhub.co.ke", role: "EXPERT" },
// ];


// export const useCurrentUser = () => {
//   const [currentUser, setCurrentUser] = useState(null); // <-- Start with null
//   const [isLoaded, setIsLoaded] = useState(false); // New flag

//   useEffect(() => {
//     const storedUserId = localStorage.getItem("mockUserId");
//     const user = mockUsers.find(u => u.id === storedUserId) || mockUsers[0];
//     setCurrentUser(user);
//     setIsLoaded(true); // Done loading
//   }, []);

//   useEffect(() => {
//     if (currentUser?.id) {
//       localStorage.setItem("mockUserId", currentUser.id);
//     }
//   }, [currentUser]);

//   return { currentUser, setCurrentUser, allUsers: mockUsers, isLoaded };
// };


'use client';

import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const { data: session, status } = useSession();

  const currentUser = status === "authenticated" ? session.user : null;
  const setCurrentUser = () => {}; // no-op or remove if unused
  const allUsers = []; // empty or fetch from backend if needed

  return { currentUser, setCurrentUser, allUsers, isLoaded: status === "authenticated" };
};
