import React, { useState } from 'react';
import { getProductDetailRatelity } from '../../../services/api.product';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './BoxRatelity.css';

const rarityOrder = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];

const rarityColors = {
  Legendary: '#FFD700', // Gold
  Epic: '#A915C6', // MediumVioletRed
  Rare: '#4169E1', // RoyalBlue
  Uncommon: '#32CD32', // LimeGreen
  Common: '#A9A9A9', // DarkGray
};

export default function BoxRatelity({ mysteryBoxDetail }) {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState(null);

  if (!mysteryBoxDetail || !mysteryBoxDetail.products) {
    return <div>Loading...</div>;
  }

  const normalizeRarity = (rarity) =>
    rarity ? rarity.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase()) : '';

  const grouped = rarityOrder.reduce((acc, rarity) => {
    acc[rarity] = mysteryBoxDetail.products.filter(
      p => normalizeRarity(p.rarityName) === rarity
    );
    return acc;
  }, {});

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Handle view detail click
  const handleViewDetail = async (productId) => {
    setModalOpen(true);
    setModalLoading(true);
    setModalData(null);
    try {
      const res = await getProductDetailRatelity(productId);
      if (res && res.status) {
        setModalData(res.data);
      } else {
        setModalData({ error: res?.error || 'Failed to fetch product detail.' });
      }
    } catch (err) {
      setModalData({ error: 'Failed to fetch product detail.' });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="box-ratelity-container">
      <h2 className="box-ratelity-title oleo-script-bold">Box Rarity & Chances</h2>
      {rarityOrder.map((rarity) => (
        grouped[rarity].length > 0 && (
          <Accordion
            key={rarity}
            expanded={expanded === rarity}
            onChange={handleChange(rarity)}
            className="box-ratelity-accordion"
            sx={{
              position: 'relative',
              background: `linear-gradient(135deg, ${rarityColors[rarity]} 0%, ${rarityColors[rarity]} 45%, transparent 45.1%)`,
              borderRadius: '12px',
              border: '2px solid var(--light-2)'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              className="box-ratelity-summary"
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(87, 87, 87, 0.07)',
                  zIndex: 0,
                  borderRadius: 'inherit',
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="box-rarity-label oleo-script-regular">{rarity}</div>
                <div className="box-ratelity-chance-label oxanium-bold">
                  {grouped[rarity][0]?.chance.toFixed(2)}%
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: 'var(--dark-4)',
                color: 'var(--light-1)',
              }}>
              <div className="box-ratelity-product-list">
                {grouped[rarity].map((product) => (
                  <div key={product.productId} className="box-ratelity-product-card">
                    <img
                      src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${product.urlImage}`}
                      alt={product.productName}
                      className="box-ratelity-product-image"
                    />
                    <div className="box-ratelity-card-overlay">
                      <div className="box-ratelity-card-content">
                        <div className="box-ratelity-product-name oxanium-semibold">{product.productName}</div>
                        <button className="box-ratelity-view-btn oxanium-regular" onClick={() => handleViewDetail(product.productId)}>
                          View detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
      {/* Modal for product detail */}
      {modalOpen && (
        <div className="box-ratelity-modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModalOpen(false)}>
          <div className="box-ratelity-modal" style={{ background: '#232323', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }} onClick={() => setModalOpen(false)}>&times;</button>
            {modalLoading ? (
              <div style={{ textAlign: 'center', padding: 32 }}>Loading...</div>
            ) : modalData && !modalData.error ? (
              <>
                <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${modalData.urlImage}`} alt={modalData.name} style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} />
                <div className="oxanium-bold" style={{ fontSize: 20, marginBottom: 8 }}>{modalData.name}</div>
                <div className="oxanium-regular" style={{ marginBottom: 8 }}>Rarity: <span style={{ textTransform: 'capitalize' }}>{modalData.rarityName}</span></div>
                <div className="oxanium-regular" style={{ marginBottom: 8 }}>{modalData.description}</div>
              </>
            ) : (
              <div style={{ color: 'red', textAlign: 'center' }}>{modalData?.error || 'Error loading product detail.'}</div>
            )}
          </div>
        </div>
      )}
              </div>
            </AccordionDetails>
          </Accordion>
        )
      ))}
    </div>
  );
}
