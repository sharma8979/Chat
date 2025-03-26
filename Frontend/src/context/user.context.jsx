import React, { createContext, useState, useContext } from 'react';

// Create the UserContext
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User state to store logged-in user details

  // Function to log in a user
  const login = (userData) => {
    setUser(userData);
  };

  // Function to log out a user
  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser}}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
