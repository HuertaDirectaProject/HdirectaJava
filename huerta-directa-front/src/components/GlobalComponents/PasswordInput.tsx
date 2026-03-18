import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

interface PasswordInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  name,
  value,
  onChange,
  placeholder = "Contraseña",
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full mb-2">
      <div className="flex items-center min-w-full relative">
        
        {/* 🔒 Icono izquierdo */}
        <div className="absolute left-3 text-[#888]">
          <FontAwesomeIcon icon={faLock} />
        </div>

        {/* Input */}
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="py-2.5 pl-10 pr-12 w-full my-1.5 dark:text-gray-300! border-2 border-[#8dc84b] rounded-[15px] outline-none text-base text-[#333128] transition-all duration-300 focus:border-[#004d00] focus:shadow-[0_0_8px_rgba(0,77,0,0.4)]"
        />

        {/* 👁 Icono derecho dinámico */}
        <div className="absolute right-4 text-[#888] cursor-pointer hover:text-[#004d00] transition-colors">
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
      </div>
    </div>
  );
};