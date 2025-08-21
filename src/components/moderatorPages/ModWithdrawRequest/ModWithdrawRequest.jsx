import React, { useEffect, useState } from "react";
import {
  getAllWithdrawTransactionRequest,
  acceptWithdrawRequest,
  rejectWithdrawRequest,
} from "../../../services/api.transaction";
import "./ModWithdrawRequest.css";
import { toast } from "react-toastify";
import moment from "moment";

export default function ModWithdrawRequest() {
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending"); // pending | others
  const [banks, setBanks] = useState([]);

  // Fetch banks từ VietQR API
  const fetchBanks = async () => {
    try {
      const res = await fetch("https://api.vietqr.io/v2/banks");
      const data = await res.json();
      if (data?.data) {
        setBanks(data.data);
      }
    } catch (err) {
      console.error("Error fetch banks:", err);
      toast.error("Không tải được danh sách ngân hàng");
    }
  };

  // Fetch withdraw requests
  const fetchWithdrawRequests = async () => {
    const res = await getAllWithdrawTransactionRequest();
    console.log("Withdraw API response:", res); // 👈 Thêm dòng này
    if (res?.success || res?.status) {
        setWithdrawRequests(res.data);
    } else {
        toast.error("Error loading withdraw requests");
    }
    };


  // Approve
  const handleAcceptRequest = async (transactionId) => {
    const transactionCode = prompt("Nhập Transaction Code:");
    if (!transactionCode) return;

    const res = await acceptWithdrawRequest(transactionId, transactionCode);
    if (res?.success) {
    toast.success("Withdraw request accepted");
    await fetchWithdrawRequests();
    setTimeout(() => {
        fetchWithdrawRequests();
        }, 3000);
    } else {
      toast.error("Failed to accept withdraw request");
    }
  };

  // Reject
  const handleRejectRequest = async (transactionId) => {
    const res = await rejectWithdrawRequest(transactionId);
    if (res?.success) {
      toast.success("Withdraw request rejected");
    await fetchWithdrawRequests();
    setTimeout(() => {
        fetchWithdrawRequests();
        }, 3000);
    } else {
      toast.error("Failed to reject withdraw request");
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchWithdrawRequests();
  }, []);

  // lọc requests theo status
  const pendingRequests = withdrawRequests.filter(
    (req) => req.status === "Pending"
  );
  const otherRequests = withdrawRequests.filter(
    (req) => req.status !== "Pending"
  );

  // render card
const renderWithdrawRequestCard = (request) => {
  const bankInfo = banks.find(
    (b) => String(b.id) === request.bankId
    ) || null;


  return (
    <div key={request.id} className="withdraw-request-card fade-in">
      <p>
        <strong>ID:</strong> {request.id}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {request.status === "Success" ? (
          <span className="status-approved">✅ Success</span>
        ) : request.status === "Cancel" ? (
          <span className="status-rejected">❌ Cancel</span>
        ) : (
          <span className="status-pending">⌛ Pending</span>
        )}
      </p>
      <p>
        <strong>Amount:</strong> {request.amount.toLocaleString()} VND
      </p>
      <p>
        <strong>Time:</strong>{" "}
        {moment(request.dataTime).format("DD/MM/YYYY HH:mm")}
      </p>
      <p>
        <strong>User:</strong> {request.userName}
      </p>

      {/* Bank Info */}
      {bankInfo ? (
        <div className="bank-info">
          <img src={bankInfo.logo} alt={bankInfo.name} width="100" />
          <div>
            <p>
              <strong>Bank:</strong> {bankInfo.shortName} ({bankInfo.code})
            </p>
            <p>
              <strong>Bank Name:</strong> {bankInfo.name}
            </p>
            <p>
              <strong>Short Name Bank:</strong> {bankInfo.shortName}
            </p>
            <p>
              <strong>Account Bank Name:</strong> {request.accountBankName || "N/A"}
            </p>
            <p>
              <strong>Bank Number:</strong> {request.bankNumber}
            </p>
          </div>
        </div>
      ) : (
        <>
        <p>
            <strong>Bank:</strong> {bankInfo.name}
        </p>
        <p>
            <strong>Short Name Bank:</strong> {bankInfo.shortName || "N/A"}
        </p>
          <p>
            <strong>Account Bank Name:</strong> {request.accountBankName || "N/A"}
          </p>
          <p>
            <strong>Bank Number:</strong> {request.bankNumber}
          </p>
        </>
      )}

      {request.status === "Pending" && (
        <div className="withdraw-actions">
          <button
            className="mod-btn-approve"
            onClick={() => handleAcceptRequest(request.id)}
          >
            ✅ Approve
          </button>
          <button
            className="mod-btn-reject"
            onClick={() => handleRejectRequest(request.id)}
          >
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
};


  return (
    <div className="mod-withdraw-container">
      <h2>List Withdraw Request</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "Pending" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("Pending")}
        >
          Pending
        </button>
        <button
          className={activeTab === "Others" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("Others")}
        >
          Processed
        </button>
      </div>

      {/* Content */}
      <div className="mod-withdraw-request-card-list">
        {activeTab === "Pending"
          ? pendingRequests.length > 0
            ? pendingRequests.sort((a, b) => new Date(b.dataTime) - new Date(a.dataTime)) .map(renderWithdrawRequestCard)
            : "Not yet data pending."
          : otherRequests.length > 0
          ? otherRequests.sort((a, b) => new Date(b.dataTime) - new Date(a.dataTime)).map(renderWithdrawRequestCard)
          : "Not yet data processed."}
      </div>
    </div>
  );
}
