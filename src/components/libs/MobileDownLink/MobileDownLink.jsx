import React, { useEffect, useState } from "react";
import "./MobileDownLink.css";
import { Dialog } from "@mui/material";
// import assets
import QRcode2 from "../../../assets/mobileRedirect/qrcode_c2.svg";
import AndroidBtn from "../../../assets/mobileRedirect/android-download.png";

export default function MobileDownLink({ open, onClose }) {
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // close expanded when modal closed
        if (!open) setIsExpanded(false);
    }, [open]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                if (isExpanded) setIsExpanded(false);
                else if (open) onClose?.();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isExpanded, open, onClose]);

    if (!open) return null;

    const openFullscreen = (e) => {
        e.stopPropagation();
        setIsExpanded(true);
    };

    const closeFullscreen = (e) => {
        if (e) e.stopPropagation();
        setIsExpanded(false);
    };

    return (
        <>
            {/* Fullscreen for expanded QR (2nd modal) */}
            <Dialog
                open={isExpanded}
                onClose={closeFullscreen}
                fullScreen
                sx={{
                    "& .MuiDialog-paper": {
                        background: "rgba(0, 0, 0, 0.85)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    },
                }}
            >
                <div className="mobileDLink-expandedImg" onClick={closeFullscreen}>
                    <img
                        src={QRcode2}
                        alt="QR Code large"
                        className="mobileDLink-expandedImg-img"
                        onClick={(e) => closeFullscreen(e)}
                    />
                </div>
            </Dialog>

            {/* Main modal */}
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                sx={{
                    "& .MuiBackdrop-root": {
                        backgroundColor: "rgba(0,0,0,0.8)",
                        backdropFilter: "blur(6px)",
                    },
                    "& .MuiDialog-paper": {
                        background: "rgba(25, 25, 25, 0.7)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid var(--dark-1)",
                        borderRadius: "12px",
                        boxShadow: "0 0 20px rgba(255, 255, 255, 0.05)",
                        padding: "1.5rem",
                        color: "var(--light-1)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.6rem",
                    },
                }}
            >
                {/* Close button */}
                <button onClick={onClose} className="mobileDLink-close" aria-label="Close">
                    ✕
                </button>

                <div className="mobileDLink-header oxanium-regular">
                    <h2 className="oleo-script-bold">Feature exclusively for Android app</h2>
                    <p>Scan the QR code or click the button below to download the app.</p>
                </div>

                {/* QR Code - has hover overlay (fullscreen) */}
                <div className="mobileDLink-qr-wrapper" onClick={openFullscreen}>
                    <div className="mobileDLink-qr" aria-hidden>
                        <img src={QRcode2} alt="QR Code" />
                    </div>
                </div>

                <p className="mobileDLink-btwText oxanium-regular"> OR </p>

                {/* Download Button */}
                <div className="mobileDLink-download">
                    <a
                        href="https://expo.dev/accounts/minhtruong123a/projects/SEP490_FE_mobile/builds/97177622-c7fd-482c-b6dc-e42fb14db8c6"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src={AndroidBtn} alt="Download for Android" />
                    </a>
                </div>
            </Dialog>
        </>
    );
}
