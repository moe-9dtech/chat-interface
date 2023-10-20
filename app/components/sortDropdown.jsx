"use client";
import React, { useState } from "react";


export default function SortDropdown({}) {
  const [isActive, setIsActive] = useState(false);
  const [currentOpt, setCurrentOpt] = useState("Newst");

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center gap-x-1.5  py-2 text-sm font-semibold text-[#F24187]"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setIsActive(!isActive)}
        >
          {currentOpt}
          <svg
            className={`-mr-1 h-5 w-5 text-[#F24187] ${
              isActive ? "rotate-180" : ""
            } duration-300 ease-in-out`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {isActive === true && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[#FEEAF2] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1 px-5 divide-y divide-[#F24187]" role="none">
            <a
              className="flex flex-row justify-between items-center font-normal py-2 text-sm hover:cursor-pointer hover:text-[#F24187]"
              role="menuitem"
              id="menu-item-0"
              onClick={(e) => {
                const target = e.target;
                const textContent = target.textContent;
                setCurrentOpt(textContent !== null ? textContent : "");
                setIsActive(!isActive);
              }}
            >
              Pinned Chats
              {currentOpt === "Pinned Chats" && (
                <svg
                  width="13"
                  height="10"
                  viewBox="0 0 13 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.40597 7.44648L11.9031 0.948608L12.9033 1.94806L5.40597 9.44539L0.907715 4.94713L1.90717 3.94768L5.40597 7.44648Z"
                    fill="#F24187"
                  />
                </svg>
              )}
            </a>

            <a
              className="flex flex-row justify-between items-center font-normal py-2 text-sm hover:cursor-pointer hover:text-[#F24187]"
              role="menuitem"
              id="menu-item-0"
              onClick={(e) => {
                const target = e.target;
                const textContent = target.textContent;
                setCurrentOpt(textContent !== null ? textContent : "");
                setIsActive(!isActive);
              }}
            >
              Newst
              {currentOpt === "Newst" && (
                <svg
                  width="13"
                  height="10"
                  viewBox="0 0 13 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.40597 7.44648L11.9031 0.948608L12.9033 1.94806L5.40597 9.44539L0.907715 4.94713L1.90717 3.94768L5.40597 7.44648Z"
                    fill="#F24187"
                  />
                </svg>
              )}
            </a>
            <a
              className="flex flex-row justify-between items-center font-normal py-2 text-sm hover:cursor-pointer hover:text-[#F24187]"
              role="menuitem"
              id="menu-item-1"
              onClick={(e) => {
                const target = e.target;
                const textContet = target.textContent;
                setCurrentOpt(textContet !== null ? textContet : "");
                setIsActive(!isActive);
              }}
            >
              Oldest
              {currentOpt === "Oldest" && (
                <svg
                  width="13"
                  height="10"
                  viewBox="0 0 13 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.40597 7.44648L11.9031 0.948608L12.9033 1.94806L5.40597 9.44539L0.907715 4.94713L1.90717 3.94768L5.40597 7.44648Z"
                    fill="#F24187"
                  />
                </svg>
              )}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
