import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface Props {
  title: string;
  label: string;
  value: string | number;
  icon: IconDefinition;
}

export const SummaryCard: React.FC<Props> = ({ title, label, value, icon }) => {
  return (
    <div className="
      bg-white 
      dark:bg-[#1A221C]
      p-8 
      rounded-3xl 
      shadow-sm 
      border 
      border-gray-100 
      dark:border-[#24302A]
    ">
      
      <h2 className="
        text-xl 
        font-bold 
        mb-4 
        text-gray-800 
        dark:text-white
      ">
        {title}
      </h2>

      <div className="flex flex-col gap-4">

        <div className="
          flex 
          items-center 
          gap-4 
          p-4 
          bg-gray-50/50 
          dark:bg-[#101922]
          rounded-2xl 
          hover:bg-gray-100 
          dark:hover:bg-[#111712]
          transition-all 
          cursor-pointer
        ">

          <div className="
            w-10 
            h-10 
            rounded-full 
            bg-[#8dc84b] 
            text-white 
            flex 
            items-center 
            justify-center
          ">
            <FontAwesomeIcon icon={icon} />
          </div>

          <div className="flex-1">
            <h3 className="
              text-xs 
              font-bold 
              text-gray-400 
              dark:text-gray-300
            ">
              {label}
            </h3>

            <p className="
              font-bold 
              text-lg 
              text-gray-800 
              dark:text-white
            ">
              {value}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};