import React, { useState, useEffect } from 'react';
import './SwitchTabs.css';

export default function SwitchTabs({ tabs, onTabChange }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    onTabChange(tabs[activeIndex].label); // Call this on mount and tab change
  }, [activeIndex]);

  return (
    <div className="switchTabs-wrapper">
      <div className="switchTabs-tabbar">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`switchTabs-tab ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            <span className="oleo-script-bold">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="switchTabs-content-container">
        {tabs[activeIndex].content}
      </div>
    </div>
  );
}
