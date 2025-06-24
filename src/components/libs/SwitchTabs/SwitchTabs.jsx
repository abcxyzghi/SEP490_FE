import React, { useState } from 'react';
import './SwitchTabs.css';

export default function SwitchTabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);

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
