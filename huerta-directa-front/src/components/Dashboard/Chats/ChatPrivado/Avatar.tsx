import React from "react";

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = "w-10 h-10",
}) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${size} rounded-full object-cover shrink-0`}
      />
    );
  }

  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center shrink-0 text-white text-sm font-black`}
      style={{ background: "linear-gradient(135deg, #4caf50, #2e7d32)" }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
