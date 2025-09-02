import React, { useEffect, useState } from "react";
import "./MobileDownLink.css";
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
        e.stopPropagation();
        setIsExpanded(false);
    };

    return (
        <>
            {/* Fullscreen for expanded QR (high z-index) */}
            {isExpanded && (
                <div
                    className="mobileDLink-fullscreen-overlay"
                    onClick={closeFullscreen}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="mobileDLink-expandedImg"
                        onClick={closeFullscreen}
                    >
                        <img
                            src={QRcode2}
                            alt="QR Code large"
                            className="mobileDLink-expandedImg-img"
                        />
                    </div>
                </div>
            )}

            {/* Main modal */}
            <div className="mobileDLink-overlay" onClick={onClose}>
                <div
                    className="mobileDLink-container"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Close button */}
                    <button onClick={onClose} className="mobileDLink-close" aria-label="Close">
                        ✕
                    </button>

                    <div className="mobileDLink-header">
                        <h2 className="oleo-script-bold">Feature exclusively for Android app</h2>
                        <p>Scan the QR code or click the button below to download the app.</p>
                    </div>

                    {/* QR Code - has hover overlay (fullscreen) */}
                    <div className="mobileDLink-qr-wrapper" onClick={openFullscreen}>
                        <div className="mobileDLink-qr" aria-hidden>
                            <img src={QRcode2} alt="QR Code" />
                        </div>
                    </div>

                    <p className="mobileDLink-btwText"> OR </p>

                    {/* Download Button */}
                    <div className="mobileDLink-download">
                        <a
                            href="https://expo.dev/accounts/minhtruong123a/projects/SEP490_FE_mobile/builds/9e8efc8c-a6af-40c7-9714-d65d9c02621d"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={AndroidBtn} alt="Download for Android" />
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
