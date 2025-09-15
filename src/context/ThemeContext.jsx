import React, { createContext, useContext, useState, useEffect } from "react";
import theme1 from "../assets/pageBG/theme/Alone-Camille.gif";
import theme2 from "../assets/pageBG/theme/Animated-Pixel Art-by-Kirokaze.gif";
import theme3 from "../assets/pageBG/theme/hikikomori.gif";
import theme4 from "../assets/pageBG/theme/Megapolis-rain.gif";
import theme5 from "../assets/pageBG/theme/Pixel-Art-collection-late 2016-Jason-Tammemagi.gif";
import theme6 from "../assets/pageBG/theme/sea-moon.gif";
import theme7 from "../assets/pageBG/theme/Smoking-Joe.gif";
import theme8 from "../assets/pageBG/theme/The-Chainsmokers-feat_Blink182.gif";
import theme9 from "../assets/pageBG/theme/Train-station.gif";

// Theme backgrounds for multiple themes
const themes = {
    default: { background: "var(--page-mainBG)" },  // Default theme (use CSS variable)

    aloneCamille: { background: theme1 },
    roadRide: { background: theme2 },
    cozyHome: { background: theme3 },
    megapolisRain: { background: theme4 },
    streetRain: { background: theme5 },
    seaMoon: { background: theme6 },
    smokingJoe: { background: theme7 },
    catByCurtain: { background: theme8 },
    trainStation: { background: theme9 },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const themeKeys = Object.keys(themes);

    // Read from localStorage first, fallback to "default"
    const getInitialTheme = () => {
        const stored = localStorage.getItem("app-theme");
        return stored && themeKeys.includes(stored) ? stored : "default";
    };

    const [theme, setTheme] = useState(getInitialTheme);

    // Apply theme changes to <html>
    useEffect(() => {
        const bg = themes[theme]?.background || "var(--page-mainBG)";
        const target = document.documentElement;

        const isGif = typeof bg === "string" && bg.endsWith(".gif");

        target.style.backgroundImage = isGif ? `url(${bg})` : "none";
        target.style.backgroundColor = !isGif ? bg : "var(--page-mainBG)";
        target.style.backgroundSize = isGif ? "cover" : "initial";
        target.style.backgroundRepeat = "no-repeat";
        target.style.backgroundPosition = "center";
        target.style.backgroundAttachment = "fixed"; // keep static when scrolling

        // Persist selection to localStorage
        localStorage.setItem("app-theme", theme);
    }, [theme]);

    // 🔧 reset function for logout
    const resetTheme = () => {
        setTheme("default");
        localStorage.removeItem("app-theme");
    };

    const getMedia = (themeKey = theme, mediaKey = "background") => {
        return themes[themeKey]?.[mediaKey] || "";
    };

    const toggleTheme = () => {
        const currentIdx = themeKeys.indexOf(theme);
        const nextIdx = (currentIdx + 1) % themeKeys.length;
        setTheme(themeKeys[nextIdx]);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, getMedia, themeKeys, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
