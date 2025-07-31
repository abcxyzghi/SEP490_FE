import React, { useState } from "react";
import "./HelpCenter.css";
import SearchBar from "../../libs/SearchFilterSort/SearchBar";
import Guidebook from "../../libs/Guidebook/Guidebook";
import helpCenterData from "./helpCenterData";

export default function HelpCenter() {
  const [searchText, setSearchText] = useState("");
  const [activeGuidebookId, setActiveGuidebookId] = useState(null);

  // Filter cards by search text
  const filteredData = helpCenterData.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchText.toLowerCase())
  );

  const activeGuidebook = helpCenterData.find(item => item.id === activeGuidebookId);

  return (
    <div className="helpCenter-container">
      {/* Header welcome */}
      <div className="helpCenter-header">
        <h1 className="helpCenter-title oleo-script-bold">
          MMB Help Center <br/> 
        How can we assist you?</h1>
      </div>

      {/* Search bar */}
      <div className="helpCenter-search-wrapper">
        <SearchBar value={searchText} onChange={setSearchText} />
      </div>

      {/* Help card list */}
      <div className="helpCenter-card-list">
        {filteredData.map(item => (
          <div
            key={item.id}
            className="helpCenter-card"
            onClick={() => setActiveGuidebookId(item.id)}
          >
            <img src={item.icon} alt="logo" className="helpCenter-card-icon" />
            <div className="helpCenter-card-info">
              <h3 className="helpCenter-card-title oleo-script-bold">{item.title}</h3>
              <p className="helpCenter-card-subtitle oxanium-regular">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Render Guidebook if active */}
      {activeGuidebook && (
        <Guidebook
          isOpen={true}
          onClose={() => setActiveGuidebookId(null)}
          steps={activeGuidebook.steps}
        />
      )}
    </div>
  );
}
