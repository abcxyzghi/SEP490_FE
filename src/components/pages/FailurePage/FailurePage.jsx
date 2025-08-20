import React from "react";
import './FailurePage.css';
import { useNavigate } from "react-router-dom";
import { PATH_NAME } from '../../../router/Pathname';

export default function FailurePage() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate(PATH_NAME.HOMEPAGE);
    };

    const handleTryAgain = () => {
        navigate(PATH_NAME.PAYMENT_PAGE);
    };

    return (
        <div className="failurepage-container">
            <div className="failurepage-card">
                <div className="failurepage-icon">❌</div>
                <h2 className="failurepage-title oleo-script-bold">Payment Failed!</h2>
                <p className="failurepage-subtitle oxanium-regular">
                    It's okay, everyone has financial difficulties. <br/>
                    Until next time ( ͡~ ͜ʖ ͡°)
                </p>
                <div className="failurepage-actions oxanium-regular">
                    <button className="failurepage-btn failurepage-tryagainText" onClick={handleTryAgain}>
                        Try Again
                    </button>
                    <button className="failurepage-btn failurepage-homeText" onClick={handleGoHome}>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
