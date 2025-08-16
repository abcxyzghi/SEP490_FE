import React, { useEffect, useState } from "react";
import {
  getallmedalofuser,
  getUserCollectionProgress,
  updateStatusAuction,
} from "../../../services/api.achivement";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { useSelector } from "react-redux";

export default function Achievementpage() {
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null); // để biết huy chương nào đang update
  const [useBackupImg, setUseBackupImg] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const userId = user.user_id;
  const [progress, setProgress] = useState([]);

  // 1️⃣ Tách hàm fetch riêng
  const loadProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserCollectionProgress();
      setProgress(res.data || []); // ✅ chỉ lấy mảng data
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user collection progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);
  const fetchMedals = async () => {
    try {
      const res = await getallmedalofuser();
      setMedals(res.data || []);
      console.log("Medals API response:", res);
      console.log("Medals array:", res.data);
    } catch (err) {
      setError("Không thể tải danh sách huy chương");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedals();
  }, []);

  const handleToggleStatus = async (userRewardId) => {
    try {
      setUpdatingId(userRewardId);
      const res = await updateStatusAuction(userRewardId);
      if (res?.status) {
        setMedals((prev) =>
          prev.map((medal) =>
            medal.userRewardId === userRewardId
              ? { ...medal, isPublic: !medal.isPublic }
              : medal
          )
        );
      } else {
        alert("Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <>
      {" "}
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Your medal</h1>
        {medals.length === 0 ? (
          <div>No medal</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {medals.map((medal) => (
              <div
                key={medal.userRewardId}
                className="flex flex-col items-center p-3 border rounded-lg hover:shadow-md transition"
              >
                <img
                  src={buildImageUrl(medal.urlImage, useBackupImg)}
                  onError={() => setUseBackupImg(true)}
                  alt="Medal"
                  className="w-20 h-20 object-cover rounded-full border cursor-pointer"
                  onClick={() => handleToggleStatus(medal.userRewardId)}
                />
                <button
                  onClick={() => handleToggleStatus(medal.userRewardId)}
                  disabled={updatingId === medal.userRewardId}
                  className={`mt-2 px-3 py-1 text-xs rounded ${
                    medal.isPublic
                      ? "bg-green-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {console.log(medal)}
                  {updatingId === medal.userRewardId
                    ? "Đang cập nhật..."
                    : medal.isPublic
                    ? "Công khai"
                    : "Riêng tư"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4" style={{ color: "white" }}>
        <h1 className="text-xl font-bold mb-4">Your Collection Progress</h1>
        {progress.length === 0 ? (
          <div>No progress</div>
        ) : (
          <div className="space-y-6">
            {progress.map((achievement) => (
              <div key={achievement.id} className="border p-4 rounded-lg">
                {/* Tên bộ sưu tập + achievement */}
                <h2 className="text-lg font-semibold mb-2">
                  {achievement.collectionName} - {achievement.achievementName}
                </h2>

                {/* Các mốc trong achievement */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievement.dtos.map((dto, index) => (
                    <div
                      key={index}
                      className={`flex flex-col items-center p-3 border rounded-lg hover:shadow-md transition ${
                        dto.isComplete
                          ? "bg-green-800/40 border-green-500"
                          : "bg-gray-800/30"
                      }`}
                    >
                      {dto.url_image && (
                        <img
                          src={buildImageUrl(dto.url_image, useBackupImg)}
                          onError={() => setUseBackupImg(true)}
                          alt="Achievement"
                          className="w-20 h-20 object-cover rounded-full border"
                        />
                      )}
                      <div className="mt-2 text-center text-sm">
                        Điều kiện: {dto.conditions}
                      </div>
                      <div className="mt-1 text-xs">
                        {dto.isComplete ? (
                          <span className="text-green-400 font-semibold">
                            {" "}
                            Hoàn thành
                          </span>
                        ) : (
                          <span className="text-gray-400">Chưa đạt</span>
                        )}
                      </div>
                      {dto.quantity_box > 0 && (
                        <div className="mt-1 text-xs text-gray-300">
                          Hộp hiện có: {dto.quantity_box}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
