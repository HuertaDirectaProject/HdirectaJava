import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faImage,
  faVideo,
  faXmark,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import type { MediaPreview } from "../../../../hooks/Chats/useChatPrivado";

interface ChatPrivadoInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  uploading: boolean;
  mediaPreview: MediaPreview | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  sendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearMediaPreview: () => void;
}

export const ChatPrivadoInput: React.FC<ChatPrivadoInputProps> = ({
  inputValue,
  setInputValue,
  uploading,
  mediaPreview,
  fileInputRef,
  sendMessage,
  handleKeyDown,
  handleFileSelect,
  clearMediaPreview,
}) => {
  return (
    <>
      {/* Preview del archivo seleccionado */}
      {mediaPreview && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="relative inline-block">
            {mediaPreview.type === "IMAGE" ? (
              <img
                src={mediaPreview.url}
                alt="preview"
                className="h-20 w-auto rounded-xl object-cover border border-gray-200 dark:border-gray-600"
              />
            ) : (
              <video
                src={mediaPreview.url}
                className="h-20 w-auto rounded-xl border border-gray-200 dark:border-gray-600"
              />
            )}
            <button
              onClick={clearMediaPreview}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end gap-2">
          {/* Botones adjuntar */}
          <div className="flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              id="private-image-input"
            />
            <label
              htmlFor="private-image-input"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-colors cursor-pointer shrink-0"
              title="Enviar imagen"
            >
              <FontAwesomeIcon icon={faImage} className="text-sm" />
            </label>

            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
              id="private-video-input"
            />
            <label
              htmlFor="private-video-input"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-colors cursor-pointer shrink-0"
              title="Enviar video"
            >
              <FontAwesomeIcon icon={faVideo} className="text-sm" />
            </label>
          </div>

          {/* Textarea */}
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-400 dark:focus:border-green-500 focus:bg-white dark:focus:bg-gray-600 transition-all"
            style={{ maxHeight: "120px" }}
          />

          {/* Botón enviar */}
          <button
            onClick={sendMessage}
            disabled={uploading || (!inputValue.trim() && !mediaPreview)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4caf50, #2e7d32)",
            }}
          >
            {uploading ? (
              <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPrivadoInput;