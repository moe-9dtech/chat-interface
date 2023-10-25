"use client";
import Image from "next/image";
import React, { useState } from "react";

export default function Contact({
  isActive,
  onClick,
  name,
  dpUrl,
  lastMessage,
  lastTime,
  unreadMessages,
}) {
  return (
    <div
      className={`flex flex-row justify-between hover:bg-[#FEEAF2] p-5 hover:cursor-pointer transition-all duration-[320] ease-in-out ${
        isActive ? "bg-[#FEEAF2]" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-row gap-x-3 items-center min-w-0">
        {/* contact image, naem, pin??, text */}
        <Image
          className="rounded-full"
          src={dpUrl}
          width={36}
          height={36}
          alt="contact-image"
        />
        <div className="flex flex-col min-w-0">
          <p className="text-[#494345] text-[14px] font-medium capitalize">
            {name}
          </p>
            <p className="text-[#00000073] text-[13px] whitespace-nowrap overflow-hidden text-overflow-ellipsis flex-shrink-1">
              {lastMessage}
            </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        {/* time, badge, maybe date! */}
        <p className="text-[14px] font-[#000000A6] font-normal">{`${lastTime ? lastTime.split(":")[0] : ""}${lastTime ? ":" : ""}${lastTime ? lastTime.split(":")[1] : ""}`}</p>
        {unreadMessages !== 0 && (
          <div className="bg-[#F24187] flex justify-center items-center rounded-full w-[20px] h-[20px]">
            <p className="text-white font-medium text-[12px]">
              {unreadMessages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
