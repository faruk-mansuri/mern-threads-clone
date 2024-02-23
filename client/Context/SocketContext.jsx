import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const GlobalSocketContext = createContext();

const SocketContext = ({ children }) => {
  const [socket, setSocket] = useState();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const currentUser = useSelector((store) => store.user.user);

  // const url = 'http://localhost:5000';
  const url = 'https://threads-clone-app.onrender.com';

  useEffect(() => {
    const socket = io(url, {
      query: { userId: currentUser?._id },
    });

    setSocket(socket);

    socket.on('getOnlineUsers', (users) => {
      // - listens for event (call)
      setOnlineUsers(users);
    });

    return () => socket && socket.close();
  }, [currentUser?._id]);

  return (
    <GlobalSocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </GlobalSocketContext.Provider>
  );
};
export const useGlobalSocketContext = () => useContext(GlobalSocketContext);

export default SocketContext;
