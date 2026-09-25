import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Connects to the backend socket and calls onOccupancyChanged
 * whenever an allocation/unallocation happens anywhere.
 */
export function useOccupancySocket(onOccupancyChanged) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(); // same origin (Vite proxies it in dev)
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
