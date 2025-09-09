import React, { createContext, useContext, useState, useEffect } from "react";

// Theme backgrounds for multiple themes
const themes = {
    // Default theme (use CSS variable)
    default: { background: "var(--page-mainBG)" },

    // GIF themes
    aloneCamille: {
        background: "https://ik.imagekit.io/vbvs3wes4/themes/Alone-Camille.gif",
    },
    streetRain: {
        background: "https://ik.imagekit.io/vbvs3wes4/themes/Pixel-Art-collection-late%202016-Jason-Tammemagi.gif",
    },
    roadRide: {
        background: "https://ik.imagekit.io/vbvs3wes4/themes/Animated-Pixel%20Art-by-Kirokaze.gif",
    },
    seaMoon: {
        background: "https://ik.imagekit.io/vbvs3wes4/themes/sea-moon.gif",
    },
    cozyHome: {
        background: "https://ik.imagekit.io/vbvs3wes4/themes/hikikomori.gif",
    },
    trainStation: {
        background: "https://ik.imagekit.io/vbvs3wes4/themes/Train-station.gif",
    },
    megapolisRain: {
        background: "https://ik.imagekit.io/vbvs3wes4/themes/Megapolis-rain.gif",
    },
    catByCurtain: {
        background: "https://ik.imagekit.io/vbvs3wes4/themes/The-Chainsmokers-feat_Blink182.gif",
    },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Default theme: always 'default' on first load
    const getDefaultTheme = () => "default";
    const [theme, setTheme] = useState(getDefaultTheme());

    useEffect(() => {
        const bg = themes[theme]?.background || "var(--page-mainBG)";
        const target = document.documentElement; // apply to <html>, not just body

        target.style.backgroundImage = bg.startsWith("http")
            ? `url(${bg})`
            : "none";
        target.style.backgroundColor = !bg.startsWith("http")
            ? bg
            : "var(--page-mainBG)";
        target.style.backgroundSize = bg.startsWith("http")
            ? "cover"
            : "initial";
        target.style.backgroundRepeat = "no-repeat";
        target.style.backgroundPosition = "center";
        target.style.backgroundAttachment = "fixed"; // keep static when scrolling
    }, [theme]);

    const getMedia = (themeKey = theme, mediaKey = 'background') => {
        if (!themes[themeKey]) return '';
        return themes[themeKey][mediaKey] || '';
    };

    const themeKeys = Object.keys(themes);

    const toggleTheme = () => {
        const currentIdx = themeKeys.indexOf(theme);
        const nextIdx = (currentIdx + 1) % themeKeys.length;
        setTheme(themeKeys[nextIdx]);
    };

    return (
        <ThemeContext.Provider
            value={{ theme, setTheme, toggleTheme, getMedia, themeKeys }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
