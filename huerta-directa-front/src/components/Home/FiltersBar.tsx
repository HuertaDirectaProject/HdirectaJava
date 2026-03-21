import { useState } from "react";
import { Button } from "../GlobalComponents/Button";
import { faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FiltersPanel } from "./FiltersPanel";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface FiltersBarProps {
  title: string;
  icon?: IconDefinition;
}

export const FiltersBar = ({ title, icon }: FiltersBarProps) => {
  const [showPanel, setShowPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const applyFilters = (filters: string[]) => {
    setActiveFilters(filters);
    setShowPanel(false);
  };

  const removeFilter = (filterToRemove: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filterToRemove));
  };

  const clearAll = () => {
    setActiveFilters([]);
  };

return (
  <div className="relative">
    <div
      className="
        flex flex-col gap-4
        sm:flex-row sm:items-center sm:justify-between
        
        border border-gray-300/60 dark:border-slate-700
        p-4
        shadow-lg
        rounded-2xl
        bg-white dark:bg-[#1A221C]
        transition-colors
      "
    >
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-3 w-full">

        {/* TITLE + ICON */}
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl text-[#8dc84b]">
            {icon && <FontAwesomeIcon icon={icon} />}
          </span>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#8dc84b]">
            {title}
          </h1>
        </div>

        {/* FILTERS (SCROLLABLE EN MOBILE 🔥) */}
        <div
          className="
            flex items-center gap-2
            overflow-x-auto
            scrollbar-hide
          "
        >
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="
                flex items-center gap-2
                bg-gray-200 dark:bg-slate-700
                text-gray-800 dark:text-gray-200
                px-3 py-1
                rounded-full
                text-sm
                whitespace-nowrap
              "
            >
              {filter}

              <FontAwesomeIcon
                icon={faXmark}
                onClick={() => removeFilter(filter)}
                className="
                  cursor-pointer
                  text-gray-600 dark:text-gray-300
                  hover:text-red-500
                "
              />
            </span>
          ))}

          {/* CLEAR ALL */}
          {activeFilters.length > 0 && (
            <button
              onClick={clearAll}
              className="
                text-green-600 dark:text-green-400
                text-sm font-semibold
                hover:underline
                whitespace-nowrap
                ml-2
              "
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* BUTTON */}
      <div className="w-full sm:w-auto">
        <Button
          text="Filtros"
          iconLetf={faFilter}
          onClick={() => setShowPanel(!showPanel)}
          className="w-full sm:w-auto px-5 py-2"
        />
      </div>
    </div>

    {/* PANEL */}
    {showPanel && <FiltersPanel onApply={applyFilters} />}
  </div>
);
};