import React, { useState, useEffect } from 'react';
import './FilterPanel.css';
import * as Slider from '@radix-ui/react-slider';
import FilterIcon from '../../../assets/Icon_fill/Filter_fill.svg';

export default function FilterPanel({ onPriceChange, onRaritySelect, showRarity = false }) {
  const [show, setShow] = useState(false);
  const [price, setPrice] = useState(500);
  const [activeRarities, setActiveRarities] = useState([]);
  const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  const handlePriceChange = (value) => {
    const val = value[0];
    setPrice(val);
    onPriceChange(val);
  };

  const handleRarityClick = (rarity) => {
    const isSelected = activeRarities.includes(rarity);
    const updated = isSelected
      ? activeRarities.filter((r) => r !== rarity) // Remove
      : [...activeRarities, rarity];              // Add

    setActiveRarities(updated);
    onRaritySelect(updated); // Pass full selected list
  };

  // Debug check rarity section shown True or False
  // console.log("showRarity prop:", showRarity);

  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-panel-container')) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  return (
    <div className="relative filter-panel-container">
      <button
        className="filter-panel-button oxanium-regular"
        onClick={() => setShow(!show)}
      >
        <img src={FilterIcon} alt="Filter Icon" className="filter-panel-icon" />
        Filter by:
      </button>

      {show && (
        <div className="filter-panel">
          <h2 className="filter-title oxanium-bold">Filters</h2>

          <div className="filter-section">
            <label className="filter-label oxanium-semibold">Price Range</label>
            <div className="filter-price-display oxanium-regular">
              {price === "0" || price === 0
                ? "Free"
                : price < 500
                  ? `Under ${price}.000 VND`
                  : "Any price"}
            </div>
            {/* ✅ Radix UI Slider */}
            <Slider.Root
              className="filter-slider-root"
              defaultValue={[500]}
              value={[price]}
              onValueChange={handlePriceChange}
              max={500}
              min={0}
              step={1}
            >
              <Slider.Track className="filter-slider-track">
                <Slider.Range className="filter-slider-range" />
              </Slider.Track>
              <Slider.Thumb className="filter-slider-thumb" />
            </Slider.Root>
            {/* <input
              type="range"
              min="0"
              max="500"
              value={price}
              onChange={handlePriceChange}
              className="filter-price-range"
            /> */}
          </div>

          {/* Only appear in "Collection Store" */}
          {showRarity && (
            <div className="filter-section">
              <label className="filter-label oxanium-semibold">Rarity</label>
              <div className="filter-rarity-options">
                {rarities.map((rarity) => (
                  <div
                    key={rarity}
                    className={`filter-rarity-card ${rarity} ${activeRarities.includes(rarity) ? 'active' : ''} oxanium-regular`}
                    onClick={() => handleRarityClick(rarity)}
                  >
                    {rarity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
