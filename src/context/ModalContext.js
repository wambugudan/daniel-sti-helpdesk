"use client";

import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalContract, setModalContract] = useState(null);

  const openModal = (contract) => setModalContract(contract);
  const closeModal = () => setModalContract(null);

  return (
    <ModalContext.Provider value={{ modalContract, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
