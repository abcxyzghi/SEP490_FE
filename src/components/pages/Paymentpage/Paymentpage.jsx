import React, { useState } from "react";
import "./Paymentpage.css";
import TopUp from "../../tabs/TopUp/TopUp";

export default function Paymentpage() {
  return (
    <div className="paymentpage-container">
      <TopUp />
    </div>
  );
}
