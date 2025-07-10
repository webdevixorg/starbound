// context/VisitContext.tsx
import React, { createContext, useContext, useState } from 'react';

type Visit = {
  item_id: number;
  type: 'product' | 'post';
  timestamp: string;
};

type VisitContextType = {
  visits: Visit[];
  addVisit: (visit: Visit) => void;
  clearVisits: () => void;
};

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export const VisitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visits, setVisits] = useState<Visit[]>([]);

  const addVisit = (visit: Visit) => {
    setVisits((prev) => [...prev, visit]);
  };

  const clearVisits = () => setVisits([]);

  return (
    <VisitContext.Provider value={{ visits, addVisit, clearVisits }}>
      {children}
    </VisitContext.Provider>
  );
};

export const useVisit = () => {
  const context = useContext(VisitContext);
  if (!context) {
    throw new Error('useVisit must be used within a VisitProvider');
  }
  return context;
};
