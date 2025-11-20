import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface WebSocketState {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  error: null,

  connect: () => {
    const { socket } = get();
    
    if (socket?.connected) {
      return;
    }

    set({ connectionStatus: 'connecting', error: null });

    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      set({ 
        isConnected: true, 
        connectionStatus: 'connected',
        error: null 
      });
    });

    newSocket.on('disconnect', () => {
      set({ 
        isConnected: false, 
        connectionStatus: 'disconnected' 
      });
    });

    newSocket.on('connect_error', (error) => {
      set({ 
        connectionStatus: 'error', 
        error: error.message 
      });
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ 
        socket: null, 
        isConnected: false, 
        connectionStatus: 'disconnected' 
      });
    }
  },

  emit: (event: string, data: any) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  },

  on: (event: string, callback: (data: any) => void) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event: string, callback?: (data: any) => void) => {
    const { socket } = get();
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  },
}));