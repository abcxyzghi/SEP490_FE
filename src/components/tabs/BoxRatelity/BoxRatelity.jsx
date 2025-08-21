import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { buildImageUrl } from '../../../services/api.imageproxy';
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
  const [useBackupImg, setUseBackupImg] = useState(false);
  const navigate = useNavigate(); // INIT NAVIGATOR

  if (!mysteryBoxDetail || !mysteryBoxDetail.products) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="skeleton h-8 w-1/3"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-20 w-full rounded-lg"></div>
        ))}
      </div>
    );
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

  const handleNavigate = (productId) => {
    navigate(`/collectiondetailpage/${productId}`);
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
                  {(grouped[rarity][0]?.chance * 100).toFixed(0)}%
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
                      src={buildImageUrl(product.urlImage, useBackupImg)} 
                      onError={() => setUseBackupImg(true)}
                      alt={product.productName}
                      className="box-ratelity-product-image"
                    />
                    <div className="box-ratelity-card-overlay">
                      <div className="box-ratelity-card-content">
                        <div className="box-ratelity-product-name oxanium-semibold">{product.productName}</div>
                        <button
                          className="box-ratelity-view-btn oxanium-regular"
                          onClick={() => handleNavigate(product.productId)}
                        >
                          View detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        )
      ))}
    </div>
  );
}
