import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_API_URL_SOCKET, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

