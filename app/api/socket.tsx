import { Server } from "Socket.IO";

const SocketHndler = (req:any, res:any) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socet is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHndler
