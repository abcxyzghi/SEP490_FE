import React, { useState } from "react";
import "./Paymentpage.css";
import TopUp from "../../tabs/TopUp/TopUp";
import Withdraw from "../../tabs/Withdraw/Withdraw";

export default function Paymentpage() {
  const [activeTab, setActiveTab] = useState("topup");

  return (
    <div className="paymentpage-container">
      {/* Tab Switcher */}
      <div className="paymentpage-tabs oxanium-regular">
        <button
          className={`paymentpage-tab ${activeTab === "topup" ? "active" : ""} topupTab`}
          onClick={() => setActiveTab("topup")}
        >
          Top Up
        </button>
        <button
          className={`paymentpage-tab ${activeTab === "withdraw" ? "active" : ""} withdrawTab`}
          onClick={() => setActiveTab("withdraw")}
        >
          Withdraw
        </button>
      </div>

      {/* Tab Content */}
      <div className="paymentpage-content">
        {activeTab === "topup" && <TopUp />}
        {activeTab === "withdraw" && <Withdraw />}
      </div>
    </div>
  );
}
