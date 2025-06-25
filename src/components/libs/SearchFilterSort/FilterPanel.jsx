import React, { useState, useEffect } from 'react';
import './FilterPanel.css';
import FilterIcon from '../../../assets/Icon_fill/Filter_fill.svg';

export default function FilterPanel({ onPriceChange, onRaritySelect, showRarity = false }) {
    const [show, setShow] = useState(false);
    const [price, setPrice] = useState(500);
    const [activeRarities, setActiveRarities] = useState([]);
    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

    const handlePriceChange = (e) => {
        const value = e.target.value;
        setPrice(value);
        onPriceChange(value);
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
                        <div className="price-display oxanium-regular">{price < 500 ? `under ${price}.000 VND` : 'Any price'}</div>
                        <input
                            type="range"
                            min="0"
                            max="500"
                            value={price}
                            onChange={handlePriceChange}
                            className="price-range"
                        />
                    </div>

                    {/* Only appear in "Collection Store" */}
                    {showRarity && (
                        <div className="filter-section">
                            <label className="filter-label oxanium-semibold">Rarity</label>
                            <div className="rarity-options">
                                {rarities.map((rarity) => (
                                    <div
                                        key={rarity}
                                        className={`rarity-card ${rarity} ${activeRarities.includes(rarity) ? 'active' : ''}`}
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
