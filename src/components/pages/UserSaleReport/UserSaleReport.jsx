import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import "./UserSaleReport.css";
import {
  getAllCommentsOfSellProduct,
  getUserSale,
  getAverageRatingsOfSellProduct,
} from "../../../services/api.user";
// import { useParams } from "react-router-dom";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { buildImageUrl } from "../../../services/api.imageproxy";

export default function UserSaleReport() {
  const [activeTab, setActiveTab] = useState("day");
  const [byDay, setByDay] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [byYear, setByYear] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const currentUserId = user?.user_id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState(null);
  const [selectedProductRating, setSelectedProductRating] = useState(null);
  useEffect(() => {
    const fetchUserSale = async () => {
      try {
        const res = await getUserSale();
        const data = res.data;

        const format = (arr) =>
          arr.map((item) => ({
            ...item,
            name: item.time,
          }));

        setByDay(format(data.byDay));
        setByMonth(format(data.byMonth));
        setByYear(format(data.byYear));
        setTopProducts(data.topProducts);
      } catch (err) {
        console.error("Failed to fetch user sale report:", err);
      }
    };

    fetchUserSale();
  }, []);
  const handleShowComments = async (productName) => {
    try {
      setSelectedProductName(productName);
      const res = await getAllCommentsOfSellProduct(currentUserId, productName);
      setComments(res.data);

      // Tìm productId từ topProducts
      const product = topProducts.find((p) => p.productName === productName);

      if (product) {
        try {
          const ratingRes = await getAverageRatingsOfSellProduct(
            product.productId
          );
          setSelectedProductRating(ratingRes.data);
        } catch (err) {
          console.error("Lỗi khi lấy rating:", err);
          setSelectedProductRating(null);
        }
      }

      setIsModalOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy bình luận sản phẩm:", err);
    }
  };
  const renderBarChart = (title, data, timeLabel) => (
    <div className="chart-container bar-chart">
      <h3 className="chart-title">{title} - Đơn hàng & Sản phẩm</h3>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={{ value: timeLabel, position: "insideBottom", offset: -5 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="orders" fill="#82ca9d" name="Số đơn hàng" />
          <Bar dataKey="productsSold" fill="#ffc658" name="Sản phẩm đã bán" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderLineChart = (title, data, timeLabel) => (
    <div className="chart-container line-chart">
      <h3 className="chart-title">{title} - Doanh thu</h3>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={{ value: timeLabel, position: "insideBottom", offset: -5 }}
          />
          <YAxis />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(value)
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            name="Doanh thu"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
  const renderTopProductsChart = (data) => (
    <div className="chart-container top-products-chart">
      <h3 className="chart-title">🔥 Top sản phẩm bán chạy</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="productName"
            angle={-25}
            textAnchor="end"
            interval={0}
            height={100}
          />
          <YAxis yAxisId="left" />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(value)
            }
          />
          <Tooltip
            formatter={(value, name) =>
              name === "Doanh thu"
                ? new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(value)
                : value
            }
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="totalSold"
            fill="#82ca9d"
            name="Số lượng đã bán"
          />
          <Bar
            yAxisId="right"
            dataKey="totalRevenue"
            fill="#8884d8"
            name="Doanh thu"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  return (
    <>
      <div className="statistics-wrapper">
        <div className="tab-buttons-chart">
          <button
            className={activeTab === "day" ? "active" : ""}
            onClick={() => setActiveTab("day")}
          >
            📅 Ngày
          </button>
          <button
            className={activeTab === "month" ? "active" : ""}
            onClick={() => setActiveTab("month")}
          >
            🗓️ Tháng
          </button>
          <button
            className={activeTab === "year" ? "active" : ""}
            onClick={() => setActiveTab("year")}
          >
            📈 Năm
          </button>
          <button
            className={activeTab === "top" ? "active" : ""}
            onClick={() => setActiveTab("top")}
          >
            🔥 Top Sản Phẩm
          </button>
        </div>

        {activeTab === "day" && (
          <>
            {renderBarChart("📅 Thống kê theo ngày", byDay)}
            {renderLineChart("📅 Thống kê theo ngày", byDay)}
          </>
        )}

        {activeTab === "month" && (
          <>
            {renderBarChart("🗓️ Thống kê theo tháng", byMonth)}
            {renderLineChart("🗓️ Thống kê theo tháng", byMonth)}
          </>
        )}

        {activeTab === "year" && (
          <>
            {renderBarChart("📈 Thống kê theo năm", byYear)}
            {renderLineChart("📈 Thống kê theo năm", byYear)}
          </>
        )}

        {activeTab === "top" && (
          <>
            {renderTopProductsChart(topProducts)}

            <div className="top-products-list">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    padding: 16,
                    marginTop: 12,
                    backgroundColor: "#fff",
                    color: "#000",
                  }}
                >
                  <h4>{product.productName}</h4>
                  <p>Số lượng bán: {product.totalSold}</p>
                  <p>Doanh thu: {product.totalRevenue}</p>
                  <img
                    src={buildImageUrl(product.urlImage)}
                    alt={product.productName}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                  <button
                    onClick={() => handleShowComments(product.productName)}
                  >
                    💬 Xem bình luận
                  </button>
                </div>
              ))}
            </div>

            <Modal
              open={isModalOpen}
              title={`Bình luận về sản phẩm: ${selectedProductName}`}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedProductRating(null); // Reset rating khi đóng modal
              }}
              footer={null}
            >
              <div style={{ marginBottom: 10 }}>
                ⭐ Đánh giá trung bình:{" "}
                {selectedProductRating !== null
                  ? selectedProductRating
                  : "Đang tải..."}
              </div>

              {comments.length === 0 ? (
                <p>Không có bình luận nào.</p>
              ) : (
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {comments.map((comment, index) => (
                    <li
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "10px 0",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <img
                        src={buildImageUrl(comment.profileImage)}
                        alt={comment.username}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginTop: 2,
                        }}
                      />
                      <div>
                        <strong>{comment.username}</strong>{" "}
                        <small style={{ color: "#888", marginLeft: 6 }}>
                          {new Date(comment.createdAt).toLocaleString("vi-VN")}
                        </small>
                        <p style={{ margin: "4px 0" }}>
                          {comment.content || <i>(Không có nội dung)</i>}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Modal>
          </>
        )}
      </div>
    </>
  );
}
