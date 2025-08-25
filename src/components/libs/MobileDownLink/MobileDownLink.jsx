import React from "react";
import "./MobileDownLink.css";
// import assets
import QRcode2 from "../../../assets/mobileRedirect/qrcode_c2.svg";
import AndroidBtn from "../../../assets/mobileRedirect/android-download.png";

export default function MobileDownLink({ open, onClose }) {
    if (!open) return null;

    return (
        <div className="mobileDLink-overlay" onClick={onClose}>
            <div className="mobileDLink-container" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button onClick={onClose} className="mobileDLink-close">
                    ✕
                </button>

                {/* QR Code */}
                <div className="mobileDLink-qr-wrapper">
                    <div className="mobileDLink-qr">
                        <img src={QRcode2} alt="QR Code" />
                    </div>
                </div>

                <p className="mobileDLink-btwText"> Feature exclusively for Android app </p>

                {/* Download Button */}
                <div className="mobileDLink-download">
                    <a
                        href="https://expo.dev/accounts/minhtruong123a/projects/SEP490_FE_mobile/builds/a61e2760-e372-45d6-aa00-62f68e424af3"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src={AndroidBtn} alt="Download for Android" />
                    </a>
                </div>
            </div>
        </div>
    );
}
