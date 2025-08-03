import React, { useEffect, useState } from 'react';
import "./TransactionHistory.css";
import { getTransaction } from '../../../services/api.order';
import Arrow_Right from "../../../assets/Icon_line/Arrow_Right_LG.svg";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getTransaction();
        if (Array.isArray(data)) setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const formatFullWithDots = (num) => {
    return Number(num).toLocaleString('de-DE'); // Ex: 9.000.000
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="transaction-history-container">
        <div className="transaction-card-list">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="transaction-card skeleton">
              {/* Left skeleton */}
              <div className="transaction-card-left w-full">
                <div className="skeleton h-5 w-24 mb-2 bg-gray-700/40"></div>
                <div className="skeleton h-3 w-40 mb-1 bg-gray-700/40"></div>
                <div className="skeleton h-3 w-28 bg-gray-700/40"></div>
              </div>
              {/* Right skeleton */}
              <div className="transaction-card-right items-end">
                <div className="skeleton h-4 w-24 mb-2 bg-gray-700/40"></div>
                <div className="skeleton h-5 w-20 bg-gray-700/40"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history-container">
      {transactions.filter(tx => ["Pending", "Success", "Cancel"].includes(tx.status)).length === 0 ? (
        <div className="transaction-empty oleo-script-regular">
          <p>No transactions yet.</p>
        </div>
      ) : (
        <div className="transaction-card-list">
          {transactions
            .filter(tx => ["Pending", "Success", "Cancel"].includes(tx.status))
            .sort((a, b) => new Date(b.dataTime) - new Date(a.dataTime)) // sort latest date first
            .map((tx, idx) => {
              const isMoneyIn = tx.type === "Recharge";
              const amountClass = isMoneyIn ? "transaction-amount-in" : "transaction-amount-out";

              // Arrow color wrapper condition
              let typeClassIcon = "";
              if (tx.type === "Recharge") {
                typeClassIcon = "transaction-arrow-wrapper-in";
              } else if (tx.type === "Withdraw") {
                typeClassIcon = "transaction-arrow-wrapper-out";
              }

              // Status color wrapper condition
              let statusClass = "";
              switch (tx.status) {
                case "Pending":
                  statusClass = "status-badge-pending";
                  break;
                case "Success":
                  statusClass = "status-badge-success";
                  break;
                case "Cancel":
                  statusClass = "status-badge-cancel";
                  break;
                default:
                  break;
              }

              return (
                <div key={tx.id || idx} className="transaction-card">
                  {/* Left Side */}
                  <div className="transaction-card-left">
                    <p className="transaction-type oleo-script-bold">{tx.type}</p>
                    <p className="transaction-code oxanium-regular">Transaction code: {tx.transactionCode}</p>
                    <p className="transaction-date oxanium-regular">{new Date(tx.dataTime).toLocaleString()}</p>
                  </div>

                  {/* Right Side */}
                  <div className="transaction-card-right">
                    <div className="transaction-amount-wrapper">
                      <span className={`transaction-amount ${amountClass} oxanium-semibold`}>
                        {isMoneyIn ? "+" : "-"}{`${formatFullWithDots(tx.amount)} VND`}
                      </span>
                      <div className={`transaction-history-arrow-wrapper ${typeClassIcon}`}>
                        <img
                          src={Arrow_Right}
                          alt="Arrow"
                          className={`transaction-history-arrow ${isMoneyIn ? "-rotate-45" : "rotate-45"}`}
                        />
                      </div>
                    </div>
                    <span className={`status-badge ${statusClass} oxanium-regular`}>{tx.status}</span>
                  </div>
                </div>
              );
            })}
        </div>

      )}
    </div>

  );
}
