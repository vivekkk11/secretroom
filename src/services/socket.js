import { io } from "socket.io-client"

const SOCKET_URL = "http://localhost:5000"

let socket

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return socket;
};