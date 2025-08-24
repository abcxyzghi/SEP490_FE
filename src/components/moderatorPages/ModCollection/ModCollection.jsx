import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getAllCollection, createCollection } from '../../../services/api.collection';
import { buildImageUrl } from '../../../services/api.imageproxy';
import { getAchievementDetail, createAchievement, createRewardOfAchievement } from '../../../services/api.achievement';
import { toast } from "react-toastify";
import './ModCollection.css';

// --- Helper Component: Pagination ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="mod-collection-pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo;</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>&raquo;</button>
    </div>
  );
};

// --- Helper Component: Image with Fallback ---
const ImageWithFallback = ({ src, fallbackSrc, ...rest }) => {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => { setImgSrc(src); }, [src]);
  const handleError = () => setImgSrc(fallbackSrc);
  return <img src={imgSrc || fallbackSrc} onError={handleError} {...rest} />;
};

// --- Helper Component MỚI: RewardCard ---
const RewardCard = ({ reward }) => {
  // Trường hợp 1: Đây là phần thưởng Hộp quà
  if (reward.quantity_box > 0 && reward.url_image === '') {
    // Bạn có thể thay thế URL này bằng ảnh hộp quà của riêng bạn
    return (
      <div className="mod-collection-reward-card mod-collection-reward-card--box">
        <p><strong>Need:</strong> {reward.conditions}</p>
        <p><strong>Reward:</strong> {reward.quantity_box} Mystery Box</p>
      </div>
    );
  }

  // Trường hợp 2: Đây là phần thưởng Huy hiệu
  return (
    <div className="mod-collection-reward-card mod-collection-reward-card--medal">
      <ImageWithFallback
        src={buildImageUrl(reward.url_image, reward.url_image)}
        fallbackSrc="https://via.placeholder.com/100"
        alt="Medal"
      />
      <p><strong>Need:</strong> {reward.conditions}</p>
      {/* <p><strong>Reward:</strong> Medal</p> */}
      {reward.quantity_box > 0 ? (<p><strong>Reward:</strong> Medal & {reward.quantity_box} Mystery Box</p>
      )
        : <p><strong>Reward:</strong> Medal</p>
      }
    </div>
  );
};

export default function ModCollection() {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [achievementDetail, setAchievementDetail] = useState(null);
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form states
  const [conditions, setConditions] = useState("");
  const [file, setFile] = useState(null);
  const [quantityBox, setQuantityBox] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");


  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchCollections = useCallback(async () => {
    try {
      const response = await getAllCollection();
      setCollections(response.data || []);
    } catch (err) {
      toast.error("Could not load collections list");
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleViewAchievement = async (collection) => {
    if (selectedCollection?.id === collection.id) return;
    setSelectedCollection(collection);
    setLoadingDetails(true);
    setAchievementDetail(null);
    try {
      const detail = await getAchievementDetail(collection.id);
      if (detail.data) {
        setAchievementDetail(detail.data);
      }
    } catch (error) {
      toast.error("Could not fetch achievement details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateAchievement = async () => {

    const name = prompt("Enter Achievement Name:");
    if (!name) return;
    try {
      const res = await createAchievement(selectedCollection.id, name);
      if (res.status) {
        toast.success("Achievement created successfully!");
        handleViewAchievement(selectedCollection);
      } else {
        toast.error(res.error || "Failed to create Achievement");
      }
    } catch (err) {
      toast.error("Server connection error");
    }
  };

  const handleAddReward = async (e) => {
    e.preventDefault();
    if (!conditions || !quantityBox || !file) {
      toast.error("Please fill in all reward fields");
      return;
    }
    const res = await createRewardOfAchievement(selectedCollection.id, conditions, file, quantityBox);
    if (res) {
      toast.success("Reward added successfully!");
      setConditions(""); setFile(null); setQuantityBox("");
      e.target.reset(); // Reset form fields
      handleViewAchievement(selectedCollection);
    }
  };


  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name");
      return;
    }
    const res = await createCollection(newCollectionName);
    if (res) {
      toast.success("Collection created successfully!");
      setNewCollectionName("");
      fetchCollections();
    }
  };

  // Filter and Paginate Collections List
  const filteredCollections = useMemo(() => {
    if (!searchTerm) return collections;
    return collections.filter(c => c.topic.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [collections, searchTerm]);

  const paginatedCollections = filteredCollections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);


  return (
    <div className="mod-collection-container">
      {/* --- Sidebar (Master View) --- */}
      <div className="mod-collection-sidebar">
        <h2 className="mod-collection-sidebar-title">Collections</h2>
        <form className="mod-collection-form" onSubmit={handleCreateCollection}>
          <input type="text" placeholder="Create new collection..." value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} />
          <button type="submit">+</button>
        </form>


        <div className="mod-collection-filters">
          <input type="text" className="mod-collection-search" placeholder="Search by topic..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={2}>2 / page</option>
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        <div className="mod-collection-list">
          {paginatedCollections.map((collection) => (
            <div
              className={`mod-collection-list-item ${selectedCollection?.id === collection.id ? 'active' : ''}`}
              key={collection.id}
              onClick={() => handleViewAchievement(collection)}
            >
              <h3>{collection.topic}</h3>
              <p className={`mod-collection-badge ${collection.isSystem ? "system" : "user"}`}>
                {collection.isSystem ? "System" : "User"}
              </p>
            </div>
          ))}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* --- Main Content (Detail View) --- */}
      <div className="mod-collection-main">
        {!selectedCollection ? (
          <div className="mod-collection-placeholder">
            <h3>Select a collection to view its details</h3>
            <p>Manage achievements and rewards for each collection.</p>
          </div>
        ) : loadingDetails ? (
          <div className="mod-collection-placeholder"><h3>Loading Details...</h3></div>
        ) : (
          <div className="mod-collection-detail-view">
            <h2 className="mod-collection-detail-header">Achievement for: {selectedCollection.topic}</h2>
            {achievementDetail ? (
              <div className="mod-collection-achievement-container">
                <div className="mod-collection-achievement-info">
                  <p><strong>Name:</strong> {achievementDetail.name}</p>
                  <p><strong>Created:</strong> {new Date(achievementDetail.create_at).toLocaleString()}</p>
                </div>
                <h4>Rewards</h4>
                {/* <div className="mod-collection-rewards-grid">
                  {achievementDetail.dtos.map((reward, idx) => (
                    <div key={idx} className="mod-collection-reward-card">
                      <ImageWithFallback src={buildImageUrl(reward.url_image)} fallbackSrc="https://via.placeholder.com/100" alt="Medal" />
                      <p><strong>Need:</strong> {reward.conditions}</p>
                      <p><strong>Boxes:</strong> {reward.quantity_box}</p>
                    </div>
                  ))}
                </div> */}
                <div className="mod-collection-rewards-grid">
                  {achievementDetail.dtos.map((reward, idx) => (
                    <RewardCard key={idx} reward={reward} />
                  ))}
                </div>
                <form className="mod-collection-form add-reward" onSubmit={handleAddReward}>
                  <h4>Add New Reward</h4>
                  <input type="number" placeholder="Condition (e.g., 10)" value={conditions} onChange={(e) => setConditions(e.target.value)} required />
                  <input type="number" placeholder="Quantity Box" value={quantityBox} onChange={(e) => setQuantityBox(e.target.value)} required />
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                  <button type="submit">Add Reward</button>
                </form>
              </div>
            ) : (
              <div className="mod-collection-no-achievement">
                <p>This collection does not have an achievement yet.</p>
                <button onClick={handleCreateAchievement}>Create Achievement</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}