const http = require("http");
const { Server } = require("socket.io");
const httpServer = http.createServer();
const io = new Server(httpServer);

const users = {};
const rooms = new Map();

io.on("connect", (socket) => {

  socket.emit("room-list", Array.from(rooms.entries()));

  socket.on("new-user", (user) => {
    if (user.admin) {
      socket.join("admin-room");
      rooms.set("admin-room", {
          admin: "admin",
          user: user,
          messages:[],
        });
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
    console.log("event: send-admin-message");
    const {room, message, date, time, sender} = data;
    const roomDetails = rooms.get(room);
    // Update the messages array
    if (roomDetails){
    roomDetails.messages.push({
      sender:sender,
      message:message,
      date: date,
      time: time,
    })}
    // Update the room details back into the Map
    rooms.set(room, roomDetails);

    socket.emit("room-list", Array.from(rooms.entries()));
    socket.to(room).emit("get-admin-message", data);
    console.log(data);
  });

  
  socket.on("send-client-message", (data) => {
    console.log("event: send-client-message");
    const {room, message, date, time, sender} = data;
    socket.to("admin-room").emit("receive-client-message", data);
    const roomDetails = rooms.get(room);
    // Update the messages array
    roomDetails.messages.push({
      sender:sender,
      message:message,
      date: date,
      time: time,
    });
    // Update the room details back into the Map
    rooms.set(room, roomDetails);
    console.log("single room after setting it: ", roomDetails);

    socket.emit("room-list", Array.from(rooms.entries()));
  });

  // socket.on("delete-chat", (roomName) => {
  //   if (rooms.has(roomName)) {
  //     rooms.get(roomName).messages = [];
  //     // socket.to(roomName).emit("chat-Deleted", roomName);
  //     console.log("successfully deleted chat room");
  //   } else {
  //     // socket.emit("chat-deletion-faild", `Room "${roomName}" not Found`);
  //     console.log("chat room deletion failed");
  //   }
  // }) 

  socket.on("disconnect", () => {
    const roomName = Array.from(rooms.keys()).find(
    (key) => rooms.get(key) === socket.id
  );
  if (roomName) {
    socket.to(roomName).emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
});