/* eslint-disable no-unused-vars */
import { React, useEffect, useState, useCallback } from "react";
import "./Profilepage.css";
import { Snackbar, Alert } from "@mui/material";
import Particles from "../../libs/Particles/Particles";
import MessageModal from "../../libs/MessageModal/MessageModal";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Pathname } from "../../../router/Pathname";
import { useSelector } from "react-redux";
import {
  getProfile,
  getOtherProfile,
  getAllProductOnSaleOfUser,
  createReport,
  getRatingOfUser,
} from "../../../services/api.user";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "../../../services/api.subscription";
import { getpublicmedalofuser } from "../../../services/api.achivement";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { format } from "date-fns";
import SwitchTabs from "../../libs/SwitchTabs/SwitchTabs";
import UserOnSale from "../../tabs/UserOnSale/UserOnSale";
import UserAchievements from "../../tabs/UserAchievements/UserAchievements";
import UserBox from "../../tabs/UserBox/UserBox";
import UserCollectionList from "../../tabs/UserCollectionList/UserCollectionList";
// import assets
import ProfileHolder from "../../../assets/others/mmbAvatar.png";
import MessageIcon from "../../../assets/Icon_fill/comment_fill.svg";
import FollowIcon from "../../../assets/Icon_line/User_add.svg";
import FollowedIcon from "../../../assets/Icon_line/User_Check.svg";
import EditProfileIcon from "../../../assets/Icon_line/User_Card_ID.svg";
import ReportIcon from "../../../assets/Icon_line/warning-error.svg";
import CopyLinkIcon from "../../../assets/Icon_line/link_alt.svg";

export default function Profilepage() {
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const currentUserId = user?.user_id;
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
  const [followSuccess, setFollowSuccess] = useState(false);
  const [profile, setProfile] = useState(null);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [pauseOnHoverZone, setPauseOnHoverZone] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    type: "default",
    title: "",
    message: "",
  });
  const [activeTab, setActiveTab] = useState("Mystery Boxes");
  const [hasFollowed, setHasFollowed] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  // Show warning modal for unauthorized actions using MessageModal
  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };
  const [rating, setRating] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productNumber, setProductNumber] = useState(0);
  const [medals, setMedals] = useState([]);
  const [medalsLoading, setMedalsLoading] = useState(true);
  useEffect(() => {
    const fetchMedals = async () => {
      setMedalsLoading(true);
      try {
        const userId = id || currentUserId;
        if (!userId) {
          setMedals([]);
          return;
        }
        const res = await getpublicmedalofuser(userId);
        if (res && res.status && Array.isArray(res.data)) {
          setMedals(res.data);
        } else {
          setMedals([]);
        }
      } catch (err) {
        console.error("❌ Lỗi khi lấy huy chương:", err);
        setMedals([]);
      } finally {
        setMedalsLoading(false);
      }
    };

    fetchMedals();
  }, [id, currentUserId]);
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        // If id exists and (user is guest or id !== currentUserId), show other profile
        if (id && (!currentUserId || id !== currentUserId)) {
          res = await getOtherProfile(id);
        } else if (currentUserId) {
          res = await getProfile();
        } else {
          setError("You must be logged in to view your own profile.");
          setLoading(false);
          return;
        }
        if (res && res.status) {
          setProfile(res.data);
        } else {
          setError("Profile not found");
        }
        const data = await getRatingOfUser(id);
        setRating(data.data);
        const productData = await getAllProductOnSaleOfUser(id);
        console.log("Product Data", productData);
        if (productData && productData.data) {
          const count = productData.data.filter(
            (item) => item.isSell === true && item.quantity > 0
          ).length;
          setProductNumber(count);
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    // Always allow fetching other profiles, only block my profile if not logged in
    if (id || typeof currentUserId !== "undefined") {
      fetchProfile();
    }
  }, [id, currentUserId]);

  // Move fetchSocialData outside so it can be reused

  const fetchSocialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Gọi API với tham số myUserId = id
      const [followersRes, followingRes] = await Promise.all([
        getFollowers(id),
        getFollowing(id),
      ]);

      const followersData = followersRes.data || [];
      const followingData = followingRes.data || [];

      setFollowers(followersData);
      setFollowing(followingData);

      // Kiểm tra xem id hiện tại có đang follow ai không
      if (
        currentUserId &&
        followersData.some((user) => user.followerId === currentUserId)
      ) {
        setHasFollowed(true);
      } else {
        setHasFollowed(false);
      }
    } catch (error) {
      console.error("❌ Lỗi khi fetch followers/following:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, currentUserId]);

  useEffect(() => {
    fetchSocialData();
  }, [fetchSocialData]);

  // Refetchable fetchProducts for on-sale products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const userId = id || currentUserId;
      if (userId) {
        const res = await getAllProductOnSaleOfUser(userId);
        if (res && res.status) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    }
    setProductsLoading(false);
  }, [id, currentUserId]);

  useEffect(() => {
    if (id || currentUserId) {
      fetchProducts();
    }
  }, [id, currentUserId, fetchProducts]);

  if (loading || isLoading)
    return (
      <div className="w-full sm:px-2 ">
        {/* Banner skeleton */}
        <div className="w-full h-52 skeleton rounded-none bg-gray-700/30" />

        {/* Profile Info Skeleton */}
        <div className="profilepage-wrapper">
          <div className="profilepage-img avatar">
            <div className="profilepage-avatar-container">
              <div className="skeleton w-full h-full rounded bg-gray-700/40 backdrop-blur-sm" />
            </div>
          </div>

          <div className="profilepage-info">
            {/* Left skeleton info */}
            <div className="profilepage-left space-y-4">
              <div className="space-y-2">
                <div className="skeleton h-6 w-40 bg-gray-600/40 rounded" />
                <div className="skeleton h-4 w-24 bg-gray-600/30 rounded" />
              </div>

              <div className="flex gap-3">
                <div className="skeleton h-10 w-32 rounded bg-gray-600/30" />
                <div className="skeleton h-10 w-32 rounded bg-gray-600/30" />
              </div>
            </div>

            {/* Right skeleton action */}
            <div className="profilepage-right flex flex-col gap-4">
              {/* Action buttons skeleton */}
              <div className="profilepage-right-action flex gap-3">
                <div className="skeleton h-10 w-28 rounded-lg bg-gray-600/30" />
                <div className="skeleton h-10 w-38 rounded-lg bg-gray-600/30" />
              </div>

              {/* Figurine stats skeleton */}
              <div className="profilepage-right-figurie flex items-center divide-x divide-gray-500/40 rounded-lg p-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center px-3">
                    <div className="skeleton h-4 w-14 rounded bg-gray-600/30 mb-2" />
                    <div className="skeleton h-4 w-10 rounded bg-gray-600/30" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs switcher skeleton */}
        <div className="tabs-switcher-section flex flex-col gap-3">
          {/*Show 3 skeleton tabs if viewing own profile, else 2 */}
          <div className="flex justify-center gap-4">
            {[
              ...Array((id === currentUserId || !id) && currentUserId ? 3 : 2),
            ].map((_, i) => (
              <div
                key={i}
                className="skeleton h-10 w-28 bg-gray-700/20 rounded"
              />
            ))}
          </div>
          <div className="skeleton h-60 w-[90%] rounded bg-gray-700/40" />
        </div>
      </div>
    );

  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  if (!profile)
    return (
      <div className="text-center mt-10 text-gray-400">
        No profile data found.
      </div>
    );

  const isMyProfile = currentUserId && (id === currentUserId || !id);

  // Construct the tabs array based on isMyProfile
  const tabs = isMyProfile
    ? [
      {
        label: "Mystery Boxes",
        content: <UserBox />,
      },
      {
        label: "Collections",
        content: <UserCollectionList refreshOnSaleProducts={fetchProducts} />,
      },
      {
        label: "On Sale",
        content: (
          <UserOnSale products={products} productsLoading={productsLoading} />
        ),
      },
    ]
    : [
      {
        label: "Collections",
        content: <UserAchievements />,
      },
      {
        label: "On Sale",
        content: (
          <UserOnSale products={products} productsLoading={productsLoading} />
        ),
      },
    ];

  // change createDate format to month year
  const joinedDate = format(new Date(profile.createDate), "MMMM yyyy");

  // Function to copy current domain
  const handleCopyProfileLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setCopySuccess(true); // show snackbar
      })
      .catch((err) => {
        console.error("Failed to copy profile link:", err);
      });
  };

  const handleFollowToggle = async () => {
    try {
      if (hasFollowed) {
        await unfollowUser(id);
        console.log("Đã hủy theo dõi!");
      } else {
        await followUser(id);
        console.log("Đã theo dõi!");
        setFollowSuccess(true); // Show success snackbar nếu cần
      }

      await fetchSocialData(); // Cập nhật lại trạng thái theo dõi
    } catch (error) {
      console.error("❌ Lỗi khi xử lý theo dõi / hủy theo dõi:", error);
    }
  };

  // Function to submit Report form
  const handleSubmitReport = async () => {
    if (!reportTitle || !reportContent) {
      return showModal(
        "warning",
        "Missing field",
        "Please fill in both Title and Content"
      );
    }

    try {
      setReportSubmitting(true);
      const res = await createReport({
        sellProductId: "null",
        sellerId: id,
        title: reportTitle,
        content: reportContent,
      });

      if (res?.success || res?.status) {
        showModal(
          "default",
          "Report sent",
          "The report has been sent to the higher-ups for processing."
        );
        setShowReportModal(false);
        setReportTitle("");
        setReportContent("");
      } else {
        return showModal(
          "error",
          "Error",
          "Report fail to sent. Invalid response"
        );
      }
    } catch (err) {
      console.error("Report error:", err);
      return showModal(
        "error",
        "Error",
        "Something wrong! Please try again later."
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setPauseOnHoverZone(false)}   // won't pause while hovered
      onMouseLeave={() => setPauseOnHoverZone(false)}
    >
      {/* Head profile */}
      <div className="w-full">
        {/* Top banner */}
        {/* <div
          className="profilepage-banner"
          style={{
            backgroundImage: `url(https://i.pinimg.com/736x/86/87/d2/8687d2981dd01ed750fae1a55830735e.jpg)`,
          }}
        /> */}
        <div className='profilepage-banner'>
          <Particles
            particleColors={['#960BAF', '#F8AC52', '#0db6e0']}
            particleCount={370}
            particleSpread={10}
            speed={0.2}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            pauseOnHoverZone={pauseOnHoverZone}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>


        {/* Profile Info Section */}
        <div className="profilepage-wrapper" >
          {/* Profile image */}
          <div className="profilepage-img avatar">
            <div className="profilepage-avatar-container">
              <img
                src={
                  profile.profileImage
                    ? buildImageUrl(profile.profileImage, useBackupImg)
                    : ProfileHolder
                }
                onError={() => setUseBackupImg(true)}
                alt="Profile"
                className="profilepage-avatar"
              />
            </div>
          </div>

          {/* Info & actions */}
          <div className="profilepage-info">
            {/* Left info */}
            <div className="profilepage-left">
              <div className="profilepage-nameJoin">
                <h1 className="profilepage-username oxanium-bold">
                  {profile.username}
                </h1>
                <p className="profilepage-joinTime oxanium-semibold">
                  {" "}
                  Join <span className="oxanium-regular">{joinedDate}</span>
                </p>
              </div>

              <div className="profilepage-buttons">
                {isMyProfile ? (
                  <>
                    <button
                      className="profilepage-btn-follow oxanium-semibold"
                      onClick={() => navigate("/settingpage")}
                    >
                      <img
                        src={EditProfileIcon}
                        alt="Edit"
                        className="profilepage-follow-icon"
                      />
                      Edit profile
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="profilepage-btn-follow oxanium-semibold"
                      onClick={handleFollowToggle}
                    >
                      <img
                        src={hasFollowed ? FollowedIcon : FollowIcon}
                        alt={hasFollowed ? "Following" : "Follow"}
                        className="profilepage-follow-icon"
                      />
                      {hasFollowed ? "Following" : "Follow"}
                    </button>
                    <button
                      className="profilepage-btn-message oxanium-semibold"
                      onClick={() => {
                        if (!user || !user.user_id) {
                          showModal(
                            "warning",
                            "Unauthorized",
                            "You need to log in to message."
                          );
                          return;
                        }
                        if (!id) {
                          showModal(
                            "warning",
                            "Error",
                            "No user found to message."
                          );
                          return;
                        }
                        navigate(`/chatroom/${id}`);
                      }}
                    >
                      <img
                        src={MessageIcon}
                        alt="Message"
                        className="profilepage-message-icon"
                      />
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="profilepage-right">
              {/* Right buttons */}
              <div className="profilepage-right-action">
                {isMyProfile ? (
                  ""
                ) : (
                  <button
                    className="profilepage-btn-report oxanium-semibold"
                    onClick={() => {
                      if (!user || user.role !== "user") {
                        showModal(
                          "warning",
                          "Unauthorized",
                          "You're not permitted to execute this action"
                        );
                        return;
                      }
                      setShowReportModal(true);
                    }}
                  >
                    <img
                      src={ReportIcon}
                      alt="Report"
                      className="profilepage-report-icon"
                    />
                    Report
                  </button>
                )}
                <button
                  className="profilepage-btn-copy oxanium-semibold"
                  onClick={handleCopyProfileLink}
                >
                  <img
                    src={CopyLinkIcon}
                    alt="Copy"
                    className="profilepage-copyLink-icon"
                  />
                  Copy profile link
                </button>
              </div>

              {/* Right figures */}
              <div className="profilepage-right-figurie oxanium-regular">
                <div
                  className="profilepage-figurie-item profilepage-figurie-clickable"
                  onClick={() => setIsFollowModalOpen(true)}
                >
                  <h3>Followers</h3>
                  <p>{followers.length}</p>
                </div>

                <div
                  className="profilepage-figurie-item profilepage-figurie-clickable"
                  onClick={() => setIsFollowModalOpen(true)}
                >
                  <h3>Following</h3>
                  <p>{following.length}</p>
                </div>

                <div className="profilepage-figurie-item">
                  <h3>On sale</h3>
                  <p>{productNumber}</p>
                </div>

                <div className="profilepage-figurie-item">
                  <h3>Avg review</h3>
                  <p>⭐ {rating}</p>
                </div>
                {/* Medals Section */}
                <div className="profilepage-medals mt-4">
                  <h3 className="oxanium-semibold">Achievements</h3>
                  {medalsLoading ? (
                    <p className="text-gray-400">Loading medals...</p>
                  ) : medals.length > 0 ? (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {medals.map((medal) => (
                        <div
                          key={medal.medalId}
                          className="flex flex-col items-center"
                        >
                          <img
                            src={buildImageUrl(medal.urlImage, useBackupImg)}
                            onError={() => setUseBackupImg(true)}
                            alt={medal.medalName}
                            className="w-12 h-12 object-cover rounded-full"
                          />
                          <span className="text-xs mt-1 text-center">
                            {medal.medalName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No medals yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Followers / Following */}
      {isFollowModalOpen && (
        <div
          className="profilepage-fllw-modal-overlay"
          onClick={() => setIsFollowModalOpen(false)}
        >
          <div
            className="profilepage-fllw-modal"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* Close Button */}
            <button
              className="profilepage-fllw-close-btn"
              onClick={() => setIsFollowModalOpen(false)}
            >
              ⨉
            </button>

            <h2 className="profilepage-fllw-title oleo-script-bold">
              Followers & Following
            </h2>

            {/* Followers List */}
            <h4 className="profilepage-fllw-section-title oxanium-semibold">
              Followers
            </h4>
            <ul className="profilepage-fllw-list">
              {followers.length > 0 ? (
                followers.map((follower) => (
                  <li
                    key={`follower-${follower.followerId}`}
                    className="profilepage-fllw-item oxanium-regular"
                  >
                    <Link
                      to={Pathname("PROFILE").replace(":id", follower.userId)}
                      className="profilepage-fllw-link"
                    >
                      <img
                        src={buildImageUrl(follower.urlImage, useBackupImg)}
                        onError={() => setUseBackupImg(true)}
                        alt={follower.followerName}
                        className="profilepage-fllw-avatar"
                      />
                      <span>{follower.followerName}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="profilepage-fllw-empty">
                  Not followed by anyone
                </li>
              )}
            </ul>

            {/* Following List */}
            <h4 className="profilepage-fllw-section-title oxanium-semibold">
              Following
            </h4>
            <ul className="profilepage-fllw-list">
              {following.length > 0 ? (
                following.map((followed) => (
                  <li
                    key={`following-${followed.followerId}`}
                    className="profilepage-fllw-item oxanium-regular"
                  >
                    <Link
                      to={Pathname("PROFILE").replace(":id", followed.userId)}
                      className="profilepage-fllw-link"
                    >
                      <img
                        src={buildImageUrl(followed.urlImage, useBackupImg)}
                        onError={() => setUseBackupImg(true)}
                        alt={followed.userName}
                        className="profilepage-fllw-avatar"
                      />
                      <span>{followed.userName}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="profilepage-fllw-empty">
                  Not following anyone yet
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Tabs switcher */}
      <div className="tabs-switcher-section"
        onMouseEnter={() => setPauseOnHoverZone(false)}   // won't pause while hovered
        onMouseLeave={() => setPauseOnHoverZone(false)}
      >
        <SwitchTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(label) => setActiveTab(label)}
        />
      </div>

      {/* Report modal */}
      {showReportModal && (
        <div className="report-modal-overlay">
          <div className="report-modal-container">
            <div className="report-modal-box">
              <h3 className="report-modal-header oleo-script-bold">
                Report this account
              </h3>
              <input
                type="text"
                placeholder="Title"
                className="oxanium-regular"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
              <textarea
                placeholder="Content"
                className="oxanium-regular"
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
              />
              <div className="report-modal-actions oxanium-bold">
                <button onClick={() => setShowReportModal(false)}>
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={reportSubmitting}
                >
                  {reportSubmitting ? (
                    <span className="loading loading-bars loading-md"></span>
                  ) : (
                    "Submit report"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success copy profile link snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setCopySuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Profile link copied to clipboard!
        </Alert>
      </Snackbar>

      {/* Success follow snackbar */}
      <Snackbar
        open={followSuccess}
        autoHideDuration={3000}
        onClose={() => setFollowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setFollowSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Following successfully!
        </Alert>
      </Snackbar>

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
