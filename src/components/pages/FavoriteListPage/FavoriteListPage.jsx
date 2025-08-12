import React, { useEffect, useState } from "react";
import { getFavoriteList, removeFavourite } from "../../../services/api.favorites";


export default function FavoriteListPage() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchFavourites();
  }, []);
  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await getFavoriteList();
      console.log("API getFavoriteList:", res);


      const favList = Array.isArray(res) ? res : res?.data || [];

      setFavourites(favList);
    } catch (err) {
      console.error("Lỗi khi load danh sách yêu thích:", err);
      setFavourites([]); // tránh null
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?")) return;
    try {
      await removeFavourite(favId);
      setFavourites((prev) => prev.filter((item) => item.id !== favId));
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  return (
    <div style={{

      color: "white",

    }}>
      <h2>Danh sách yêu thích</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : favourites.length === 0 ? (
        <p>Không có sản phẩm nào.</p>
      ) : (
        <ul>
          {favourites.map((item) => (
            <li key={item.id} style={{ marginBottom: "8px" }}>
              <span>{item.productName}</span>
              <button
                style={{
                  marginLeft: "10px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
                onClick={() => handleRemove(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
