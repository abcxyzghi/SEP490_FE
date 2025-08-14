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
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { buildImageUrl } from "../../../services/api.imageproxy";
import ProductCard from "../../libs/ProductCard/ProductCard";

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

      const product = topProducts.find((p) => p.productName === productName);

      if (product) {
        try {
          const ratingRes = await getAverageRatingsOfSellProduct(
            product.productId
          );
          setSelectedProductRating(ratingRes.data);
        } catch (err) {
          console.error("Error fetching rating:", err);
          setSelectedProductRating(null);
        }
      }

      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching product comments:", err);
    }
  };

  const renderBarChart = (title, data, timeLabel) => (
    <div className="chart-container bar-chart">
      <h3 className="chart-title">{title} - Orders & Products</h3>
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
          <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
          <Bar dataKey="productsSold" fill="#ffc658" name="Products Sold" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderLineChart = (title, data, timeLabel) => (
    <div className="chart-container line-chart">
      <h3 className="chart-title">{title} - Revenue</h3>
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
            stroke="#FF4DFF"
            name="Revenue"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTopProductsChart = (data) => (
    <div className="chart-container top-products-chart">
      <h3 className="chart-title">🔥 Top Selling Products</h3>
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
              name === "Revenue"
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
            name="Quantity Sold"
          />
          <Bar
            yAxisId="right"
            dataKey="totalRevenue"
            fill="#8884d8"
            name="Revenue"
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
            📅 Day
          </button>
          <button
            className={activeTab === "month" ? "active" : ""}
            onClick={() => setActiveTab("month")}
          >
            🗓️ Month
          </button>
          <button
            className={activeTab === "year" ? "active" : ""}
            onClick={() => setActiveTab("year")}
          >
            📈 Year
          </button>
          <button
            className={activeTab === "top" ? "active" : ""}
            onClick={() => setActiveTab("top")}
          >
            🔥 Top Products
          </button>
        </div>

        {activeTab === "day" && (
          <>
            {renderBarChart("📅 Daily Statistics", byDay)}
            {renderLineChart("📅 Daily Statistics", byDay)}
          </>
        )}

        {activeTab === "month" && (
          <>
            {renderBarChart("🗓️ Monthly Statistics", byMonth)}
            {renderLineChart("🗓️ Monthly Statistics", byMonth)}
          </>
        )}

        {activeTab === "year" && (
          <>
            {renderBarChart("📈 Yearly Statistics", byYear)}
            {renderLineChart("📈 Yearly Statistics", byYear)}
          </>
        )}

        {activeTab === "top" && (
          <>
            {renderTopProductsChart(topProducts)}

            <div className="top-products-list">
              {topProducts.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  onShowComments={handleShowComments}
                />
              ))}
            </div>

            <Modal
              className="product-modal"
              open={isModalOpen}
              title={`Comments for product: ${selectedProductName}`}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedProductRating(null);
              }}
              footer={null}
            >
              <div className="product-modal-rating">
                ⭐ Average Rating:{" "}
                {selectedProductRating !== null
                  ? selectedProductRating
                  : "Loading..."}
              </div>

              {comments.length === 0 ? (
                <p style={{ color: "#ccc" }}>No comments available.</p>
              ) : (
                <ul className="product-comment-list">
                  {comments.map((comment, index) => (
                    <li key={index} className="product-comment-item">
                      <img
                        src={buildImageUrl(comment.profileImage)}
                        alt={comment.username}
                        className="product-comment-avatar"
                      />
                      <div className="product-comment-content">
                        <strong>{comment.username}</strong>
                        <small className="product-comment-date">
                          {new Date(comment.createdAt).toLocaleString("vi-VN")}
                        </small>
                        <p className="product-comment-text">
                          {comment.content || <i>(No content)</i>}
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
