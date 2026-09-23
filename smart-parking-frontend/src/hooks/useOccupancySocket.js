import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

/**
 * Connects to the backend socket and calls onOccupancyChanged
 * whenever an allocation/unallocation happens anywhere.
 */
export function useOccupancySocket(onOccupancyChanged) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('occupancy-changed', (payload) => {
      onOccupancyChanged?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [onOccupancyChanged]);

  return socketRef;
}
