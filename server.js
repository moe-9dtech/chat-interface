const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const users = {};
const rooms = {};

io.on("connection", (socket) => {
  socket.on("new-user", (user) => {
    if (user.admin) {
      // Admin user logic (e.g., joining a special admin room)
      socket.join("admin-room");
    } else {
      // Normal user logic (e.g., joining their specific room)
      const roomName = user.username; // Assuming room names are the same as usernames
      socket.join(roomName);

      rooms[socket.id] = roomName;
    }
  });

  socket.on("get-room-list", () => {
    // Get the list of rooms (e.g., from a variable or database)
    const roomList = Object.values(rooms);

    // Emit the list of rooms to the admin
    socket.emit("room-list", roomList);
  });

  socket.on("send-admin-message", (data) => {
    const { room, message } = data;
    const timestamp = Date.now();
    const timeObj = new Date(timestamp);
    const localTime = timeObj.toLocaleTimeString();
    const localDate = timeObj.toLocaleDateString();

    socket.to(room).emit("admin-chat-message", { 
        room: room,
        name:"admin",
        message: message,
        date: localDate,
        time: localTime,
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
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});
