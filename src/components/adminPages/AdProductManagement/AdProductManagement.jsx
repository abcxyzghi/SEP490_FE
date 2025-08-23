import React, { useEffect, useState } from "react";
import "./AdProductManagement.css";
import { getAllProducts } from "../../../services/api.product";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { getCatergory } from "../../../services/api.category";

export default function AdProductManagement() {
  const [activeTab, setActiveTab] = useState("products"); // "products" | "categories"
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProducts();
      setProducts(res.data || []);
    } catch {
      setError("Lỗi khi lấy danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Fetch category
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCatergory();
      setCategories(res.data || []);
    } catch {
      setError("Lỗi khi lấy danh sách bộ sưu tập");
    } finally {
      setLoading(false);
    }
  };

  // Khi đổi tab thì gọi API tương ứng
  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    } else {
      fetchCategories();
    }
  }, [activeTab]);

  const renderStatus = (isBlock) => (
    <span className={`adproduct-badge ${isBlock ? "no" : "ok"}`}>
      {isBlock ? "Bị khóa" : "Hoạt động"}
    </span>
  );

  return (
    <div className="adproduct-container">
      <h2 className="adproduct-title">Products & Collections</h2>

      {/* Tabs */}
      <div className="adproduct-tabs">
        <button
          className={`adproduct-tabButton ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={`adproduct-tabButton ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Collections
        </button>
      </div>


      {/* Nội dung */}
      {loading ? (
        <div className="adproduct-status">Đang tải...</div>
      ) : error ? (
        <div className="adproduct-status">{error}</div>
      ) : activeTab === "products" ? (
        <table className="adproduct-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Product ID</th>
              <th>Collection</th>
              <th>Rarity</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.productId}>
                <td>
                  {product.urlImage ? (
                    <img
                      src={buildImageUrl(product.urlImage, product.urlImage)}
                      alt={product.name}
                      className="adproduct-thumb"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.productId}</td>
                <td>{product.collectionId}</td>
                <td>{product.rarityName}</td>
                <td className="adproduct-description">
                  {product.description}
                </td>
                <td>{renderStatus(product.is_Block)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="adproduct-table">
          <thead>
            <tr>
              <th>Collection id</th>
              <th>Topic</th>
              <th>System</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cate) => (
              <tr key={cate.id}>
                <td>{cate.id}</td>
                <td>{cate.topic}</td>
                <td>{cate.isSystem ? "✔" : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
