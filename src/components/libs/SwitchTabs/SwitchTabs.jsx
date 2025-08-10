import React, { useState, useEffect } from 'react';
import './SwitchTabs.css';

export default function SwitchTabs({ tabs, onTabChange }) {
  const [activeIndex, setActiveIndex] = useState(0);


  useEffect(() => {
    if (tabs.length > 0 && tabs[activeIndex]) {
      onTabChange?.(tabs[activeIndex].label);
    }
  }, [activeIndex, tabs, onTabChange]);

  if (!tabs || tabs.length === 0) {
    return <div>No tabs available</div>;
  }


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
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}
