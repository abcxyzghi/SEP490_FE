import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom"; // để lấy id từ URL
import { getpublicmedalofuser } from "../../../services/api.achivement";
import { buildImageUrl } from "../../../services/api.imageproxy";

export default function UserAchievements() {
  const { id } = useParams();
  const [publicMedals, setPublicMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [useBackupImg, setUseBackupImg] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const fetchMedals = useCallback(async (userId) => {
    try {
      const res = await getpublicmedalofuser(userId);
      const medals = res?.data?.filter((m) => m.isPublic) || [];
      setPublicMedals(medals);
    } catch (err) {
      console.error(err);
      setError("Không thể tải huy chương");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tempId = user?.user_id;
    if (id) {
      fetchMedals(id);
    } else if (tempId) {
      fetchMedals(tempId);
    }
  }, [id]);

  if (loading)
    return <div className="text-center p-4">Đang tải huy chương...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-3">Medal</h2>
      {publicMedals.length === 0 ? (
        <div className="text-gray-500">No medal</div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {publicMedals.map((medal) => (
            <div
              key={medal.userRewardId}
              className="flex flex-col items-center p-2 border rounded-lg shadow-sm hover:shadow-md transition"
            >
              <img
                src={buildImageUrl(medal.urlImage, useBackupImg)}
                onError={() => setUseBackupImg(true)}
                alt="Medal"
                className="w-16 h-16 object-cover rounded-full border"
              />
              <span className="mt-2 text-xs text-gray-500">Công khai</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
