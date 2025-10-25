import { io } from 'socket.io-client'

let socket

export function getSocket() {
  if (!socket) {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
    socket = io(base, { transports: ['websocket'] })
  }
  return socket
}
