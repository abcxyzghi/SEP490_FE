import React, { useState, useEffect } from "react";
import { createWithdrawTransaction, getProfile } from "../../../services/api.user";
import { fetchUserInfo } from "../../../services/api.auth";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bankInfo, setBankInfo] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

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
    // Validate bank info
    if (!bankInfo || !bankInfo.bankId || !bankInfo.accountBankName || !bankInfo.banknumber) {
      setMessage("Chưa có thông tin ngân hàng, vui lòng cập nhật trước khi rút tiền.");
      return;
    }

    // Validate số tiền hợp lệ
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    // Validate số dư trong ví
    if (Number(amount) > walletBalance) {
      setMessage(`Số tiền rút vượt quá số dư hiện tại (${walletBalance})`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await createWithdrawTransaction(Number(amount));
      if (res) {
        setMessage("Gửi yêu cầu rút tiền thành công!");
      } else {
        setMessage("Có lỗi xảy ra khi tạo yêu cầu rút tiền.");
      }
    } catch (error) {
      console.log(error);
      setMessage("Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white border rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Withdraw</h2>

      <p className="text-sm text-gray-600 mb-4">
        Số dư khả dụng: <span className="font-bold">{walletBalance} VNĐ</span>
      </p>

      <input
        type="number"
        placeholder="Nhập số tiền cần rút"
        className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        onClick={handleWithdraw}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Đang xử lý..." : "Rút tiền"}
      </button>

      {message && <p className="mt-3 text-sm text-center text-gray-700">{message}</p>}
    </div>
  );
}
