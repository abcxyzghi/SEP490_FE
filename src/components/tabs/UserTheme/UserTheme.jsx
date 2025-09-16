import React from "react";
import "./UserTheme.css";
import { useTheme } from "../../../context/ThemeContext";

const TICK_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#22c55e" />
    <path
      d="M7 13.5L10.5 17L17 10.5"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function UserTheme() {
  const { theme, setTheme, themeKeys, getMedia } = useTheme();

  return (
    <div className="user-theme-selector-container">
      {themeKeys.map((key) => {
        const isActive = theme === key;
        const bgUrl = getMedia(key, "background") || "";
        const isGif = bgUrl.endsWith(".gif");
        
        return (
          <div
            key={key}
            className={`user-theme-preview-card${isActive ? " user-theme-active" : ""} oxanium-semibold`}
            style={{
              border: isActive ? "3px solid #22c55e" : undefined,
              boxShadow: isActive ? "0 0 0 2px #bbf7d0" : undefined,
              backgroundImage: isGif ? `url(${bgUrl})` : "none",
              backgroundSize: isGif ? "cover" : undefined,
              backgroundRepeat: isGif ? "no-repeat" : undefined,
              backgroundPosition: isGif ? "center" : undefined,
              backgroundColor: !isGif ? bgUrl : undefined,
            }}
            onClick={() => setTheme(key)}
            title={key}
          >
            <span className="user-theme-label">{key}</span>
            {isActive && <span className="user-theme-tick">{TICK_ICON}</span>}
          </div>
        );
      })}
    </div>
  );
}
