import React, { useEffect, useState } from 'react';

import './AdAuctionManagement.css';
import { getAllAuctions } from '../../../services/api.auction';

export default function AdAuctionManagement() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await getAllAuctions();
        setAuctions(res.data || []);
      } catch (err) {
        setError('Không thể tải danh sách đấu giá');
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  if (loading) return <p>Loading ...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="adau-container">
      <h2 className="adau-title">Auction Management</h2>
      <table className="adau-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Seller</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map((auction) => (
            <tr key={auction._id}>
              <td>{auction.title}</td>
              <td>{auction.descripition}</td>
              <td>{auction.seller_id}</td>
              <td>{new Date(auction.start_time).toLocaleString()}</td>
              <td>{new Date(auction.end_time).toLocaleString()}</td>
              <td>
                <span className={`adau-badge ${auction.status === 1 ? 'active' : 'ended'}`}>
                  {auction.status === 1 ? 'Đang hoạt động' : 'Kết thúc'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
