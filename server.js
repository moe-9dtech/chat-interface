const http = require("http");
const { Server } = require("socket.io");
const httpServer = http.createServer();
const io = new Server(httpServer);

const users = {};
const rooms = new Map();

io.on("connection", (socket) => {
  socket.on("new-user", (user) => {
    if (user.admin) {
      socket.join("admin-room");
      rooms.set("admin-room", {
          admin: "admin",
          user: user,
          messages:[],
        });
      socket.emit("room-list", rooms)
    } else {
      const roomName = user.username;
      if (!rooms.has(roomName) && roomName !== undefined) {
        rooms.set(roomName, {
          admin: "admin",
          user: user,
          messages:[],
        });
      }
        socket.join(roomName);
    }
  });

  socket.on("send-admin-message", (data) => {
    console.log(data);
    const { room, name, message, date, time } = data;
    const roomDetails = rooms.get(room);
    roomDetails.messages.push({
      sender:"admin",
      message:message,
      date: date,
      time: time,
    });
    socket.to(room).emit("admin-chat-message", data);
    console.log("Updated Rooms Map:", rooms);
  });

  socket.on("admin-chat-message", (data) => {
    console.log("admin-chat-message", data);
    const {room, message, date, time} = data
    let roomDetails = rooms.get(room);
    roomDetails.messages.push({
      sender: roomDetails.user.username,
      message:message,
      date:date,
      time: time,
    });
    socket.to(room).emit("chat-message", data);
  });

  socket.on("send-chat-message", (data) => {
    const {room, message, date, time, sender} = data;
    const roomDetails = rooms.get(room);
    roomDetails.messages.push({
      sender:sender,
      message:message,
      date: date,
      time: time,
    });
    socket.to(room).emit("chat-message", data);
  });

  socket.on("disconnect", () => {
    const roomName = rooms[socket.id];
    if (roomName) {
      socket.to(roomName).emit("user-disconnected", users[socket.id]);
      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
});
