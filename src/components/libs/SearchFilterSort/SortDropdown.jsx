import React, { useState, useEffect } from 'react';
import './SortDropdown.css';
import SortDown from '../../../assets/Icon_fill/Sort_down.svg';
import SortUp from '../../../assets/Icon_fill/Sort_up.svg';

export default function SortDropdown({ selectedSort, onSortSelect, ascending, toggleOrder }) {
    const [isOpen, setIsOpen] = useState(false);
    const [tooltipText, setTooltipText] = useState(ascending ? 'ascending' : 'descending');
    const sortOptions = ['Date', 'Name', 'Price'];

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSortOrderClick = (e) => {
        e.stopPropagation();
        const newOrder = !ascending;
        setTooltipText(newOrder ? 'ascending' : 'descending'); //  update label / tooltip show current sort state
        toggleOrder(); //  inform parent
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (!event.target.closest('.sort-dropdown-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="sort-dropdown-container" >
            <button className="sort-button oxanium-regular" onClick={toggleDropdown}>
                <span
                    className="tooltip tooltip-bottom tooltip-secondary sort-icon-wrap"
                    data-tip={tooltipText}
                    onClick={handleSortOrderClick}
                >
                    <img src={ascending ? SortUp : SortDown} alt="Sort Order" className="sort-icon" />
                </span>
                Sort by: <span className="sort-selected-option oxanium-regular">{selectedSort}</span>
            </button>

            {isOpen && (
                <ul className="sort-menu">
                    {sortOptions.map((option) => (
                        // <li key={option} onClick={() => { onSortSelect(option); setIsOpen(false); }}>{option}</li>
                        <li
                            key={option}
                            className={option === selectedSort ? 'active' : ''}
                            onClick={() => { onSortSelect(option); setIsOpen(false); }}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}