"use client";
// Admin Code

import SortDropdown from "./components/sortDropdown";
import Contact from "./components/contact";
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Image from "next/image";
    // env: {
    //     liveSocket: "https://localhost:3000",
    //     localSocket: "http://localhost:6000",
    //     liveApi: "https://localhost:5000/api/",
    //     localApi: "http://localhost:5000/api/",
    // }
export default function Home() {
  const [isSocketInitialized, setIsSocketInitialized] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeIndexRooms, setActiveIndexRooms] = useState(-1)
  const [activeIndexUsers, setActiveIndexUsers] = useState(-1)
  // const [messages, setMessages] = useState<UserData[]>([]);
  const [rooms, setRooms] = useState([]); //set rooms list -userNames-
  const [dbMessages, setDbMessages] = useState();
  const [dbUsers, setDbUsers] = useState([]);
  const [newUser, setNewUser] = useState();
  const [adminInput, setAdminInput] = useState("");
  const [socket, setSocket] = useState();
  const apiUrl = "https://localhost:5000/api/";
  const socketUrl = "https://localhost:3001";
  let dd = [];

  var newSocket;
  newSocket = io(socketUrl, {
    reconnection: true,
    reconnectionAttempts: 5,
    // reconnectionDelay: 1000,
  });
  useEffect(() => {
    // Establish the socket connection

    setSocket(newSocket);
    newSocket.on("connect", () => {
      setNewUser({
        username: "admin",
        email: "admin",
        dpurl: "dp",
        admin: true,
      });
      // const admin = {username: newUser?.username, admin: true};
      newSocket.emit("new-user", { usrname: "admin", admin: true });
      // socket.emit("get-room-list");
      setIsSocketInitialized(true);
    });

    // Get the room list from the server
    newSocket.on("room-list", (roomList) => {
      const listMap = new Map(Object.entries(roomList));
      var roomArray = Array.from(listMap.values());
      let filteredRoom = roomArray.filter((room) => room[0] !== "admin-room");
      // this is the issue I have to tackle tomorrow morning
      setRooms(filteredRoom);
    });
  }, []);

  newSocket.on("receive-client-message", (userObj) => {
    const { sender, message, date, time } = userObj;
    console.log('event "receive-client-message" fird ');
    console.log({ userObj });

    const receivedMessage = {
      sender: sender,
      message: message,
      date: date,
      time: time,
    };

    // Update your state to include the received message
    setRooms((prevRooms) => {
      return prevRooms.map((room) => {
        if (room[0] === userObj.room) {
          console.log("success!");

          return [
            room[0],
            {
              ...room[1],
              messages: [...room[1].messages, receivedMessage],
            },
          ];
        }
        return room;
      });
    });
  });

  // Get all users from Db to display them as individual chats
  async function getDbUsers() {
    const endPoint = "fetchall";

    await fetch(apiUrl + endPoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((Response) => {
        if (!Response.ok) {
          throw new Error("no rooms found");
        }
        return Response.json();
      })
      .then((data) => {
        console.log({ data });
        // setRooms(data.users);
        setDbUsers(data.users);
      });
  }

  useEffect(() => {
    getDbUsers();
  }, []);

  useEffect(() => {
    console.log({ dbUsers });
    console.log({ rooms });
  }, [dbUsers]);

  // Function to Get Messages From Database
  async function getDbMessages() {
    // const localUrl = "http://172.16.150.11:5000/api/";
    const endPoint = "getmessages";
    if (activeIndexRooms === -1 && activeIndexUsers === -1) {
      return;
    }
    const payload = {
      roomName: activeIndexUsers !== -1 ? dbUsers?.[activeIndexUsers].roomName : rooms[activeIndexRooms][0], //rooms[activeIndex][0]
    };

    console.log("payload: ", dbUsers?.[activeIndex]);
    await fetch(apiUrl + endPoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error("fetch failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("successfull fetch response:", data);
        setDbMessages(data);
      });
  }
  useEffect(() => {
    getDbMessages();
    console.log({ dbMessages });
  }, [activeIndexRooms, activeIndexUsers]);

  // function for sending messages to rooms
  function handleAdminSend() {
    if (!isSocketInitialized) {
      console.log("Socket is not Initialized yet");
      return;
    }

    function formatTime24Hours(date) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    }

    const timestamp = Date.now();
    const timeObj = new Date(timestamp);
    const localTime = formatTime24Hours(timeObj);
    const localDate = timeObj.toLocaleDateString();
    const adminObj = {
      username: "admin",
      room: activeIndexUsers !== -1 ? dbUsers[activeIndexUsers].roomName : rooms[activeIndexRooms][0],
      email: "abc@gmail.com",
      dpUrl: "https://picsum.photos/200",
      message: adminInput,
      date: localDate,
      time: localTime,
      sender: "admin",
    };

    console.log({adminObj});
    const myUser = dbUsers?.find(
      (user) => user.user.username === adminObj.room
    )?.user;
    dd = [
      adminObj.room,
      {
        user: myUser,
        messages: [
          {
            sender: "admin",
            message: adminObj.message,
            time: adminObj.time,
            date: adminObj.date,
          },
        ],
      },
    ];
    setRooms((prevRooms) => {
      const currentIndex = activeIndex;
      // checking if the room sending the message too existes in the Rooms state "uer is connected";
      const roomExists = prevRooms.some((room) => room[0] == adminObj.room);
      if (roomExists) {
        return prevRooms.map((room) => {
          if (activeIndexUsers !== -1 ? room[0] == rooms?.[activeIndexRooms]?.[0] : room[0] == dbUsers?.[setActiveIndexUsers]?.roomName) {
            if (room[1] && room[1].messages) {
              return {
                ...room,
                messages: [...room[1].messages, adminObj],
              };
            } else {
              return {
                ...room,
                messages: [adminObj],
              };
            }
          }
          return room;
        });
      } else {
        const dbUser = dbUsers.find(
          (user) => user.user.username === adminObj.room
        )?.user;
        if (dbUser) {
          return [...prevRooms, dd];
        } else {
          console.log("check the code again");
        }
      }
    });

    if (rooms.find((room) => room[0] === adminObj.room)) {
      socket.emit("send-admin-message", adminObj);
    } else {
      socket.emit("send-admin-message", dd);
    }
    setAdminInput("");
  }

  function handleKeyDown (e) {
    let key = e.key;
    if (key === 'Enter') {
      handleAdminSend();
    }
  }

  const handleContactClickUsers = (index) => {
    setActiveIndexUsers((prevActiveIndex) =>
      prevActiveIndex === index ? -1 : index
    );
    setActiveIndexRooms(-1);
  };

  const handleContactClickRooms = (index) => {
    setActiveIndexRooms((prevActiveIndex) =>
      prevActiveIndex === index ? -1 : index
    );
    setActiveIndexUsers(-1);
  };

  async function saveChat() {
    const endPoint = "messages";
    const payload = {
      roomName: rooms.find((room) => activeIndexUsers !== -1 ? room[0] === dbUsers[activeIndexUsers].roomName : room[0] === rooms[activeIndexRooms][0])?.[0],
      messages: activeIndexUsers ? rooms.find((room) => room[0] === dbUsers[activeIndexUsers].roomName )?.[1].messages : rooms.find((room) => room[0] === rooms[activeIndexRooms][0])[1].messages 
    };
    console.log(payload);
    // newSocket.emit("delete-chat", payload.roomName)

    await fetch(apiUrl + endPoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error("fetch failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("successfull fetch response:", data);
      });
  }

  // if (activeIndexRooms !== -1) {
  //   console.log("current room is: ", rooms[activeIndexRooms][0]);
  //   console.log("xyz", rooms.find((room) => room[0] === dbUsers[activeIndexRooms].roomName)?.[1]);
  //   // console.log({activeIndex});
  // } else if (activeIndexUsers !== -1){
  //   console.log("current db room is: ", dbUsers[activeIndexUsers].roomName);
  // } else {
  //   console.log("No active room");
  // }

  return (
    <main className="flex flex-col justify-between">
      {/* main container */}
      <div className="flex flex-col md:flex-row md:justify-between">
        {/* main left column */}
        <div className="flex flex-col border-r border-[#EEEEEE] w-full sm:w-1/2 md:w-1/3 lg:w-1/4 space-y-7">
          {/* top notch */}
          <div className="flex flex-row justify-between items-center p-5">
            <svg
              width="75"
              height="37"
              viewBox="0 0 75 37"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.63644 6.34562C6.63644 6.7636 6.53786 7.15792 6.3407 7.52858C6.14354 7.89924 5.82808 8.20287 5.39433 8.43946C4.96058 8.66817 4.40459 8.78252 3.72636 8.78252H2.23583V12.1185H0.887251V3.8969H3.72636C4.35727 3.8969 4.8896 4.0073 5.32335 4.22812C5.76499 4.44106 6.09228 4.73285 6.30521 5.10351C6.52603 5.47418 6.63644 5.88821 6.63644 6.34562ZM3.72636 7.68237C4.23897 7.68237 4.62146 7.56802 4.87383 7.33931C5.12619 7.10272 5.25237 6.77149 5.25237 6.34562C5.25237 5.44657 4.7437 4.99705 3.72636 4.99705H2.23583V7.68237H3.72636ZM13.5417 8.69971C13.5417 8.94419 13.5259 9.16501 13.4944 9.36217H8.51411C8.55354 9.88267 8.74676 10.3007 9.09376 10.6161C9.44076 10.9316 9.86663 11.0893 10.3714 11.0893C11.0969 11.0893 11.6095 10.7857 11.9092 10.1784H13.3642C13.1671 10.7778 12.8083 11.2707 12.2878 11.6571C11.7751 12.0357 11.1363 12.2249 10.3714 12.2249C9.74833 12.2249 9.1884 12.0869 8.69155 11.8109C8.2026 11.527 7.81616 11.1327 7.53225 10.6279C7.25623 10.1153 7.11822 9.52384 7.11822 8.8535C7.11822 8.18315 7.25229 7.59562 7.52042 7.09089C7.79645 6.57827 8.17894 6.18395 8.66789 5.90793C9.16474 5.6319 9.73256 5.49389 10.3714 5.49389C10.9865 5.49389 11.5346 5.62796 12.0157 5.8961C12.4967 6.16424 12.8713 6.54278 13.1395 7.03174C13.4076 7.51281 13.5417 8.0688 13.5417 8.69971ZM12.134 8.27385C12.1261 7.77701 11.9486 7.37874 11.6016 7.07906C11.2546 6.77938 10.8248 6.62953 10.3122 6.62953C9.84691 6.62953 9.44865 6.77938 9.11742 7.07906C8.78619 7.37086 8.58903 7.76912 8.52594 8.27385H12.134ZM15.8625 6.54673C16.0597 6.2155 16.3199 5.95919 16.6433 5.7778C16.9745 5.58853 17.3649 5.49389 17.8144 5.49389V6.88978H17.4713C16.9429 6.88978 16.5407 7.02385 16.2647 7.29199C15.9966 7.56013 15.8625 8.02543 15.8625 8.68788V12.1185H14.5139V5.60036H15.8625V6.54673ZM19.3852 4.7368C19.1408 4.7368 18.9357 4.65399 18.7701 4.48838C18.6045 4.32276 18.5217 4.11771 18.5217 3.87324C18.5217 3.62876 18.6045 3.42371 18.7701 3.2581C18.9357 3.09248 19.1408 3.00968 19.3852 3.00968C19.6218 3.00968 19.8229 3.09248 19.9885 3.2581C20.1542 3.42371 20.237 3.62876 20.237 3.87324C20.237 4.11771 20.1542 4.32276 19.9885 4.48838C19.8229 4.65399 19.6218 4.7368 19.3852 4.7368ZM20.0477 5.60036V12.1185H18.6991V5.60036H20.0477ZM24.2906 12.2249C23.6755 12.2249 23.1195 12.0869 22.6227 11.8109C22.1258 11.527 21.7354 11.1327 21.4515 10.6279C21.1676 10.1153 21.0257 9.52384 21.0257 8.8535C21.0257 8.19104 21.1716 7.6035 21.4634 7.09089C21.7552 6.57827 22.1534 6.18395 22.6582 5.90793C23.1629 5.6319 23.7268 5.49389 24.3498 5.49389C24.9728 5.49389 25.5367 5.6319 26.0414 5.90793C26.5462 6.18395 26.9444 6.57827 27.2362 7.09089C27.528 7.6035 27.6739 8.19104 27.6739 8.8535C27.6739 9.51596 27.5241 10.1035 27.2244 10.6161C26.9247 11.1287 26.5146 11.527 25.9941 11.8109C25.4815 12.0869 24.9137 12.2249 24.2906 12.2249ZM24.2906 11.0538C24.6376 11.0538 24.961 10.971 25.2607 10.8054C25.5682 10.6398 25.8167 10.3913 26.0059 10.0601C26.1952 9.72889 26.2898 9.32668 26.2898 8.8535C26.2898 8.38031 26.1991 7.98205 26.0178 7.65871C25.8364 7.32748 25.5958 7.07906 25.2962 6.91344C24.9965 6.74783 24.6731 6.66502 24.3261 6.66502C23.9791 6.66502 23.6558 6.74783 23.3561 6.91344C23.0643 7.07906 22.8317 7.32748 22.6582 7.65871C22.4847 7.98205 22.3979 8.38031 22.3979 8.8535C22.3979 9.55539 22.5753 10.0996 22.9302 10.486C23.293 10.8645 23.7465 11.0538 24.2906 11.0538ZM28.2026 8.82984C28.2026 8.17527 28.3367 7.59562 28.6048 7.09089C28.8809 6.58616 29.2515 6.19578 29.7168 5.91976C30.19 5.63585 30.7145 5.49389 31.2902 5.49389C31.716 5.49389 32.134 5.58853 32.5441 5.7778C32.9621 5.95919 33.2933 6.20367 33.5378 6.51124V3.36456H34.8982V12.1185H33.5378V11.1366C33.317 11.4521 33.0094 11.7123 32.6151 11.9174C32.2286 12.1224 31.7831 12.2249 31.2783 12.2249C30.7105 12.2249 30.19 12.083 29.7168 11.7991C29.2515 11.5073 28.8809 11.1051 28.6048 10.5925C28.3367 10.0719 28.2026 9.48441 28.2026 8.82984ZM33.5378 8.8535C33.5378 8.40397 33.4431 8.0136 33.2539 7.68237C33.0725 7.35114 32.832 7.09877 32.5323 6.92527C32.2326 6.75177 31.9092 6.66502 31.5622 6.66502C31.2152 6.66502 30.8919 6.75177 30.5922 6.92527C30.2925 7.09089 30.0481 7.33931 29.8588 7.67054C29.6774 7.99388 29.5867 8.38031 29.5867 8.82984C29.5867 9.27936 29.6774 9.67368 29.8588 10.0128C30.0481 10.3519 30.2925 10.6122 30.5922 10.7936C30.8998 10.9671 31.2231 11.0538 31.5622 11.0538C31.9092 11.0538 32.2326 10.9671 32.5323 10.7936C32.832 10.6201 33.0725 10.3677 33.2539 10.0365C33.4431 9.69734 33.5378 9.30302 33.5378 8.8535Z"
                fill="#333333"
              />
              <path
                d="M6.70742 16.8141V18.4347H4.50711V25.1185H2.48425V18.4347H0.283941V16.8141H6.70742ZM9.39061 19.6177C9.6272 19.2549 9.92294 18.971 10.2778 18.766C10.6327 18.553 11.027 18.4466 11.4608 18.4466V20.5877H10.9048C10.4001 20.5877 10.0215 20.6981 9.76916 20.919C9.51679 21.1319 9.39061 21.5104 9.39061 22.0546V25.1185H7.36775V18.5176H9.39061V19.6177ZM11.6706 21.8062C11.6706 21.1279 11.7968 20.5325 12.0491 20.0199C12.3094 19.5073 12.6603 19.113 13.102 18.837C13.5436 18.5609 14.0365 18.4229 14.5807 18.4229C15.046 18.4229 15.4521 18.5176 15.7991 18.7068C16.154 18.8961 16.4261 19.1445 16.6154 19.4521V18.5176H18.6382V25.1185H16.6154V24.1839C16.4182 24.4915 16.1422 24.7399 15.7873 24.9292C15.4403 25.1185 15.0341 25.2131 14.5688 25.2131C14.0326 25.2131 13.5436 25.0751 13.102 24.7991C12.6603 24.5152 12.3094 24.1169 12.0491 23.6043C11.7968 23.0838 11.6706 22.4844 11.6706 21.8062ZM16.6154 21.818C16.6154 21.3133 16.4734 20.915 16.1895 20.6232C15.9135 20.3314 15.5743 20.1855 15.1721 20.1855C14.7699 20.1855 14.4269 20.3314 14.143 20.6232C13.8669 20.9071 13.7289 21.3015 13.7289 21.8062C13.7289 22.3109 13.8669 22.7131 14.143 23.0128C14.4269 23.3046 14.7699 23.4505 15.1721 23.4505C15.5743 23.4505 15.9135 23.3046 16.1895 23.0128C16.4734 22.721 16.6154 22.3227 16.6154 21.818ZM19.3446 21.818C19.3446 21.1319 19.4826 20.5325 19.7586 20.0199C20.0425 19.5073 20.4329 19.113 20.9297 18.837C21.4345 18.5609 22.0102 18.4229 22.6569 18.4229C23.4849 18.4229 24.175 18.6398 24.727 19.0735C25.287 19.5073 25.6537 20.1185 25.8272 20.9071H23.6742C23.4928 20.4024 23.1419 20.15 22.6214 20.15C22.2507 20.15 21.955 20.2959 21.7342 20.5877C21.5133 20.8716 21.4029 21.2817 21.4029 21.818C21.4029 22.3543 21.5133 22.7683 21.7342 23.0601C21.955 23.344 22.2507 23.486 22.6214 23.486C23.1419 23.486 23.4928 23.2336 23.6742 22.7289H25.8272C25.6537 23.5018 25.287 24.109 24.727 24.5506C24.1671 24.9923 23.477 25.2131 22.6569 25.2131C22.0102 25.2131 21.4345 25.0751 20.9297 24.7991C20.4329 24.523 20.0425 24.1287 19.7586 23.6161C19.4826 23.1035 19.3446 22.5041 19.3446 21.818ZM30.5882 25.1185L28.5772 22.3503V25.1185H26.5543V16.3646H28.5772V21.2029L30.5764 18.5176H33.0725L30.328 21.8298L33.0961 25.1185H30.5882ZM39.7345 21.7115C39.7345 21.9008 39.7226 22.098 39.699 22.303H35.1209C35.1525 22.7131 35.2826 23.0286 35.5113 23.2494C35.7479 23.4623 36.0357 23.5688 36.3749 23.5688C36.8796 23.5688 37.2305 23.3559 37.4277 22.93H39.5807C39.4703 23.3637 39.2692 23.7541 38.9774 24.1011C38.6935 24.4481 38.3346 24.7202 37.9009 24.9174C37.4671 25.1145 36.9821 25.2131 36.4458 25.2131C35.7991 25.2131 35.2234 25.0751 34.7187 24.7991C34.214 24.523 33.8197 24.1287 33.5358 23.6161C33.2518 23.1035 33.1099 22.5041 33.1099 21.818C33.1099 21.1319 33.2479 20.5325 33.5239 20.0199C33.8078 19.5073 34.2022 19.113 34.7069 18.837C35.2116 18.5609 35.7913 18.4229 36.4458 18.4229C37.0846 18.4229 37.6525 18.557 38.1493 18.8251C38.6461 19.0933 39.0326 19.4757 39.3086 19.9726C39.5925 20.4694 39.7345 21.0491 39.7345 21.7115ZM37.6643 21.1792C37.6643 20.8322 37.546 20.5562 37.3094 20.3511C37.0728 20.1461 36.7771 20.0436 36.4222 20.0436C36.0831 20.0436 35.7952 20.1421 35.5586 20.3393C35.3299 20.5365 35.188 20.8164 35.1327 21.1792H37.6643ZM42.4696 19.6177C42.7062 19.2549 43.0019 18.971 43.3568 18.766C43.7117 18.553 44.106 18.4466 44.5398 18.4466V20.5877H43.9838C43.4791 20.5877 43.1005 20.6981 42.8481 20.919C42.5958 21.1319 42.4696 21.5104 42.4696 22.0546V25.1185H40.4467V18.5176H42.4696V19.6177Z"
                fill="#F24187"
              />
              <path
                d="M28.7861 31.8569H27.0726L26.7782 32.693H26.0775L27.5437 28.5948H28.3209L29.7871 32.693H29.0805L28.7861 31.8569ZM28.5976 31.3093L27.9323 29.4074L27.261 31.3093H28.5976ZM30.0241 31.0561C30.0241 30.7303 30.0909 30.4418 30.2243 30.1905C30.3617 29.9393 30.5462 29.745 30.7778 29.6076C31.0133 29.4663 31.2744 29.3956 31.5609 29.3956C31.7729 29.3956 31.981 29.4427 32.1851 29.5369C32.3931 29.6272 32.558 29.7489 32.6797 29.902V28.3358H33.3568V32.693H32.6797V32.2043C32.5698 32.3613 32.4167 32.4908 32.2204 32.5929C32.0281 32.695 31.8063 32.746 31.5551 32.746C31.2724 32.746 31.0133 32.6753 30.7778 32.534C30.5462 32.3888 30.3617 32.1886 30.2243 31.9334C30.0909 31.6743 30.0241 31.3819 30.0241 31.0561ZM32.6797 31.0679C32.6797 30.8441 32.6326 30.6498 32.5384 30.4849C32.4481 30.3201 32.3284 30.1945 32.1792 30.1081C32.03 30.0217 31.8691 29.9786 31.6964 29.9786C31.5237 29.9786 31.3627 30.0217 31.2135 30.1081C31.0644 30.1905 30.9427 30.3142 30.8485 30.479C30.7582 30.64 30.7131 30.8323 30.7131 31.0561C30.7131 31.2798 30.7582 31.4761 30.8485 31.6449C30.9427 31.8137 31.0644 31.9432 31.2135 32.0335C31.3666 32.1199 31.5276 32.1631 31.6964 32.1631C31.8691 32.1631 32.03 32.1199 32.1792 32.0335C32.3284 31.9472 32.4481 31.8215 32.5384 31.6567C32.6326 31.4879 32.6797 31.2916 32.6797 31.0679ZM37.9892 29.3956C38.2444 29.3956 38.4721 29.4486 38.6723 29.5546C38.8764 29.6606 39.0354 29.8176 39.1492 30.0257C39.267 30.2337 39.3259 30.4849 39.3259 30.7793V32.693H38.6605V30.8794C38.6605 30.589 38.5879 30.3672 38.4426 30.2141C38.2974 30.0571 38.0992 29.9786 37.8479 29.9786C37.5967 29.9786 37.3965 30.0571 37.2473 30.2141C37.1021 30.3672 37.0295 30.589 37.0295 30.8794V32.693H36.3641V30.8794C36.3641 30.589 36.2915 30.3672 36.1463 30.2141C36.001 30.0571 35.8028 29.9786 35.5515 29.9786C35.3003 29.9786 35.1001 30.0571 34.951 30.2141C34.8057 30.3672 34.7331 30.589 34.7331 30.8794V32.693H34.0618V29.4486H34.7331V29.8196C34.843 29.6861 34.9824 29.5821 35.1512 29.5075C35.3199 29.4329 35.5005 29.3956 35.6929 29.3956C35.9519 29.3956 36.1835 29.4506 36.3877 29.5605C36.5918 29.6704 36.7488 29.8294 36.8587 30.0374C36.9569 29.8412 37.1099 29.6861 37.318 29.5723C37.526 29.4545 37.7498 29.3956 37.9892 29.3956ZM40.3449 29.0188C40.2232 29.0188 40.1211 28.9776 40.0387 28.8951C39.9563 28.8127 39.915 28.7106 39.915 28.589C39.915 28.4673 39.9563 28.3652 40.0387 28.2828C40.1211 28.2003 40.2232 28.1591 40.3449 28.1591C40.4626 28.1591 40.5627 28.2003 40.6452 28.2828C40.7276 28.3652 40.7688 28.4673 40.7688 28.589C40.7688 28.7106 40.7276 28.8127 40.6452 28.8951C40.5627 28.9776 40.4626 29.0188 40.3449 29.0188ZM40.6746 29.4486V32.693H40.0034V29.4486H40.6746ZM43.0162 29.3956C43.2713 29.3956 43.499 29.4486 43.6992 29.5546C43.9033 29.6606 44.0623 29.8176 44.1761 30.0257C44.29 30.2337 44.3469 30.4849 44.3469 30.7793V32.693H43.6815V30.8794C43.6815 30.589 43.6089 30.3672 43.4637 30.2141C43.3184 30.0571 43.1202 29.9786 42.869 29.9786C42.6177 29.9786 42.4175 30.0571 42.2684 30.2141C42.1231 30.3672 42.0505 30.589 42.0505 30.8794V32.693H41.3793V29.4486H42.0505V29.8196C42.1604 29.6861 42.2998 29.5821 42.4686 29.5075C42.6413 29.4329 42.8238 29.3956 43.0162 29.3956Z"
                fill="#333333"
              />
              <path
                d="M59.3584 20.4278C59.1766 21.5819 58.7052 22.6586 58.2705 23.7446C57.7171 25.1326 57.2936 26.5646 57.4434 28.0805C57.5798 29.4429 58.1889 30.5774 59.1139 31.5706C59.8183 32.33 60.5916 33.0185 61.2952 33.7797C59.9552 31.9802 60.2368 29.6134 60.3754 27.4385C60.4601 26.1615 60.4153 24.9272 60.1588 23.6682C59.9327 22.5828 59.546 21.5181 59.3584 20.4278Z"
                fill="#F24187"
              />
              <path
                d="M58.0853 17.8346C57.8873 18.1324 57.6787 18.4225 57.4528 18.703C57.5748 18.5629 57.6905 18.4148 57.8006 18.2599C57.8994 18.1216 57.993 17.9778 58.0853 17.8346Z"
                fill="#F24187"
              />
              <path
                d="M55.1327 30.9318C54.5465 28.7696 55.4983 26.4553 56.4987 24.4572C57.7498 21.9529 59.5715 19.2145 59.2099 16.2825C59.211 16.2776 59.211 16.2776 59.2105 16.2763L59.1037 16.2112C58.7654 16.7568 58.4427 17.3037 58.0913 17.8277C58.0879 17.8305 58.0872 17.8323 58.0851 17.8346C57.9933 17.9792 57.8979 18.1221 57.8005 18.26C57.6904 18.4148 57.5746 18.5629 57.4527 18.7031C57.4485 18.7077 57.4465 18.71 57.4418 18.7134C57.4377 18.718 57.4328 18.7245 57.4287 18.7291C56.9061 19.3335 56.2828 19.8283 55.6294 20.2963C54.2992 21.2489 52.9681 22.2139 52.4982 23.8667C51.7402 26.5273 56.2309 32.8893 55.1327 30.9318Z"
                fill="#F24187"
              />
              <path
                d="M47.8478 19.6788C47.8413 19.6814 47.8354 19.6852 47.8277 19.6883L47.8385 19.7229C49.7062 19.0302 51.1081 17.3404 51.9145 15.5606C52.5682 14.113 52.7328 12.6691 52.7681 11.1003C52.8175 8.93414 52.5923 5.77834 54.5446 4.31332C52.4089 4.21601 50.8118 5.89999 50.0752 7.77617C48.9052 10.8202 50.049 11.9417 49.6593 15.8825C49.5305 17.2027 49.2172 19.1088 47.8241 19.6793C47.8168 19.6837 47.8217 19.6922 47.8269 19.6901C47.8341 19.6857 47.8413 19.6814 47.8478 19.6788Z"
                fill="#F24187"
              />
              <path
                d="M61.1013 3.05248C62.6516 3.4737 63.1797 5.32211 62.5794 6.7948C63.5771 6.08439 64.711 5.20571 63.8377 3.03996C63.0699 1.13457 60.5563 0.753989 58.8426 1.51399C56.7853 2.4248 55.2614 4.67716 54.6119 6.75971C53.1888 11.3294 54.9541 12.8869 50.9207 17.9564C50.1413 18.936 49.3822 19.918 48.901 21.0075C48.4525 22.0181 48.2714 23.3008 48.729 24.3446C49.2822 25.6048 50.5102 26.2747 51.7263 26.7726C51.7502 26.784 51.7629 26.7445 51.7384 26.7318C51.7172 26.7238 51.6973 26.7153 51.6752 26.7047L51.7056 26.6386C51.7094 26.6371 51.7136 26.6324 51.7123 26.6254C51.1414 25.6389 51.0396 24.3031 51.3678 23.2237C51.6479 22.3044 52.3085 21.5625 53.022 20.9493C54.5029 19.6742 56.4418 18.9575 57.7098 17.438C59.4824 15.3139 58.8313 12.6864 58.2831 10.1106C58.0105 8.81906 57.7599 7.54124 57.8547 6.34551C57.9831 4.56418 59.3588 2.58078 61.1013 3.05248ZM49.3053 25.1762C49.7868 25.7296 50.4191 26.1254 51.087 26.4455C50.4191 26.1254 49.7868 25.7296 49.3053 25.1762Z"
                fill="#F24187"
              />
              <path
                d="M63.6055 9.91501C64.1156 9.64967 64.2651 9.36523 64.2651 9.36523C63.9672 9.47682 63.6928 9.55358 63.4405 9.61098C63.4364 9.60065 61.9656 2.42383 59.2486 4.91651C58.7783 5.34868 58.0241 7.0237 58.7623 9.92501C59.5004 12.8263 60.4514 15.28 60.275 16.9487C60.1357 18.2686 59.9068 18.9832 60.0636 19.6934C60.0737 19.6549 60.0832 19.6152 60.0951 19.5775C60.1208 19.4923 60.1507 19.4099 60.1811 19.3289C60.3139 19.0062 60.5245 18.6165 60.7777 18.4269C60.9229 18.3149 61.0859 18.2662 61.2546 18.2467C62.3694 18.3118 65.0086 18.419 65.4846 17.2566C65.7689 16.5648 65.0544 15.9038 65.1294 15.6312C65.2044 15.3585 65.5971 14.9379 65.4959 14.7222C65.3947 14.5066 64.745 14.5911 64.771 14.4728C64.7957 14.3551 65.7383 13.8959 65.486 13.6163C65.068 13.1543 64.7363 13.2225 64.7181 12.9302C64.6917 12.4824 65.4701 12.3495 65.6995 11.8384C65.9866 11.1949 65.4633 11.3636 64.4502 10.6962C64.0387 10.4263 63.7827 10.1826 63.6055 9.91501Z"
                fill="#F24187"
              />
            </svg>
            <div className="flex flex-row items-center space-x-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.0209 11.2833C13.0272 11.5425 12.9823 11.8004 12.8889 12.0422C12.7955 12.284 12.6553 12.5051 12.4764 12.6928C12.2975 12.8804 12.0834 13.031 11.8463 13.1359C11.6092 13.2407 11.3537 13.2979 11.0945 13.304H4.69523C4.55737 13.2955 4.42847 13.2328 4.33667 13.1297C4.24486 13.0265 4.19761 12.8912 4.20523 12.7533C4.19761 12.6154 4.24486 12.4801 4.33667 12.3769C4.42847 12.2737 4.55737 12.211 4.69523 12.2026H11.0945C11.3419 12.2058 11.5805 12.1109 11.758 11.9386C11.9355 11.7663 12.0375 11.5306 12.0417 11.2833V2.46756C12.0373 2.22032 11.9352 1.98487 11.7577 1.81271C11.5802 1.64056 11.3418 1.54574 11.0945 1.54899H4.69523C4.56041 1.53286 4.43618 1.46787 4.34605 1.36632C4.25592 1.26476 4.20615 1.13369 4.20615 0.997914C4.20615 0.862135 4.25592 0.731066 4.34605 0.629513C4.43618 0.527961 4.56041 0.462971 4.69523 0.446843H11.0945C11.3539 0.452683 11.6096 0.509608 11.8469 0.614361C12.0843 0.719112 12.2987 0.869636 12.4778 1.05732C12.6569 1.245 12.7973 1.46616 12.8908 1.70815C12.9844 1.95013 13.0293 2.20819 13.0231 2.46756L13.0209 11.2833ZM8.28237 7.46327L2.78237 7.46327L4.78237 9.46327C4.8334 9.51472 4.87379 9.57572 4.90125 9.64278C4.9287 9.70984 4.94268 9.78165 4.94238 9.85412C4.94208 9.92658 4.92751 9.99827 4.89951 10.0651C4.8715 10.1319 4.83061 10.1926 4.77916 10.2436C4.67525 10.3467 4.53466 10.4042 4.38831 10.4036C4.24197 10.403 4.10185 10.3443 3.9988 10.2404L1.06023 7.30399C1.009 7.25278 0.968359 7.19198 0.940633 7.12506C0.912907 7.05814 0.898636 6.98642 0.898636 6.91399C0.898636 6.84155 0.912907 6.76983 0.940633 6.70291C0.968359 6.63599 1.009 6.57519 1.06023 6.52399L3.9988 3.58399C4.04954 3.53088 4.11038 3.48844 4.17774 3.45917C4.24511 3.42989 4.31765 3.41437 4.39109 3.41352C4.46454 3.41266 4.53742 3.42649 4.60545 3.45419C4.67348 3.48189 4.73529 3.5229 4.78725 3.57481C4.83921 3.62673 4.88028 3.6885 4.90804 3.7565C4.9358 3.82451 4.94969 3.89737 4.94891 3.97082C4.94812 4.04427 4.93267 4.11682 4.90345 4.18421C4.87424 4.2516 4.83186 4.31248 4.7788 4.36327L2.7788 6.36327L8.2788 6.36327C8.46166 6.36327 8.60951 6.61041 8.60951 6.91399C8.60951 7.21756 8.46523 7.46327 8.28237 7.46327Z"
                  fill="black"
                  fillOpacity="0.45"
                />
              </svg>
              <p className="font-medium text-[#8C8C8C]">Sign out</p>
            </div>
          </div>
          <div className="flex flex-row bg-[#EEEEEE] py-2 mx-5 ps-4 rounded-md space-x-3 items-center">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.8815 10.8817C10.9574 10.8055 11 10.7025 11 10.595C11 10.4875 10.9574 10.3845 10.8815 10.3083L7.96103 7.38889C8.5294 6.69132 8.83911 5.81869 8.83769 4.91889C8.83651 3.8799 8.42325 2.88379 7.68858 2.14912C6.95391 1.41444 5.95782 1.00118 4.91884 1C3.87986 1.00118 2.88377 1.41444 2.1491 2.14912C1.41443 2.88379 1.00118 3.8799 1 4.91889C1.00118 5.95788 1.41443 6.95398 2.1491 7.68866C2.88377 8.42334 3.87986 8.8366 4.91884 8.83778C5.81864 8.8392 6.69125 8.52948 7.38881 7.96111L10.3093 10.8817C10.3851 10.9573 10.4878 10.9999 10.5949 11C10.6481 11.0001 10.7008 10.9897 10.75 10.9694C10.7992 10.9491 10.8439 10.9193 10.8815 10.8817ZM8.02714 4.91889C8.02626 5.74285 7.69855 6.53281 7.11593 7.11544C6.5333 7.69807 5.74335 8.02578 4.9194 8.02667C4.09535 8.02593 3.30525 7.69829 2.72251 7.11564C2.13977 6.53299 1.81198 5.74295 1.8111 4.91889C1.81198 4.09493 2.13969 3.30496 2.72231 2.72233C3.30494 2.1397 4.09489 1.81199 4.91884 1.81111C5.74289 1.81185 6.53299 2.13949 7.11573 2.72214C7.69848 3.30478 8.02626 4.09483 8.02714 4.91889Z"
                fill="#676767"
                stroke="#676767"
                strokeWidth="0.5"
              />
            </svg>
            <input
              className="text-[#00000073] text-[14px] bg-transparent w-full outline-none"
              placeholder="Search"
              type="text"
            />
          </div>
          <div className="flex flex-row items-center px-5 justify-between">
            <p className="font-normal text-[#000000A6] text-[12px]">Sort by</p>
            <SortDropdown />
          </div>
          {/* contacts */}
          <div className="flex flex-col">
            {dbUsers && dbUsers.length !== 0
              ? dbUsers.map((user, i) => {
                  const roomName = user.roomName;
                  const dpUrl = user.user.dpUrl ? user.user.dpUrl : "";
                  const latestMessage =
                      user.messages && user.messages.length > 0
                        ? user.messages[user.messages.length - 1]
                        : "",
                    lastMessage =
                      latestMessage && latestMessage.sender === "admin"
                        ? `You: ${latestMessage.message}`
                        : latestMessage && latestMessage.sender !== "admin"
                        ? `${latestMessage.message}`
                        : `Start A conversation with ${roomName}`,
                    // LtestMessageSender = latestMessage ? latestMessage.sender : '',
                    latestMessageTime = latestMessage ? latestMessage.time : "";

                  return (
                    <Contact
                      key={i}
                      isActive={i === activeIndexUsers}
                      onClick={() => handleContactClickUsers(i)}
                      name={roomName}
                      dpUrl={dpUrl}
                      lastMessage={lastMessage}
                      lastTime={latestMessageTime}
                      unreadMessages={5}
                    />
                  );
                })
              : "No Chats"}

            {rooms?.length !== 0 &&
              rooms
                .filter(
                  (room) => !dbUsers?.some((user) => user.roomName === room[0])
                )
                .map((room, i) => {
                  const roomName = room[0];
                  const dpUrl = room[1]?.user?.dpurl ? room[1].user.dpurl : "";
                  const latestMessage =
                    room[1]?.messages && room[1].messages.length > 0
                      ? room[1].messages[room[1].messages.length - 1]
                      : null; // Modified to handle case where there are no messages
                  const lastMessage =
                    latestMessage && latestMessage.sender === "admin"
                      ? `You: ${latestMessage.message}`
                      : latestMessage && latestMessage.sender !== "admin"
                      ? `${latestMessage.message}`
                      : `Start A conversation with ${roomName}`;
                  const latestMessageTime = latestMessage
                    ? latestMessage.time
                    : "";

                  return (
                    <Contact
                      key={i}
                      isActive={i === activeIndexRooms}
                      onClick={() => handleContactClickRooms(i)}
                      name={roomName}
                      dpUrl={dpUrl}
                      lastMessage={lastMessage}
                      lastTime={latestMessageTime}
                      unreadMessages={5}
                    />
                  );
                })}
          </div>
        </div>
        {/* display whoever's isActive is true */}
        {activeIndexRooms !== -1 || activeIndexUsers !== -1 ? (
          <div className="flex flex-col w-full justify-between">
            <div className="flex fex-row justify-between border-b border-[#EEEEEE] px-2 py-5">
              <div className="userData flex flex-row items-center space-x-3">
                <Image
                  className="rounded-full"
                  src={activeIndexUsers !== -1 ? dbUsers[activeIndexUsers].user.dpUrl : rooms[activeIndexRooms][1].user.dpurl} //{rooms[activeIndex][1].user.dpurl}
                  width={42}
                  height={42}
                  alt="User Pic"
                />
                <p className="text-[#494345] font-medium">
                  {activeIndexUsers !== -1 ? dbUsers[activeIndexUsers].user.username : rooms[activeIndexRooms][0]}{" "}
                </p>
              </div>
              <button
                onClick={saveChat}
                title="This button ends the chat and saves it to the DB"
                className="bg-[#F24187] text-white px-2 rounded font-medium"
              >
                End Chat!
              </button>
              <div className=" flex flex-row items-center space-x-3">
                <button title="Pin the user to your chat">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.4589 8.06069L16.205 9.31367L15.5786 8.68718L11.8196 12.4461L11.1931 15.5794L9.93927 16.8324L6.18034 13.0726L1.79402 17.4589L0.541046 16.2059L4.92736 11.8196L1.16754 8.06069L2.42051 6.80683L5.55473 6.18034L9.31367 2.4214L8.68718 1.79491L9.94016 0.541046L17.4589 8.06069Z"
                      fill="black"
                      fillOpacity="0.45"
                    />
                  </svg>
                </button>
                <button
                  title={`you are chatting with ${activeIndexUsers !== -1 ? dbUsers[activeIndexUsers].user.username : rooms[activeIndexRooms][0]} now`}
                >
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 42 42"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 30C16.0293 30 12 25.9707 12 21C12 16.0293 16.0293 12 21 12C25.9707 12 30 16.0293 30 21C30 25.9707 25.9707 30 21 30ZM21 28.2C22.9096 28.2 24.7409 27.4414 26.0912 26.0912C27.4414 24.7409 28.2 22.9096 28.2 21C28.2 19.0904 27.4414 17.2591 26.0912 15.9088C24.7409 14.5586 22.9096 13.8 21 13.8C19.0904 13.8 17.2591 14.5586 15.9088 15.9088C14.5586 17.2591 13.8 19.0904 13.8 21C13.8 22.9096 14.5586 24.7409 15.9088 26.0912C17.2591 27.4414 19.0904 28.2 21 28.2ZM20.1 16.5H21.9V18.3H20.1V16.5ZM20.1 20.1H21.9V25.5H20.1V20.1Z"
                      fill="black"
                      fillOpacity="0.45"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div id="js-messages" className="flex flex-col justify-end w-full">
              {/* Get the messages of db for this user */}
              {dbMessages && dbMessages.messages
                ? dbMessages.messages.map((message, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-${
                        message.sender === "admin" ? "end" : "start"
                      } ${
                        message.sender === "admin"
                          ? "bg-[#F24187]"
                          : "bg-[#F4F4F7]"
                      } rounded-lg w-fit px-2 py-1 ${
                        message.sender === "admin" ? "ms-auto" : "ms-[15px]"
                      } me-[15px] mb-2`}
                    >
                      <p
                        className={`${
                          message.sender === "admin"
                            ? "text-[#FAFAFA]"
                            : "text-[#494345]"
                        } text-[14px] font-normal`}
                      >
                        {message.message}
                      </p>
                      <p
                        className={`${
                          message.sender === "admin"
                            ? "text-[#FAFAFA]"
                            : "text-[#00000073]"
                        } text-[12px] font-light`}
                      >
                        {`${message.time.split(":")[0]}:${
                          message.time.split(":")[1]
                        }`}
                      </p>
                    </div>
                  ))
                : "wait"}

              {/* Get the messages from socket.io for the particular room */}
              {(dbUsers?.[activeIndexUsers] || rooms?.[activeIndexRooms]) &&
                rooms
                  .find(
                    (room) => activeIndexUsers !== -1
                    ? room[0] === dbUsers[activeIndexUsers].roomName
                    : room[0] === rooms[activeIndexRooms][0]
                  )?.[1]
                  ?.messages.map((message, i) => {
                    // Check if the message is not in dbMessages
                    const isNotInDb =
                      dbMessages && dbMessages.messages
                        ? !dbMessages?.messages.some(
                            (dbMessage) => dbMessage.message === message.message
                          )
                        : true;

                    if (isNotInDb) {
                      return (
                        <div
                          key={i}
                          className={`flex flex-col items-${
                            message.sender === "admin" ? "end" : "start"
                          } ${
                            message.sender === "admin"
                              ? "bg-[#F24187]"
                              : "bg-[#F4F4F7]"
                          } rounded-lg w-fit px-2 py-1 ${
                            message.sender === "admin" ? "ms-auto" : "ms-[15px]"
                          } me-[15px] mb-2`}
                        >
                          <p
                            className={`${
                              message.sender === "admin"
                                ? "text-[#FAFAFA]"
                                : "text-[#494345]"
                            } text-[14px] font-normal`}
                          >
                            {message.message}
                          </p>
                          <p
                            className={`${
                              message.sender === "admin"
                                ? "text-[#FAFAFA]"
                                : "text-[#00000073]"
                            } text-[12px] font-light`}
                          >
                            {`${message.time.split(":")[0]}:${
                              message.time.split(":")[1]
                            }`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}

              <div className="px-5 pb-5 flex flex-row mt-4">
                <input
                  className="outline-none w-full bg-[#FFF1F7] px-2 py-4 me-5 rounded"
                  type="text"
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e)}
                  placeholder="Type your message here.."
                />
                <button
                  className="bg-[#F24187] outline-none p-2 rounded-[10px]"
                  onClick={handleAdminSend}
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
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center mx-auto">
            <p className="font-semibold text-gray-400 capitalize">
              no Active tabs
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
