const http = require("http");
const { Server } = require("socket.io");
const httpServer = http.createServer();
const io = new Server(httpServer);

const users = {};
const rooms = new Map();

io.on("connect", (socket) => {


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
  socket.emit("room-list", Array.from(rooms.entries()));
  });
  socket.on("send-admin-message", (data) => {
    console.log("event: send-admin-message");
    const {room, message, date, time, sender} = data;
    if (rooms.get(room)) {
      const roomDetails = rooms.get(room);
      // Update the messages array
      if (roomDetails){
      roomDetails.messages.push({
        sender:sender,
        message:message,
        date: date,
        time: time,
      });
    } 
      rooms.set(room, roomDetails);
    } else {
      rooms.set(data[0], {
        admin: "admin",
        user: data[1].user,
        messages: data[1].messages
      });
    }
    
    // Update the room details back into the Map
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

    socket.to("admin-room").emit("room-list", Array.from(rooms.entries()));
  });

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

const PORT = 3001;
httpServer.listen(PORT, () => {
});