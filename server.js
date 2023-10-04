const http = require("http");
const { Server } = require("socket.io");
const httpServer = http.createServer();
const io = new Server(httpServer);

const users = {};
const rooms = new Map();
// .on connection
// .on new-user
// .emit room-list
// .on/.emit send-admin-message
// .on/.emit admin-chat-message
// .on send-chat-message
// .emin chat-message
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
    socket.emit("room-list", Array.from(rooms.keys()));
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
    console.log("single room after setting it: ", roomDetails);
    rooms.forEach((roomData, roomName) => {
      console.log(roomName, roomData);
    })

    socket.emit("room-list", Array.from(rooms.entries()));
    socket.to(room).emit("recieve-client-message", data);
  });

  // socket.on("send-admin-message", (data) => {
  //   console.log("admin-chat-message");
  //   console.log("data", data);
  //   const {room, message, date, time} = data
  //   const roomDetails = rooms.get(room);
  //   // Update the messages array
  //   roomDetails.messages.push({
  //     sender: roomDetails.user.username,
  //     message:message,
  //     date:date,
  //     time: time,
  //   });

  //   // Update the room details back into the Map
  //   rooms.set(room, roomDetails);
  //   socket.to(room).emit("receive-admin-message", data);
  // });

  socket.on("send-client-message", (data) => {
    console.log("event: send-client-message");
    const {room, message, date, time, sender} = data;
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
    rooms.forEach((roomData, roomName) => {
      // console.log(roomName, roomData);
    })

    socket.emit("room-list", Array.from(rooms.entries()));
    socket.to(room).emit("recieve-client-message", data);
    // console.log({data});
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

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
});
