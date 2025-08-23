import React, { useEffect, useState } from "react";
import "./AdRevenueReport.css";
import { getAllTransaction, getAllTransactionFee, GetAuctionSettlementById, GetOrderHistoryDetail } from "../../../services/api.admin";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { Avatar, Button, Descriptions, Modal } from "antd";

export default function AdReportManagement() {
  const [tab, setTab] = useState("transaction"); // transaction | fee
  const [transactions, setTransactions] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch transaction
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllTransaction();
      console.log("Transaction:", res.data);

      // Làm phẳng dữ liệu user -> transaction
      const allTx = res.data.flatMap((user) =>
        (user.transactions || []).map((tx) => ({
          ...tx,
          username: user.username,
          userId: user.userId,
          walletId: user.walletId,
        }))
      );

      setTransactions(allTx || []);
    } catch (err) {
      setError("Unable to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // fetch fee
  const fetchFees = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllTransactionFee();
      console.log("Fee:", res.data);

      setFees(res.data || []);
    } catch (err) {
      setError("Unable to load transaction fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "transaction") {
      fetchTransactions();
    } else {
      fetchFees();
    }
  }, [tab]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleShowDetail = async (fee) => {

    setSelectedFee(fee);
    setLoadingDetail(true);
    setDetailData(null);

    try {
      let res;
      console.log(fee.referenceType)
      if (fee.referenceType === "Order") {
        res = await GetOrderHistoryDetail(fee.referenceId);
      } else if (fee.referenceType === "Auction") {
        res = await GetAuctionSettlementById(fee.referenceId);
      }
      setDetailData(res.data);
    } catch (err) {
      console.error("Fetch detail failed:", err);
      setDetailData({ error: "Unable to load detail" });
    } finally {
      setLoadingDetail(false);
    }
  };
  const handleCloseModal = () => {
    setSelectedFee(null);
    setDetailData(null);
  };

  const renderAuction = (data) => (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item label="Product">
        {data.productName}
        <div style={{ fontSize: 12, color: "#aaa" }}>{data.productDescription}</div>
      </Descriptions.Item>
      <Descriptions.Item label="Rarity">{data.rarityName}</Descriptions.Item>
      <Descriptions.Item label="Quantity">{data.quantity}</Descriptions.Item>
      <Descriptions.Item label="Bidder">
        <Avatar
          src={buildImageUrl(data.bidderProfileImage, data.bidderProfileImage)}
          size="small" style={{ marginRight: 8 }} />
        {data.bidderUsername}
      </Descriptions.Item>
      <Descriptions.Item label="Bid Amount">{data.bidderAmount.toLocaleString()}</Descriptions.Item>
      <Descriptions.Item label="Host Claim">{data.hostClaimAmount.toLocaleString()}</Descriptions.Item>
      <Descriptions.Item label="Status">{data.isSolved ? "Solved" : "Pending"}</Descriptions.Item>
    </Descriptions>
  );

  const renderOrder = (data) => {
    console.log("renderOrder data:", data); // <-- kiểm tra data có gì

    return (
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Type">{data.type}</Descriptions.Item>
        <Descriptions.Item label="Product">{data.productName}</Descriptions.Item>
        <Descriptions.Item label="Seller">
          <Avatar
            src={buildImageUrl(data.sellerUrlImage, data.sellerUrlImage)}

            size="small" style={{ marginRight: 8 }} />
          {data.sellerUsername}
        </Descriptions.Item>
        <Descriptions.Item label="Quantity">{data.quantity}</Descriptions.Item>
        <Descriptions.Item label="Total Amount">{data.totalAmount?.toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Transaction Fee">{(data.transactionFeeRate * 100).toFixed(2)}%</Descriptions.Item>
        <Descriptions.Item label="Transaction Code">{data.transactionCode}</Descriptions.Item>
        <Descriptions.Item label="Purchased At">{new Date(data.purchasedAt).toLocaleString()}</Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <div className="adt-container">
      <h2 className="adt-title">
        {tab === "transaction" ? "Transaction Management" : "Transaction Fee Management"}
      </h2>
      {/* Tab Buttons */}
      <div className="adt-tabButtons">
        <button
          onClick={() => setTab("transaction")}
          className={`adt-tabButton ${tab === "transaction" ? "active" : ""}`}
        >
          Transactions
        </button>
        <button
          onClick={() => setTab("fee")}
          className={`adt-tabButton ${tab === "fee" ? "active" : ""}`}
        >
          Fees
        </button>
      </div>



      {loading ? (
        <div className="adt-status">Loading...</div>
      ) : error ? (
        <div className="adt-status">{error}</div>
      ) : tab === "transaction" ? (
        // Transaction Table
        <table className="adt-table">
          <thead>
            <tr>
              <th>Transaction Code</th>
              <th>Username</th>
              <th>User ID</th>
              <th>Wallet ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.transactionCode}</td>
                <td>{tx.username}</td>
                <td>{tx.userId}</td>
                <td>{tx.walletId}</td>
                <td>{tx.type}</td>
                <td>{tx.amount?.toLocaleString()} VND</td>
                <td>
                  <span className={`adt-badge ${tx.status.toLowerCase()}`}>
                    {tx.status}
                  </span>
                </td>
                <td>{new Date(tx.dataTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Fee Table
        <>
          <table className="adt-table">
            <thead>
              <tr>
                <th>Fee ID</th>
                <th>User</th>
                <th>Product</th>
                <th>Gross Amount</th>
                <th>Fee Rate</th>
                <th>Fee Amount</th>
                <th>Reference</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td>{fee.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={buildImageUrl(fee.profileImage, fee.profileImage)}
                        alt={fee.username}
                        style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                      />
                      <div>
                        <div>{fee.username}</div>
                        <div style={{ fontSize: "12px", color: "#888" }}>{fee.fromUserId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={buildImageUrl(fee.urlImage, fee.urlImage)}
                        alt={fee.productName}
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                      <span>{fee.productName}</span>
                    </div>
                  </td>
                  <td>{fee.grossAmount?.toLocaleString()} VND</td>
                  <td>{(fee.feeRate * 100).toFixed(2)}%</td>
                  <td>{fee.feeAmount?.toLocaleString()} VND</td>
                  <td>{fee.referenceType} ({fee.referenceId})</td>
                  <td>{fee.type}</td>
                  <td>
                    <span style={{
                      color: fee.is_Block ? "red" : "green",
                      fontWeight: "bold"
                    }}>
                      {fee.is_Block ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>{new Date(fee.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleShowDetail(fee)}>Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Modal
            title="Reference Detail"
            open={!!selectedFee}
            onCancel={handleCloseModal}
            footer={[
              <Button key="close" onClick={handleCloseModal}>
                Close
              </Button>,
            ]}
            centered
            bodyStyle={{ maxHeight: 400, overflow: "auto", fontFamily: "monospace" }}
            className="dark-modal"
          >
            {loadingDetail ? (
              <p>Loading...</p>
            ) : !detailData ? (
              <p>No detail data</p>
            ) : selectedFee.referenceType === "Order" ? (
              renderOrder(detailData)
            ) : (
              renderAuction(detailData)
            )}
          </Modal>
        </>
      )}

    </div>
  );
}
