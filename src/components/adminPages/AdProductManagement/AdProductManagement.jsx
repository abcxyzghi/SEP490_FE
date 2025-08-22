import React, { useEffect, useState } from "react";

import "./AdProductManagement.css";
import { getAllProducts } from "../../../services/api.product";
import { buildImageUrl } from "../../../services/api.imageproxy";

export default function AdProductManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProducts();
      console.log(res.data);
      setData(res.data || []);
    } catch {
      setError("Lỗi khi lấy danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderStatus = (isBlock) => (
    <span className={`adproduct-badge ${isBlock ? "no" : "ok"}`}>
      {isBlock ? "Bị khóa" : "Hoạt động"}
    </span>
  );

  return (
    <div className="adproduct-container">
      <h2 className="adproduct-title">Danh sách Sản phẩm</h2>

      {loading ? (
        <div className="adproduct-status">Đang tải...</div>
      ) : error ? (
        <div className="adproduct-status">{error}</div>
      ) : (
        <table className="adproduct-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Mã sản phẩm</th>
              <th>Bộ sưu tập</th>
              <th>Độ hiếm</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product) => (
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
      )}
    </div>
  );
}
