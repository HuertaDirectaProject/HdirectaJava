import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

type LoadingType = "spinner" | "dots" | "pulse";

interface ButtonProps {
  to?: string;
  text: string;
  iconLetf?: IconDefinition;
  iconRight?: IconDefinition;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  loadingType?: LoadingType;
  loadingText?: string;
}

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const LoadingDots = () => (
  <div className="flex gap-1">
    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
  </div>
);

const LoadingPulse = () => (
  <div className="flex gap-1">
    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "75ms" }} />
    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
  </div>
);

export const Button = ({
  to,
  text,
  type = "button",
  iconLetf,
  iconRight,
  onClick,
  disabled,
  className,
  isLoading = false,
  loadingType = "spinner",
  loadingText,
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center cursor-pointer justify-center gap-2 text-white bg-[#8dc84b] rounded-[5px] transition-all duration-500 ease-in-out hover:scale-105 hover:bg-[#5aaa37] disabled:opacity-50 disabled:cursor-not-allowed";

  const finalClasses = `${baseClasses} ${className ?? ""}`;
  const isDisabled = disabled || isLoading;

  const renderLoadingIndicator = () => {
    switch (loadingType) {
      case "dots":
        return <LoadingDots />;
      case "pulse":
        return <LoadingPulse />;
      case "spinner":
      default:
        return <LoadingSpinner />;
    }
  };

  const content = isLoading ? (
    <>
      {renderLoadingIndicator()}
      <span>{loadingText || "Cargando..."}</span>
    </>
  ) : (
    <>
      {iconLetf && <FontAwesomeIcon icon={iconLetf} />}
      <span>{text}</span>
      {iconRight && <FontAwesomeIcon icon={iconRight} />}
    </>
  );

  if (to && !isLoading) {
    return (
      <Link to={to} className={finalClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={finalClasses}
    >
      {content}
    </button>
  );
};