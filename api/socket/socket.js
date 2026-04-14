import { Server as SocketIOServer } from "socket.io";
import { decryptUserData } from "../verifyuser.js";
import registerMessageEvents from "./message.socket.js";
import registerCallEvents from "./call.socket.js";

let io;

const onlineUsers = new Map();

export const initSocket = (server, allowedOrigins) => {
    io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

    io.use((socket, next) => {
  try{
  const cookies = socket.handshake.headers.cookie;
  if (!cookies) return next(new Error("No cookies found"));

  const parsed = Object.fromEntries(
    cookies.split(";").map(c => c.trim().split("="))
  );

  const employeeCookie = parsed.employeeId;
  const companyCookie = parsed.companyId;
  if (!employeeCookie || !companyCookie) {
   console.error("❌ Cannot decrypt: value is missing");
    return next(new Error("Unauthorized"));
}

  const employeeSession = decryptUserData(employeeCookie);
  const companySession = decryptUserData(companyCookie);

  if (!employeeSession || !companySession) {
    console.log("❌ No employee id from cookie");
    return next(new Error("Unauthorized"));
  }

  socket.employeeId = employeeSession;
  socket.companyId = companySession || null;

  // Mark online
  onlineUsers.set(socket.employeeId, socket.id);

  next();
}catch {
    next(new Error("Auth failed"));
  }
});

const socketIdForEmployee = (employeeId) => {
  return onlineUsers.get(String(employeeId));
};

//soket (io) end</>
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

   registerMessageEvents(io, socket);
    registerCallEvents(io, socket, socketIdForEmployee);

  // Disconnect
  socket.on("disconnect", () => {
    // remove from onlineUsers
    if (socket.employeeId) {
      for (const [empId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(empId);
          break;
        }
      }
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
    console.log("socket disconnected:", socket.id);
  });
});
 return io;
}

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};


// soket (io) end</>
