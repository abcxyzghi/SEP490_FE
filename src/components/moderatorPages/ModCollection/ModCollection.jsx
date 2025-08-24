import React, { useEffect, useState } from "react";
import { getAllCollection,createCollection } from '../../../services/api.collection';
import { buildImageUrl } from '../../../services/api.imageproxy';
import { 
  getAchievementDetail, 
  createAchievement, 
  createRewardOfAchievement 
} from '../../../services/api.achievement';
import { toast } from "react-toastify";
import './ModCollection.css';

export default function ModCollection() {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [achievementDetail, setAchievementDetail] = useState(null);
  const [useBackupImg, setUseBackupImg] = useState(false);

  // Reward form state
  const [conditions, setConditions] = useState("");
  const [file, setFile] = useState(null);
  const [quantityBox, setQuantityBox] = useState("");

  // New collection form
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleClosePopup = () => {
    setSelectedCollection(null);
    setAchievementDetail(null);
    setConditions("");
    setFile(null);
    setQuantityBox("");
  };

  // Fetch all collections
  const fetchCollections = async () => {
    try {
      const response = await getAllCollection();
      setCollections(response.data);
    } catch (err) {
      toast.error("Không thể tải danh sách collections");
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleViewAchievement = async (collection) => {
    setSelectedCollection(collection);
    const detail = await getAchievementDetail(collection.id);
    if (detail.data !== null) {
      setAchievementDetail(detail.data);
    } else {
      setAchievementDetail(null);
    }
  };

  const handleCreateAchievement = async () => {
    const name = prompt("Enter Name Achievement:");
    if (!name) return;

    try {
      const res = await createAchievement(selectedCollection.id, name);
      if (res.status) {
        toast.success("Achievement created!");
        handleViewAchievement(selectedCollection);
      } else {
        toast.error(res.error || "Can't create Achievement");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    }
  };

  const handleAddReward = async () => {
    if (!conditions || !quantityBox) {
      toast.error("Vui lòng nhập đủ thông tin reward");
      return;
    }

    const res = await createRewardOfAchievement(
      selectedCollection.id,
      conditions,
      file,
      quantityBox
    );

    if (res) {
      toast.success("Reward added!");
      setConditions("");
      setFile(null);
      setQuantityBox("");
      handleViewAchievement(selectedCollection); // Refresh detail
    }
  };

  // ✅ Create new collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error("Vui lòng nhập tên collection");
      return;
    }

    const res = await createCollection(newCollectionName);
    if (res) {
      toast.success("Tạo collection thành công!");
      setNewCollectionName("");
      fetchCollections(); // refresh lại danh sách
    }
  };

  return (
    <div className="mod-collection-container">
      <div className="mod-collection-header">
        <h1>Collections</h1>

        {/* Form tạo collection mới */}
        <div className="create-collection-form">
          <input
            type="text"
            placeholder="Enter name of new Collection"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
          <button onClick={handleCreateCollection}>Create Collection</button>
        </div>
      </div>

      <div className="collection-grid">
        {collections.map((collection) => (
          <div 
            className="collection-card" 
            key={collection.id}
            onClick={() => handleViewAchievement(collection)}
          >
            <h2>{collection.topic}</h2>
            <p>ID: {collection.id}</p>
            <p className={`badge ${collection.isSystem ? "system" : "user"}`}>
              {collection.isSystem ? "System" : "User"}
            </p>
          </div>
        ))}
      </div>

      {selectedCollection && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h2 className="mod-collection-achievement-header">Achievement of {selectedCollection.topic}</h2>

            {achievementDetail ? (
              <div className="achievement-container">
                <div className="achievement-header">
                  <p><strong>{achievementDetail.name}</strong></p>
                  <p>ID: {achievementDetail.id}</p>
                  <p>Create at: {new Date(achievementDetail.create_at).toLocaleString()}</p>
                </div>

                <h4>Rewards</h4>
                <div className="rewards-grid">
                  {achievementDetail.dtos.map((reward, idx) => (
                    <div key={idx} className="reward-card">
                      {reward.url_image && (
                        <img
                          src={buildImageUrl(reward.url_image, useBackupImg)}
                          alt="Medal"
                          onError={() => setUseBackupImg(true)}
                        />
                      )}
                      <p><strong>Conditions:</strong> {reward.conditions}</p>
                      <p><strong>Quantity box reward:</strong> {reward.quantity_box}</p>
                    </div>
                  ))}
                </div>

                <div className="add-reward-section">
                  <h4>Add Reward</h4>
                  <input type="number" placeholder="Conditions" value={conditions} onChange={(e) => setConditions(e.target.value)} />
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                  <input type="number" placeholder="Quantity Box" value={quantityBox} onChange={(e) => setQuantityBox(e.target.value)} />
                  <button onClick={handleAddReward}>Add Reward</button>
                </div>
              </div>
            ) : (
              <div>
                <p>Don't have any Achievement</p>
                <button onClick={handleCreateAchievement}>
                  Create Achievement
                </button>
              </div>
            )}

            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
