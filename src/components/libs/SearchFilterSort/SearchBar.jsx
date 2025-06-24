import React from 'react';
import './SearchBar.css';
import SearchIcon from '../../../assets/Icon_line/Search_alt.svg';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar-container">
      <button className="search-bar-button oxanium-regular">
        <img src={SearchIcon} alt="Search Icon" className='search-bar-icon' />
        <span>Search</span>
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-bar-input"
      />
    </div>
  );
}
