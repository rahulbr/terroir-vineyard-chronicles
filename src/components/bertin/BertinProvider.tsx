
import React, { createContext, useContext, useState } from 'react';
import { BertinChatbot } from './BertinChatbot';

type BertinContextType = {
  openBertin: () => void;
  closeBertin: () => void;
  isOpen: boolean;
};

const BertinContext = createContext<BertinContextType | undefined>(undefined);

export const useBertin = () => {
  const context = useContext(BertinContext);
  if (!context) {
    throw new Error('useBertin must be used within a BertinProvider');
  }
  return context;
};

export const BertinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openBertin = () => {
    setIsOpen(true);
  };

  const closeBertin = () => {
    setIsOpen(false);
  };

  return (
    <BertinContext.Provider value={{ openBertin, closeBertin, isOpen }}>
      {children}
      <BertinChatbot isOpen={isOpen} onClose={closeBertin} />
    </BertinContext.Provider>
  );
};
