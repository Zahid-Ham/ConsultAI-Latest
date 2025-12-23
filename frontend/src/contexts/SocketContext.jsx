import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // --- HARDCODED URL FIX ---
    // Note: Socket.io connects to the main domain, NOT /api
    const SOCKET_URL = "https://consultai-backend.onrender.com";

    console.log("Attempting to connect socket to:", SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
