import { useEffect, useState } from "react";
import './UserAchievements.css';
import { useSelector } from "react-redux";
import { getallmedalofuser, updateStatusAuction } from "../../../services/api.achivement";
import { buildImageUrl } from "../../../services/api.imageproxy";
import MessageModal from '../../libs/MessageModal/MessageModal';

export default function UserAchievements() {
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [updatingId, setUpdatingId] = useState(null);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const fetchMedals = async () => {
    try {
      const res = await getallmedalofuser();
      setMedals(res.data || []);
    } catch (err) {
      setError("Failed to load medals");
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
        showModal('default', 'Update Successful', `Medal is now ${res.data.isPublic ? "publicly displayed" : "private"}`);
      } else {
        showModal('error', 'Update Failed', 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      showModal('error', 'Update Error', 'An error occurred while updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="achievementpage-container">
        {/* Medals display skeleton */}
        <section className="achievementpage-section achievementpage-medals">
          <h1 className="achievementpage-title oleo-script-bold">Medal Display</h1>
          <div className="achievementpage-medals-grid">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="achievementpage-medal-card">
                <div className="skeleton w-24 h-24 rounded-full mb-2 bg-gray-700/40"></div>
                <div className="skeleton w-20 h-6 rounded bg-gray-700/40"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return <div className="achievementpage-errMessage oleo-script-regular">{error}</div>;
  }

  return (
    <div className="userAchievement-container">
      {/* Medals display setting section  ||  Re-use most style from Achievementpage*/}
      <section className="achievementpage-section achievementpage-medals">
        <h1 className="achievementpage-title oleo-script-bold">Medal Display</h1>

        {medals.length === 0 ? (
          <div className="achievementpage-empty oleo-script-regular">No medals</div>
        ) : (
          <div className="userAchievement-medals-grid">
            {medals.map((medal) => (
              <div key={medal.userRewardId} className="achievementpage-medal-card">
                <img
                  src={buildImageUrl(medal.urlImage, useBackupImg)}
                  onError={() => setUseBackupImg(true)}
                  alt="Medal"
                  className="achievementpage-medal-img"
                  onClick={() => handleToggleStatus(medal.userRewardId)}
                />

                <button
                  onClick={() => handleToggleStatus(medal.userRewardId)}
                  disabled={updatingId === medal.userRewardId}
                  className={`achievementpage-medal-btn oxanium-regular ${medal.isPublic ? "is-public" : "is-private"}`}
                >
                  {updatingId === medal.userRewardId
                    ? <span className="loading loading-bars loading-md"></span>
                    : medal.isPublic
                      ? "Display Public"
                      : "Keep it Private"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
