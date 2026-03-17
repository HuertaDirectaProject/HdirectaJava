import React from "react";

export interface InsightItem {
  title: string;
  value: string;
  percentage: number;
  footer: string;
  color: string;
}

interface Props {
  insights: InsightItem[];
}

export const InsightsGrid: React.FC<Props> = ({ insights }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {insights.map((item, idx) => {
        const borderColor =
          item.color === "expenses"
            ? "before:bg-[#ff5252]"
            : "before:bg-[#8dc84b]";

        return (
          <div
            key={idx}
            className={`bg-white dark:bg-[#1A221C] p-10 rounded-4xl shadow-lg 
            hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-[#24302A]
            transition-all duration-300 flex flex-col min-h-45 relative overflow-hidden
            ${borderColor}
            before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-2`}
          >
            <div className="flex items-center justify-between mt-4">

              {/* Texto */}
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-[#6b7280] uppercase tracking-widest">
                  {item.title}
                </h3>

                <h1 className="text-3xl font-black mt-2 text-gray-900 dark:text-white tracking-tight">
                  {item.value}
                </h1>
              </div>

              {/* Progreso circular */}
              <div className="relative w-16 h-16 flex items-center justify-center font-extrabold text-sm">

                <svg className="w-16 h-16 transform -rotate-90">

                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="#e5e7eb"
                    className="dark:stroke-[#24302A]"
                    strokeWidth="7"
                  />

                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke={item.color === "expenses" ? "#ff5252" : "#8dc84b"}
                    strokeWidth="7"
                    strokeDasharray="163"
                    strokeLinecap="round"
                    style={{
                      strokeDashoffset: 163 * (1 - item.percentage / 100),
                      transition: "stroke-dashoffset 1.5s ease-out",
                    }}
                  />
                </svg>

                <p className="absolute text-gray-800 dark:text-white text-sm">
                  {item.percentage}%
                </p>

              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-4">

              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  item.color === "expenses"
                    ? "bg-[#ff5252]/20 text-[#ff5252]"
                    : "bg-[#8dc84b]/20 text-[#8dc84b]"
                }`}
              >
                {item.color === "expenses" ? "Alto" : "Estable"}
              </span>

              <small className="text-[#6b7280] font-bold text-[11px]">
                {item.footer}
              </small>

            </div>
          </div>
        );
      })}
    </div>
  );
};