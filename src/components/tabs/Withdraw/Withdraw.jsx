import React, { useState, useEffect } from "react";
import './Withdraw.css';
import { createWithdrawTransaction, getProfile } from "../../../services/api.user";
import { fetchUserInfo } from "../../../services/api.auth";
import MessageModal from "../../libs/MessageModal/MessageModal";
import { checkIsJoinedAuction } from "../../../services/api.auction";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bankInfo, setBankInfo] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [modal, setModal] = useState({ open: false, type: "default", title: "", message: "" });

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN").format(n) + " VND";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy bank info
        const profileRes = await getProfile();
        if (profileRes) {
          setBankInfo({
            bankId: profileRes.data.bankId,
            accountBankName: profileRes.data.accountBankName,
            banknumber: profileRes.data.banknumber,
          });
        }

        // Lấy wallet balance
        const userRes = await fetchUserInfo();
        if (userRes) {
          setWalletBalance(userRes.data.wallet_amount);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleWithdraw = async () => {
    const isJoined = await checkIsJoinedAuction();
    if (isJoined) {
      showModal(
        "warning",
        "Cannot Withdraw",
        "You cannot withdraw while participating in an auction."
      );
      return; // dừng hàm nếu đã tham gia auction
    }
    // Validate bank info
    if (!bankInfo || !bankInfo.bankId || !bankInfo.accountBankName || !bankInfo.banknumber) {
      return showModal("warning", "Missing Bank Info", "Please update your bank information before withdrawing.");
    }

    // Validate số tiền hợp lệ
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return showModal("warning", "Invalid Amount", "Please enter a valid amount to withdraw.");
    }

    // Validate số dư trong ví
    if (Number(amount) > walletBalance) {
      return showModal("warning", "Insufficient Balance", `Your withdraw amount exceeds your wallet balance (${walletBalance} VND).`);
    }


    setLoading(true);

    try {
      const res = await createWithdrawTransaction(Number(amount));
      if (res.status) {
        showModal("default", "Withdraw Request Sent", "Your withdrawal request has been submitted successfully.");
        setAmount("");
      } else {
        showModal(
          "error",
          "Transaction Failed",
          res.error || res.data?.message || "An unknown error occurred."
        );
      }
    } catch (error) {
      let serverMessage = error.message || "An unknown error occurred.";
      if (error.response && error.response.data) {
        serverMessage = error.response.data.error || error.response.data.message;
      }
      showModal("error", "Transaction Failed", serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdrawTab-container">
      <div className="withdrawTab-header">
        <h2 className="withdrawTab-title oleo-script-regular">Withdraw Wallet</h2>
        <p className="withdrawTab-subtitle oxanium-regular">
          Manage your wallet and transfer funds securely
        </p>
      </div>

      <div className="withdrawTab-balance oxanium-regular">
        <span>Available Balance:</span>{" "}
        <strong>{formatVND(walletBalance)}</strong>
      </div>

      <div className="withdrawTab-form oxanium-regular">
        <input
          type="number"
          min={1}
          placeholder="Enter amount"
          className="withdrawTab-input"
          value={amount}
          // onChange={(e) => setAmount(e.target.value)}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || Number(val) >= 1) {
              setAmount(val);
            }
          }}
        />

        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="withdrawTab-btn"
        >
          {loading ? <span className="loading loading-bars loading-md"></span> : "Send request"}
        </button>
      </div>

      <MessageModal
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
