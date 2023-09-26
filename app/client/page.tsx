"use client";
import { useState, useEffect } from "react";
import { io } from "Socket.Io-client";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [isSocketInitialized, setIsSocketInitialized] =
    useState<boolean>(false);
  const username = "John Doe";

  let socket: any;
  useEffect(() => {
    const socketInitializer = async () => {
      // Establish the socket connection
      socket = io("http://localhost:3001");

      socket.on("connect", () => {
        console.log("connected");
        socket.emit("get-room-list");
        setIsSocketInitialized(true);
      });

      socket.on("room-list", (rooms: string[]) => {
        if (!rooms.includes(username)) {
          socket.emit("create-room", username);
        }
      });
    };
    socketInitializer();
  }, [isSocketInitialized]);

  // function for sending messages to rooms
  interface UserData {
    id?: number;
    username: string;
    email: string;
    dpUrl: string;
    message: string;
    date: string;
    time: string;
    sender: string;
  }
  let userObj: UserData;
  function handleUserMessageSend() {
    if (!isSocketInitialized) {
      console.error("Socket is not Initialized yet");
      return;
    }
    const timestamp = Date.now();
    const timeObj = new Date(timestamp);
    const localTime = timeObj.toLocaleTimeString();
    const localDate = timeObj.toLocaleDateString();

    userObj = {
      username: "John Doe",
      email: "abc@gmail.com",
      dpUrl: "https://picsum.photos/200",
      message: userInput,
      date: localDate,
      time: localTime,
      sender: "John Doe",
    };
    // Send the message to the selected room
    socket?.emit?.("admin-chat-message", userObj);
    console.log(userObj);
    // then save to the database
    // clear input field
    setUserInput("");
  }

  return (
    <main className="flex h-screen flex-col justify-between bg-slate-200">
      {/* display the messages */}
      <div>messages</div>
      <div className="w-full flex flex-row px-5 pb-5">
        <input
          className="outline-none w-full me-4 rounded px-3"
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here.."
        />
        <button
          className="bg-[#F24187] outline-none p-2 rounded-[10px]"
          onClick={handleUserMessageSend}
        >
          <svg
            width="23"
            height="24"
            viewBox="0 0 23 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.3136 1.80843C20.983 1.47385 20.5718 1.23019 20.1195 1.10098C19.6673 0.971768 19.1894 0.961379 18.7319 1.07081L3.97971 4.178C3.13015 4.29451 2.32998 4.6459 1.66933 5.1926C1.00868 5.73929 0.513781 6.45958 0.240369 7.27234C-0.0330436 8.08511 -0.0741098 8.95806 0.121795 9.7929C0.3177 10.6277 0.742795 11.3913 1.34921 11.9976L2.93323 13.5807C3.01896 13.6664 3.08695 13.7682 3.13331 13.8802C3.17966 13.9922 3.20347 14.1123 3.20338 14.2335V17.1544C3.20541 17.5651 3.29996 17.9701 3.47998 18.3392L3.47261 18.3457L3.49658 18.3696C3.76674 18.9128 4.20799 19.3521 4.75236 19.6199L4.77634 19.6439L4.78279 19.6365C5.15193 19.8165 5.55688 19.9111 5.96758 19.9131H8.88852C9.1329 19.9129 9.36736 20.0097 9.54039 20.1823L11.1235 21.7654C11.5481 22.1947 12.0535 22.5358 12.6105 22.7689C13.1675 23.002 13.7652 23.1225 14.369 23.1236C14.8722 23.1229 15.3719 23.0407 15.8488 22.8801C16.6541 22.6157 17.3695 22.1315 17.9143 21.4821C18.4591 20.8327 18.8116 20.044 18.932 19.205L22.0438 4.42049C22.1589 3.95915 22.1522 3.47582 22.0241 3.01789C21.8961 2.55996 21.6513 2.14318 21.3136 1.80843ZM4.2388 12.2788L2.65386 10.6957C2.28479 10.3355 2.02612 9.87757 1.90821 9.37554C1.7903 8.87352 1.81803 8.34827 1.98816 7.86145C2.15311 7.36202 2.45803 6.92047 2.86666 6.58931C3.27528 6.25816 3.77043 6.05134 4.2932 5.99345L18.8988 2.91853L5.04556 16.7736V14.2335C5.04696 13.8705 4.97638 13.5109 4.8379 13.1754C4.69942 12.8399 4.4958 12.5351 4.2388 12.2788ZM17.1203 18.8897C17.0495 19.3989 16.8381 19.8784 16.51 20.2742C16.1818 20.67 15.7498 20.9665 15.2625 21.1305C14.7752 21.2944 14.2518 21.3193 13.7512 21.2023C13.2505 21.0853 12.7923 20.8311 12.4281 20.4682L10.8423 18.8823C10.5863 18.6249 10.2818 18.4208 9.94646 18.2819C9.6111 18.1429 9.25152 18.0718 8.88852 18.0728H6.34837L20.2035 4.22226L17.1203 18.8897Z"
              fill="#FAFAFA"
            />
          </svg>
        </button>
      </div>
    </main>
  );
}
