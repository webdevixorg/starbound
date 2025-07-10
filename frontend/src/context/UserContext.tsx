import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  username: string;
  // other relevant user details
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const initialUserState: User | null = null;

export const UserContext = createContext<UserContextType>({
  user: initialUserState,
  setUser: () => null,
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: React.ReactNode; // Define children prop
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(initialUserState);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
