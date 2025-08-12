import React, { useState } from "react";
import "./Paymentpage.css";
import { createPayment } from "../../../services/api.payOS";
import MessageModal from "../../libs/MessageModal/MessageModal";

const PACKS = [
  { id: "quick", name: "Quick Charge", price: 25000, dailyLimit: 10 },
  { id: "power", name: "Power Pack", price: 59000, dailyLimit: 10 },
  { id: "elite", name: "Elite Scroll", price: 79000, dailyLimit: 9 },
  { id: "mythic", name: "Mythic Cache", price: 129000, dailyLimit: 8 },
  { id: "shogun", name: "Shogun’s Trove", price: 379000, dailyLimit: 7 },
  { id: "artisan", name: "Artisan Ink", price: 779000, dailyLimit: 6 },
  { id: "dragon", name: "Dragon’s Hoard", price: 1299000, dailyLimit: 5 },
];

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN").format(n) + " VND";

export default function Paymentpage() {
  const [selectedPackId, setSelectedPackId] = useState(PACKS[0].id);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    type: "default",
    title: "",
    message: "",
  });

  const showModal = (type, title, message) =>
    setModal({ open: true, type, title, message });

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const selectedPack = PACKS.find((p) => p.id === selectedPackId);

  const handleSelectPack = (id) => setSelectedPackId(id);

  const handleTopUp = async () => {
    if (!selectedPack) {
      return showModal("warning", "No pack selected", "Please select a pack to continue.");
    }

    setLoading(true);
    try {
      // API expects array of items — keep same contract
      const result = await createPayment([
        {
          name: `${selectedPack.name} - ${selectedPack.price / 1000}k`,
          price: selectedPack.price,
        },
      ]);

      // success -> redirect to checkout
      if (result?.status && result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
        // no need to setLoading(false) because we're leaving page
        return;
      }

      // Friendly error
      const serverMsg =
        (result && result.data && result.data.message) ||
        (result && result.message) ||
        "Unable to create payment. Please try again later.";
      showModal("error", "Payment Error", serverMsg);
    } catch (err) {
      console.error("Payment error:", err);
      const serverMsg =
        err?.response?.data?.error ||
        err?.message ||
        "An error occurred while creating the payment.";
      showModal("error", "Payment Error", serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paymentpage-container">
      <div className="paymentpage-card">
        <header className="paymentpage-header">
          <h1 className="paymentpage-title oleo-script-regular">Top-up Wallet</h1>
          <p className="paymentpage-subtitle oxanium-regular">
            Choose a pack to add funds to your wallet. Daily limits apply per pack.
          </p>
        </header>

        <section className="paymentpage-packs-grid oxanium-regular" aria-label="Top-up packs">
          {PACKS.map((p) => {
            const selected = p.id === selectedPackId;
            return (
              <button
                key={p.id}
                type="button"
                className={`paymentpage-pack-card ${selected ? "selected" : ""}`}
                onClick={() => handleSelectPack(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSelectPack(p.id);
                }}
                aria-pressed={selected}
              >
                <div className="paymentpage-pack-inner">
                  <div className="paymentpage-pack-header">
                    <div className="paymentpage-pack-name">{p.name}</div>
                    <div className="paymentpage-pack-limit">Daily limit: {p.dailyLimit}</div>
                  </div>

                  <div className="paymentpage-pack-price">{formatVND(p.price)}</div>

                  <div className="paymentpage-pack-meta">
                    <span className="paymentpage-pack-kv">
                      {Math.round(p.price / 1000)}k
                    </span>
                    <span className="paymentpage-pack-cta">
                      {selected ? "Selected" : "Choose"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        <footer className="paymentpage-footer oxanium-regular">
          <div className="paymentpage-summary">
            <div>
              <div className="paymentpage-summary-label">Selected Pack</div>
              <div className="paymentpage-summary-value">{selectedPack?.name}</div>
            </div>
            <div>
              <div className="paymentpage-summary-label">Amount</div>
              <div className="paymentpage-summary-value">{formatVND(selectedPack?.price || 0)}</div>
            </div>
          </div>

          <div className="paymentpage-actions">
            <button
              className="paymentpage-pay-button"
              onClick={handleTopUp}
              disabled={loading}
              aria-disabled={loading}
            >
              {loading ? <span className="loading loading-bars"></span> : "Proceed to Checkout"}
            </button>
          </div>
        </footer>
      </div>

      <MessageModal
        open={modal.open}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
