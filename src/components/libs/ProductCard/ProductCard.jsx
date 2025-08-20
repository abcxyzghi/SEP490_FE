import React from "react";
import "./ProductCard.css";
import { buildImageUrl } from "../../../services/api.imageproxy";


export default function ProductCard({ product, onShowComments }) {
  const formatShortNumber = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };
  return (
    <div className="product-card">
      <img src={buildImageUrl(product.urlImage)} alt={product.productName} />
      <div className="product-info">
        <h4 className="productList-card-title oxanium-bold">{product.productName}</h4>
        <p className="productList-card-price oxanium-bold">{formatShortNumber(product.totalRevenue)}</p>
        <button
          className="productList-view-button"
          onClick={() => onShowComments(product.productName)}
        >
          <span className="productList-view-button-text oleo-script-bold">  💬 View Comment</span>
        </button>
      </div>
    </div>
  );
}
