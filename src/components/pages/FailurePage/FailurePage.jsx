import React from "react";
import { useNavigate } from "react-router-dom";

export default function FailurePage() {
    const navigate = useNavigate();

    const handleTryAgain = () => {
        navigate("/"); // hoặc trang nạp tiền của bạn
    };

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2 style={{ color: "red" }}>❌ Nạp tiền thất bại!</h2>

            <button
                onClick={handleTryAgain}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                Home
            </button>
        </div>
    );
}
