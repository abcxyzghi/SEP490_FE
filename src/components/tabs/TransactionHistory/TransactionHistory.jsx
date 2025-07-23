import React, { useEffect, useState } from 'react';
import { getTransaction } from '../../../services/api.order';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    async function fetchTransactions() {
      const data = await getTransaction();
      if (Array.isArray(data)) setTransactions(data);
    }
    fetchTransactions();
  }, []);

  return (
    <div>
      <h2>Transaction History</h2>
      {transactions.length === 0 ? (
        <div>No transactions found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Type</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Status</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Amount</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Transaction Code</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={tx.id || idx}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{tx.type}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{tx.status}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{tx.amount}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{tx.transactionCode}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{new Date(tx.dataTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
