"use client";
import Image from "next/image";
import React, { useState } from "react";

type Props = {
  isActive: boolean;
  onClick: () => void;
  name: string;
  dpUrl: string;
  lastMessage: string;
  lastTime: string;
  unreadMessages: number;
};

export default function Contact({
  isActive,
  onClick,
  name,
  dpUrl,
  lastMessage,
  lastTime,
  unreadMessages,
}: Props) {
  return (
    <div
      className={`flex flex-row justify-between hover:bg-[#FEEAF2] p-5 hover:cursor-pointer transition-all duration-[320] ease-in-out ${
        isActive ? "bg-[#FEEAF2]" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-row gap-x-3 items-center">
        {/* contact image, naem, pin??, text */}
        <Image
          className="rounded-full"
          src={dpUrl}
          width={36}
          height={36}
          alt="contact-image"
        />
        <div className="flex flex-col">
          <p className="text-[#494345] text-[14px] font-medium capitalize">
            {name}
          </p>
          <p className="text-[#00000073] text-[13px] font-normal">
            {lastMessage}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        {/* time, badge, maybe date! */}
        <p className="text-[14px] font-[#000000A6] font-normal">{lastTime}</p>
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
