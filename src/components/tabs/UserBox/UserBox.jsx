import React, { useEffect, useState } from 'react';
import { getAllBoxOfProfile, openUserBox } from '../../../services/api.user';

export default function UserBox() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openResult, setOpenResult] = useState(null);
  const [openingBoxId, setOpeningBoxId] = useState(null);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        setLoading(true);
        const res = await getAllBoxOfProfile();
        if (res.status) {
          setBoxes(res.data);
        } else {
          setError('Failed to fetch boxes');
        }
      } catch (err) {
        setError('Error fetching boxes');
      } finally {
        setLoading(false);
      }
    };
    fetchBoxes();
  }, []);

  const handleOpenBox = async (boxId) => {
    setOpeningBoxId(boxId);
    setOpenResult(null);
    try {
      const res = await openUserBox(boxId);
      if (res.status) {
        setOpenResult(res.data);
        // Optionally, update box quantity in UI
        setBoxes(prev => prev.map(box => box.id === boxId ? { ...box, quantity: box.quantity - 1 } : box));
      } else {
        setOpenResult({ error: 'Failed to open box' });
      }
    } catch {
      setOpenResult({ error: 'Error opening box' });
    }
    setOpeningBoxId(null);
  };

  if (loading) return <div>Loading boxes...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>User Boxes</h2>
      {boxes.length === 0 ? (
        <div>No boxes found.</div>
      ) : (
        <ul>
          {boxes.map(box => (
            <li key={box.id}>
              <strong>{box.boxTitle}</strong> (Quantity: {box.quantity})
               <img
                  src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${box.urlImage}`}
                  alt={box.boxTitle}
                  className="w-full h-64 object-cover rounded mb-4"
                  style={{ maxWidth: 300, display: 'block', marginTop: 8 }}
                />
              <button
                style={{ marginLeft: 8 }}
                disabled={box.quantity === 0 || openingBoxId === box.id}
                onClick={() => handleOpenBox(box.id)}
              >
                {openingBoxId === box.id ? 'Opening...' : 'Open'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {openResult && (
        <div style={{ marginTop: 16 }}>
          {openResult.error ? (
            <span style={{ color: 'red' }}>{openResult.error}</span>
          ) : (
            <div>
              <h4>Box Opened!</h4>
              <div><strong>Product:</strong> {openResult.productName}</div>
              <div><strong>Rarity:</strong> {openResult.rarity}</div>
              
                <img
                  src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${openResult.urlImage}`}
                  alt={openResult.productName}
                  className="w-full h-64 object-cover rounded mb-4"
                  style={{ maxWidth: 300, display: 'block', marginTop: 8 }}
                />
              </div>
            
          )}
        </div>
      )}
    </div>
  );
}

