import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // HARDCODED: Connect to Render backend (Note: NO '/api' at the end for sockets)
    const SOCKET_URL = "https://consultai-backend.onrender.com";

    console.log("Connecting to socket at:", SOCKET_URL); // Debug log
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // Force stable transport
      withCredentials: true,
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
