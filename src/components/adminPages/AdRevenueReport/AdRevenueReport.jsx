import React, { useEffect, useState, useMemo } from "react";
import "./AdRevenueReport.css";
import { getAllTransaction, getAllTransactionFee, GetAuctionSettlementById, GetOrderHistoryDetail } from "../../../services/api.admin";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { Avatar, Button, Descriptions, Modal } from "antd";
import ProfileIcon from '../../../assets/others/mmbAvatar.png';

// --- Component tái sử dụng: Pagination ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="adproduct-pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        &laquo; Previous
      </button>
      {pages.map((page) => (
        <button key={page} onClick={() => onPageChange(page)} className={currentPage === page ? "active" : ""}>
          {page}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next &raquo;
      </button>
    </div>
  );
};

// --- Helper component để hiển thị tag màu ---
const InfoTag = ({ text }) => {
  const type = text?.toLowerCase() || '';
  let className = 'tag-default';
  if (type.includes('deposit') || type.includes('topup') || type.includes('recharge')) className = 'tag-deposit';
  else if (type.includes('payment') || type.includes('purchase') || type.includes('withdraw')) className = 'tag-payment';
  else if (type.includes('order')) className = 'tag-order';
  else if (type.includes('auction')) className = 'tag-auction';
  else if (type.includes('sell')) className = 'tag-sell';
  return <span className={`info-tag ${className}`}>{text}</span>;
};

// Sửa tên component cho nhất quán
export default function AdRevenueReport() {
  const [tab, setTab] = useState("transaction");
  const [transactions, setTransactions] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchTransactions = async () => {
    try {
      const res = await getAllTransaction();
      const allTx = (res.data || [])
        .flatMap((user) => (user.transactions || []).map((tx) => ({ ...tx, username: user.username })))
        .sort((a, b) => new Date(b.dataTime) - new Date(a.dataTime));
      setTransactions(allTx);
    } catch (err) {
      setError("Unable to load transactions");
    }
  };

  const fetchFees = async () => {
    try {
      const res = await getAllTransactionFee();
      const sortedFees = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFees(sortedFees);
    } catch (err) {
      setError("Unable to load transaction fees");
    }
  };

  const revenueSummary = useMemo(() => {
    const successfulTransactions = transactions.filter(tx => {
      const statusLower = tx.status?.toLowerCase() || '';
      return statusLower === 'success' || statusLower === 'completed';
    });
    const totalRecharge = successfulTransactions.reduce((acc, tx) => {
      const typeLower = tx.type?.toLowerCase() || '';
      const isRecharge = typeLower.includes('recharge') || typeLower.includes('deposit') || typeLower.includes('topup');
      return isRecharge ? acc + tx.amount : acc;
    }, 0);
    const totalWithdraw = successfulTransactions.reduce((acc, tx) => {
      const typeLower = tx.type?.toLowerCase() || '';
      return typeLower.includes('withdraw') ? acc + tx.amount : acc;
    }, 0);
    const totalFees = fees.reduce((acc, fee) => acc + fee.feeAmount, 0);
    const netTransactions = totalRecharge - totalWithdraw;
    const grandTotal = netTransactions + totalFees;
    return { netTransactions, totalFees, grandTotal };
  }, [transactions, fees]);

  // Gộp 2 useEffect bị trùng lặp thành 1
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (tab === "transaction") {
        if (transactions.length === 0) await fetchTransactions();
      } else {
        if (fees.length === 0) await fetchFees();
      }
      setLoading(false);
    };
    loadData();

    // Reset state khi chuyển tab
    setSearchTerm('');
    setCurrentPage(1);
    setFeeTypeFilter('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);


  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    const lowercasedSearch = searchTerm.toLowerCase();
    return transactions.filter(tx =>
      tx.transactionCode?.toLowerCase().includes(lowercasedSearch) ||
      tx.username?.toLowerCase().includes(lowercasedSearch) ||
      tx.type?.toLowerCase().includes(lowercasedSearch) ||
      String(tx.amount).includes(lowercasedSearch)
    );
  }, [searchTerm, transactions]);

  const filteredFees = useMemo(() => {
    let tempFees = [...fees];
    if (feeTypeFilter !== 'all') {
      tempFees = tempFees.filter(fee => fee.referenceType === feeTypeFilter);
    }
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      tempFees = tempFees.filter(fee =>
        fee.username?.toLowerCase().includes(lowercasedSearch) ||
        fee.productName?.toLowerCase().includes(lowercasedSearch) ||
        fee.referenceType?.toLowerCase().includes(lowercasedSearch) ||
        fee.type?.toLowerCase().includes(lowercasedSearch)
      );
    }
    return tempFees;
  }, [searchTerm, fees, feeTypeFilter]);

  const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalTransactionPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentFees = filteredFees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalFeePages = Math.ceil(filteredFees.length / itemsPerPage);

  const [selectedFee, setSelectedFee] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const handleShowDetail = async (fee) => {
    setSelectedFee(fee);
    setLoadingDetail(true);
    setDetailData(null);
    try {
      let res;
      if (fee.referenceType === "Order") res = await GetOrderHistoryDetail(fee.referenceId);
      else if (fee.referenceType === "Auction") res = await GetAuctionSettlementById(fee.referenceId);
      setDetailData(res.data);
    } catch (err) {
      setDetailData({ error: "Unable to load detail" });
    } finally {
      setLoadingDetail(false);
    }
  };
  const handleCloseModal = () => {
    setSelectedFee(null);
    setDetailData(null);
  };

  const renderAmount = (amount, type) => {
    const typeLower = type?.toLowerCase() || '';
    const isDeposit = typeLower.includes('deposit') || typeLower.includes('topup') || typeLower.includes('recharge');
    const color = isDeposit ? '#2ecc71' : '#e74c3c';
    const prefix = isDeposit ? '+' : '-';
    return <span style={{ color, fontWeight: 'bold' }}>{prefix} {amount?.toLocaleString()} VND</span>;
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed' || statusLower === 'success') return 'ok';
    if (statusLower === 'cancelled' || statusLower === 'failed' || statusLower === 'cancel') return 'no';
    if (statusLower === 'pending') return 'pending';
    return '';
  };

  const renderAuction = (data) => (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item label="Product">{data.productName}<div style={{ fontSize: 12, color: "#aaa" }}>{data.productDescription}</div></Descriptions.Item>
      <Descriptions.Item label="Rarity">{data.rarityName}</Descriptions.Item>
      <Descriptions.Item label="Quantity">{data.quantity}</Descriptions.Item>
      <Descriptions.Item label="Bidder"><Avatar src={data.bidderProfileImage ? buildImageUrl(data.bidderProfileImage, data.bidderProfileImage) : ProfileIcon} size="small" style={{ marginRight: 8 }} />{data.bidderUsername}</Descriptions.Item>
      <Descriptions.Item label="Bid Amount">{data.bidderAmount?.toLocaleString()}</Descriptions.Item>
      <Descriptions.Item label="Host Claim">{data.hostClaimAmount?.toLocaleString()}</Descriptions.Item>
      <Descriptions.Item label="Status">{data.isSolved ? "Solved" : "Pending"}</Descriptions.Item>
    </Descriptions>
  );

  const renderOrder = (data) => (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item label="Type">{data.type}</Descriptions.Item>
      <Descriptions.Item label="Product">{data.productName}</Descriptions.Item>
      <Descriptions.Item label="Seller"><Avatar src={data.sellerUrlImage ? buildImageUrl(data.sellerUrlImage, data.sellerUrlImage) : ProfileIcon} size="small" style={{ marginRight: 8 }} />{data.sellerUsername}</Descriptions.Item>
      <Descriptions.Item label="Quantity">{data.quantity}</Descriptions.Item>
      <Descriptions.Item label="Total Amount">{data.totalAmount?.toLocaleString()}</Descriptions.Item>
      <Descriptions.Item label="Transaction Fee">{(data.transactionFeeRate * 100).toFixed(2)}%</Descriptions.Item>
      <Descriptions.Item label="Transaction Code">{data.transactionCode}</Descriptions.Item>
      <Descriptions.Item label="Purchased At">{new Date(data.purchasedAt).toLocaleString()}</Descriptions.Item>
    </Descriptions>
  );

  return (
    <div className="adproduct-container">
      <h2 className="adproduct-title">{tab === "transaction" ? "Transaction Management" : "Transaction Fee Management"}</h2>

      <div className="revenue-summary-container">
        <div className="revenue-summary-card">
          <h3>Net Transactions</h3>
          <p style={{ color: revenueSummary.netTransactions >= 0 ? '#2ecc71' : '#e74c3c' }}>{revenueSummary.netTransactions.toLocaleString()} VND</p>
        </div>
        <div className="revenue-summary-card">
          <h3>Total Fees</h3>
          <p style={{ color: '#3498db' }}>{revenueSummary.totalFees.toLocaleString()} VND</p>
        </div>
        <div className="revenue-summary-card total">
          <h3>Overall Total</h3>
          <p>{revenueSummary.grandTotal.toLocaleString()} VND</p>
        </div>
      </div>

      <div className="adproduct-tabs">
        <button onClick={() => setTab("transaction")} className={`adproduct-tabButton ${tab === "transaction" ? "active" : ""}`}>Transactions</button>
        <button onClick={() => setTab("fee")} className={`adproduct-tabButton ${tab === "fee" ? "active" : ""}`}>Fees</button>
      </div>

      <div className="adproduct-filters">
        <input type="text" placeholder={tab === 'transaction' ? 'Search code, username, type...' : 'Search username, product...'} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        {tab === 'fee' && (<select value={feeTypeFilter} onChange={(e) => { setFeeTypeFilter(e.target.value); setCurrentPage(1); }}><option value="all">All Types</option><option value="Order">Order</option><option value="Auction">Auction</option></select>)}
        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
          <option value={10}>10 per page</option><option value={20}>20 per page</option><option value={50}>50 per page</option>
        </select>
      </div>

      {loading ? <div className="adproduct-status">Loading...</div> :
        error ? <div className="adproduct-status">{error}</div> :
          tab === "transaction" ? (
            <>
              <table className="adproduct-table">
                <thead><tr><th>Transaction Code</th><th>Username</th><th>Type</th><th>Amount</th><th>Status</th><th>Date Time</th></tr></thead>
                <tbody>
                  {currentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.transactionCode}</td>
                      <td>{tx.username}</td>
                      <td><InfoTag text={tx.type} /></td>
                      <td>{renderAmount(tx.amount, tx.type)}</td>
                      <td><span className={`adproduct-badge ${getStatusClass(tx.status)}`}>{tx.status}</span></td>
                      <td>{new Date(tx.dataTime).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination currentPage={currentPage} totalPages={totalTransactionPages} onPageChange={setCurrentPage} />
            </>
          ) : (
            <>
              <table className="adproduct-table">
                <thead><tr><th>User</th><th>Product</th><th>Gross Amount</th><th>Fee Amount</th><th>Reference</th><th>Type</th><th>Status</th><th>Date Time</th><th>Actions</th></tr></thead>
                <tbody>
                  {currentFees.map((fee) => (
                    <tr key={fee.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src={fee.profileImage ? buildImageUrl(fee.profileImage, fee.profileImage) : ProfileIcon} alt={fee.username} style={{ width: "32px", height: "32px", borderRadius: "50%" }} /><div>{fee.username}</div></div></td>
                      <td><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><img src={buildImageUrl(fee.urlImage, fee.urlImage)} alt={fee.productName} style={{ width: "40px", height: "40px", objectFit: "cover" }} /><span>{fee.productName}</span></div></td>
                      <td>{fee.grossAmount?.toLocaleString()} VND</td>
                      <td style={{ fontWeight: "bold" }}>{fee.feeAmount?.toLocaleString()} VND</td>
                      <td><InfoTag text={fee.referenceType} /></td>
                      <td><InfoTag text={fee.type} /></td>
                      <td><span className={`adproduct-badge ${!fee.is_Block ? 'ok' : 'no'}`}>{fee.is_Block ? "Blocked" : "Active"}</span></td>
                      <td>{new Date(fee.createdAt).toLocaleString('vi-VN')}</td>
                      <td><button className="detail-button" onClick={() => handleShowDetail(fee)}>Detail</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination currentPage={currentPage} totalPages={totalFeePages} onPageChange={setCurrentPage} />
              <Modal title="Reference Detail" open={!!selectedFee} onCancel={handleCloseModal} footer={[<Button key="close" onClick={handleCloseModal}>Close</Button>]} centered className="dark-modal">
                {loadingDetail ? <p>Loading...</p> : !detailData ? <p>No detail data</p> : selectedFee.referenceType === "Order" ? renderOrder(detailData) : renderAuction(detailData)}
              </Modal>
            </>
          )}
    </div>
  );
}