import React, { useEffect, useState, useMemo } from "react";

import "./AdProductManagement.css";
import { getAllProducts } from "../../../services/api.product";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { getCatergory } from "../../../services/api.category";

const ExpandableDescription = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <span>{text}</span>;
  }

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <span>
      {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      <button onClick={toggleExpansion} className="description-toggle-btn">
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </span>
  );
};


// --- Component phụ cho việc phân trang ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="adproduct-pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo; Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={currentPage === page ? "active" : ""}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &raquo;
      </button>
    </div>
  );
};

export default function AdProductManagement() {

  const [activeTab, setActiveTab] = useState("products");

  // State gốc
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [useBackupImg, setUseBackupImg] = useState(false);
  // State cho việc tìm kiếm và lọc
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  // State phân trang
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      // Bắt đầu loading ngay khi tab thay đổi, không chờ check
      setLoading(true);
      setError(null);
      try {
        if (activeTab === "products") {
          // Chỉ fetch lại nếu state rỗng để tránh gọi API không cần thiết
          if (allProducts.length === 0) {
            const res = await getAllProducts();
            res.data.reverse();
            setAllProducts(res.data || []);
          }
        } else {
          if (allCategories.length === 0) {
            const res = await getCatergory();
            setAllCategories(res.data || []);
          }
        }
      } catch (err) {
        setError(`Error getting ${activeTab} list`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // --- Logic lọc và phân trang cho Products (Đã sửa lỗi) ---
  const filteredProducts = useMemo(() => {
    let tempProducts = [...allProducts];
    const lowercasedSearch = productSearchTerm.toLowerCase();

    // 1. Lọc theo Rarity
    if (selectedRarity !== "all") {
      tempProducts = tempProducts.filter(
        // SỬA LỖI: So sánh Rarity không phân biệt hoa/thường
        (product) => product.rarityName?.toLowerCase() === selectedRarity.toLowerCase()
      );
    }

    // 2. Lọc theo Search Term
    if (lowercasedSearch) {
      tempProducts = tempProducts.filter((product) =>
        (product.name?.toLowerCase().includes(lowercasedSearch)) ||
        (String(product.productId).toLowerCase().includes(lowercasedSearch)) ||
        (String(product.collectionId).toLowerCase().includes(lowercasedSearch)) ||
        (product.description?.toLowerCase().includes(lowercasedSearch))
      );
    }

    return tempProducts;
  }, [allProducts, productSearchTerm, selectedRarity]);

  const productTotalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (productCurrentPage - 1) * itemsPerPage,
    productCurrentPage * itemsPerPage
  );

  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm) return allCategories;

    const lowercasedSearch = categorySearchTerm.toLowerCase();

    return allCategories.filter((cate) =>
      // Điều kiện 1: Tìm kiếm trong 'topic'
      cate.topic.toLowerCase().includes(lowercasedSearch) ||
      // Điều kiện 2: Tìm kiếm trong 'id'
      String(cate.id).toLowerCase().includes(lowercasedSearch)
    );
  }, [allCategories, categorySearchTerm]);

  const categoryTotalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentCategories = filteredCategories.slice(
    (categoryCurrentPage - 1) * itemsPerPage,
    categoryCurrentPage * itemsPerPage
  );

  const handleProductSearch = (e) => {
    setProductSearchTerm(e.target.value);
    setProductCurrentPage(1);
  };

  const handleRarityChange = (e) => {
    setSelectedRarity(e.target.value);
    setProductCurrentPage(1);
  };

  const handleCategorySearch = (e) => {
    setCategorySearchTerm(e.target.value);
    setCategoryCurrentPage(1);
  };

  // --- Render Functions ---
  const renderStatus = (isBlock) => (
    <span className={`adproduct-badge ${isBlock ? "no" : "ok"}`}>
      {isBlock ? "Locked" : "Unlocked"}
    </span>
  );

  const getRarityClass = (rarity) => {
    const rarityLower = rarity?.toLowerCase() || '';
    const map = {
      uncommon: 'rarity-uncommon',
      common: 'rarity-common',
      rare: 'rarity-rare',
      epic: 'rarity-epic',
      legendary: 'rarity-legendary',
    };
    return map[rarityLower] || '';
  };

  return (
    <div className="adproduct-container">
      <h2 className="adproduct-title">Products & Collections</h2>

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

      <div className="adproduct-filters">
        <input
          type="text"
          placeholder={
            activeTab === "products"
              ? "Search name, id, collection..."
              : "Search by topic, id..."
          }
          value={
            activeTab === "products" ? productSearchTerm : categorySearchTerm
          }
          onChange={
            activeTab === "products" ? handleProductSearch : handleCategorySearch
          }
        />
        {activeTab === "products" && (
          <select value={selectedRarity} onChange={handleRarityChange}>
            <option value="all">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="adproduct-status">Loading...</div>
      ) : error ? (
        <div className="adproduct-status">{error}</div>
      ) : activeTab === "products" ? (
        <>
          <table className="adproduct-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Product ID</th>
                <th>Collection</th>
                <th>Rarity</th>
                <th>Quantity</th>
                <th>Current Quantity</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.productId}>
                  <td>
                    {product.urlImage ? (
                      <img
                        src={buildImageUrl(product.urlImage, useBackupImg)}
                        onError={() => setUseBackupImg(true)}
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
                  <td>
                    <span className={`adproduct-rarity ${getRarityClass(product.rarityName)}`}>
                      {product.rarityName || 'N/A'}
                    </span>
                  </td>
                  <td>{product.quantity || 0}</td>
                  <td>{product.quantityCurrent || 0}</td>
                  <td className="adproduct-description">
                    <ExpandableDescription text={product.description} maxLength={100} />
                  </td>
                  <td>{renderStatus(product.is_Block)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={productCurrentPage}
            totalPages={productTotalPages}
            onPageChange={setProductCurrentPage}
          />
        </>
      ) : (
        <>
          <table className="adproduct-table">
            <thead>
              <tr>
                <th>Collection id</th>
                <th>Topic</th>
                <th>System</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((cate) => (
                <tr key={cate.id}>
                  <td>{cate.id}</td>
                  <td>{cate.topic}</td>
                  <td>{cate.isSystem ? "True" : "False"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={categoryCurrentPage}
            totalPages={categoryTotalPages}
            onPageChange={setCategoryCurrentPage}
          />
        </>
      )}
    </div>
  );
}
