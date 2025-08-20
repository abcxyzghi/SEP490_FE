import { useEffect, useRef } from "react";
import './SuccessPayment.css';
import { useSearchParams, useNavigate } from "react-router-dom";
import { PATH_NAME } from '../../../router/Pathname';
import { useDispatch, useSelector } from "react-redux";
import { updateWallet } from "../../../redux/features/authSlice";

export default function SuccessPayment() {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentWalletAmount = useSelector(
        (state) => state.auth.user?.wallet_amount || 0
    );

    // Dùng ref để tránh gọi nhiều lần
    const hasUpdated = useRef(false);

    useEffect(() => {
        const status = searchParams.get("status");
        const cancel = searchParams.get("cancel");
        const amount = parseInt(searchParams.get("amount"));

        if (!hasUpdated.current && status === "PAID" && cancel === "false" && !isNaN(amount)) {
            const newWalletAmount = currentWalletAmount + amount;
            dispatch(updateWallet(newWalletAmount));
            hasUpdated.current = true; // Đánh dấu đã cập nhật
        }
    }, [searchParams, dispatch]);

    const handleGoHome = () => {
        navigate(PATH_NAME.HOMEPAGE);
    };

    const handleTryAgain = () => {
        navigate(PATH_NAME.PAYMENT_PAGE);
    };

    return (
        <div className="successpage-container">
            <div className="successpage-card">
                <div className="successpage-icon">🎉</div>
                <h2 className="successpage-title oleo-script-bold">Payment Successful!</h2>
                <p className="successpage-subtitle oxanium-regular">
                    Your wallet balance has been updated.
                </p>

                <div className="failurepage-actions oxanium-regular">
                    <button className="successpage-btn successpage-tryagainText" onClick={handleTryAgain}>
                        Continue Recharge
                    </button>
                    <button className="successpage-btn successpage-homeText" onClick={handleGoHome}>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
