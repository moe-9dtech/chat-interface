const http = require("http");
const { Server } = require("socket.io");
// const cors = require("cors");

const httpServer = http.createServer();

const io = new Server(httpServer);

const users = {};
const rooms = [];

io.on("connection", (socket) => {
  socket.on("new-user", (user) => {
    if (user.admin) {
      socket.join("admin-room");
      socket.emit("room-list", rooms)

    } else {
      // Normal user logic (e.g., joining their specific room)
      const roomName = user.username; // Assuming room names are the same as usernames
      if (!rooms.includes(roomName) && roomName !== undefined) {
        socket.join(roomName);
        rooms.push(roomName);
      } else {
        socket.join(roomName);
      }
    }
    console.log("Rooms: ", rooms);
  });

  // socket.on("get-room-list", () => {
    // Get the list of rooms (e.g., from a variable or database)
    // const roomList = Object.values(rooms);

    // Emit the list of rooms to the admin
    // socket.emit("room-list", rooms);
  // });

  socket.on("send-admin-message", (data) => {
    const { room, name, message, date, time } = data;

    socket.to(room).emit("admin-chat-message", { 
        room: room,
        name:name,
        message: message,
        date: date,
        time: time,
         });
  });

  socket.on("admin-chat-message", (data) => {
    console.log(data);
    const messageElement = document.createElement("div");
    messageElement.textContent = `[Admin]: ${data.message}`; // Prefix with [Admin]
    adminChat.appendChild(messageElement);
  });

  socket.on("send-chat-message", (message) => {
    console.log(message);
    const timestamp = Date.now();
    const timeObj = new Date(timestamp);
    const localTime = timeObj.toLocaleTimeString();
    const localDate = timeObj.toLocaleDateString();
    socket.broadcast.emit("chat-message", {
      message: message,
      name: users[socket.id],
      date: localDate,
      time: localTime,
    });
    
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
  console.log(`Socket.io server is running on port ${PORT}`);
});
