// File: src/hooks/useCurrentUser.js
'use client';

import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const { data: session, status } = useSession();

  const currentUser = status === "authenticated" ? session.user : null;
  const setCurrentUser = () => {}; // no-op or remove if unused
  const allUsers = []; // empty or fetch from backend if needed

  return { currentUser, setCurrentUser, allUsers, isLoaded: status === "authenticated" };
};
