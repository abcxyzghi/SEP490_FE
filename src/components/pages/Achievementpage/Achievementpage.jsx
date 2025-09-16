import React, { useEffect, useState } from "react";
import "./Achievementpage.css";
import * as Progress from "@radix-ui/react-progress";
import {
  getallmedalofuser,
  getUserCollectionProgress,
  updateStatusAuction,
} from "../../../services/api.achivement";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { useSelector } from "react-redux";
import MessageModal from '../../libs/MessageModal/MessageModal';
import CheckCompleteIcon from "../../../assets/Icon_line/check_ring_round.svg";

export default function Achievementpage() {
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const [updatingId, setUpdatingId] = useState(null); // để biết huy chương nào đang update
  const [useBackupImg, setUseBackupImg] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const userId = user.user_id;
  const [progress, setProgress] = useState([]);

  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

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
        prev.map((medal) => {
          if (medal.userRewardId === userRewardId) {
            const newStatus = !medal.isPublic;
            // Hiển thị modal ngay khi đổi status
            showModal(
              'default',
              'Update Successful',
              `Medal is now ${newStatus ? "publicly displayed" : "private"}`
            );
            return { ...medal, isPublic: newStatus };
          }
          return medal;
        })
      );
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

  // Compute percent based on achievement.count vs highest dto.conditions
  const getAchievementProgress = (achievement) => {
    const { count = 0, dtos = [] } = achievement;
    const maxCondition = dtos.length ? Math.max(...dtos.map(d => Number(d.conditions) || 0)) : 0;
    if (!maxCondition) return 0;
    return Math.min(100, Math.round((count / maxCondition) * 100));
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
                <div className="skeleton w-32 h-6 rounded bg-gray-700/40"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Progress / Achievements skeleton */}
        <section className="achievementpage-section achievementpage-progress">
          <h1 className="achievementpage-title oleo-script-bold">Collection Progress</h1>
          <div className="achievementpage-achievements-stack oxanium-regular">
            {[...Array(2)].map((_, idx) => (
              <article key={idx} className="achievementpage-achievement-card">
                <header className="achievementpage-achievement-header">
                  <div className="skeleton w-40 h-12 mb-2 rounded bg-gray-700/40"></div>
                  <div className="achievementpage-progress-scroll">
                    <div className="achievementpage-progress-wrap justify-center">
                      <div className="flex gap-55 mt-2">
                        {[...Array(5)].map((__, pinIdx) => (
                          <div key={pinIdx} className="flex flex-col items-center">
                            <div className="skeleton w-12 h-12 rounded mb-1 bg-gray-700/40"></div>
                          </div>
                        ))}
                      </div>

                      <div className="skeleton w-full h-4 rounded bg-gray-700/40"></div>

                      <div className="flex gap-50 mt-2">
                        {[...Array(5)].map((__, pinIdx) => (
                          <div key={pinIdx} className="flex flex-col gap-2 items-center">
                            <div className="skeleton w-16 h-4 rounded bg-gray-700/40"></div>
                            <div className="skeleton w-16 h-4 rounded bg-gray-700/40"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </header>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return <div className="achievementpage-errMessage oleo-script-regular">{error}</div>;
  }

  return (
    <div className="achievementpage-container">
      {/* Medals display setting section */}
      <section className="achievementpage-section achievementpage-medals">
        <h1 className="achievementpage-title oleo-script-bold">Medal Display</h1>

        {medals.length === 0 ? (
          <div className="achievementpage-empty oleo-script-regular">No medals</div>
        ) : (
          <div className="achievementpage-medals-grid">
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

      {/* Progress / Achievements section */}
      <section className="achievementpage-section achievementpage-progress">
        <h1 className="achievementpage-title oleo-script-bold">Collection Progress</h1>

        {progress.length === 0 ? (
          <div className="achievementpage-empty oleo-script-regular">No progress</div>
        ) : (
          <div className="achievementpage-achievements-stack oxanium-regular">
            {progress.map((achievement) => {
              const percent = getAchievementProgress(achievement);

              return (
                <article key={achievement.id} className="achievementpage-achievement-card">
                  <header className="achievementpage-achievement-header">
                    <h2 className="achievementpage-collection-name">
                      {achievement.collectionName} ({achievement.count})
                    </h2>

                    <div className="achievementpage-progress-scroll">
                      <div className="achievementpage-progress-wrap">
                        {/* Progress bar (Radix root) */}
                        <Progress.Root
                          className="achievementpage-radix-progress-root"
                          value={percent}
                        >
                          <Progress.Indicator
                            className="achievementpage-radix-progress-indicator"
                            style={{ width: `${percent}%` }}
                          />

                          {/* Pins (position left dynamic) */}
                          {achievement.dtos.map((dto, idx) => {
                            const leftPercent = achievement.dtos.length > 1
                              ? (idx / (achievement.dtos.length - 1)) * 100
                              : 0;
                            return (
                              <div
                                key={idx}
                                className={`achievementpage-pin-container ${dto.isComplete ? "pin-complete" : ""}`}
                                style={{ left: `calc(${leftPercent}% - 8px)` }}
                                title={`Collected: ${dto.conditions}`}
                              >
                                <span className="achievementpage-pin-symbol">◆</span>

                                <div className="achievementpage-pin-label">
                                  <div className="achievementpage-condition">
                                    Collected: <strong>{dto.conditions}</strong>
                                  </div>
                                  <div className={`achievementpage-status ${dto.isComplete ? "achievementpage-status-complete" : "achievementpage-status-incomplete"}`}>
                                    {dto.isComplete ? "Completed" : "Incomplete"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Images above pins (position left dynamic) */}
                          {achievement.dtos.map((dto, idx) => {
                            const leftPercent = achievement.dtos.length > 1
                              ? (idx / (achievement.dtos.length - 1)) * 100
                              : 0;
                            const imgSrc = dto.url_image
                              ? buildImageUrl(dto.url_image, useBackupImg)
                              : buildImageUrl(dto.mangaBox_image, useBackupImg);

                            return (
                              <div
                                key={"img-" + idx}
                                className="achievementpage-img-absolute"
                                style={{ left: `calc(${leftPercent}% - 24px)` }}
                                aria-hidden={dto.isComplete ? "false" : "true"}
                              >
                                <img
                                  src={imgSrc}
                                  onError={() => setUseBackupImg(true)}
                                  alt={`Reward ${dto.conditions}`}
                                  className={`achievementpage-gift-img ${dto.isComplete ? "achieve-gift-complete" : ""}`}
                                />

                                {/* overlay check icon when completed */}
                                {dto.isComplete && (
                                  <img
                                    src={CheckCompleteIcon}
                                    alt="Complete"
                                    className="achievementpage-check-icon"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </Progress.Root>
                      </div>
                    </div>
                  </header>
                </article>
              );
            })}
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
