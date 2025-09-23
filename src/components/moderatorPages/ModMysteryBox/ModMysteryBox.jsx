import React, { useEffect, useState } from 'react';
import { getAllMysteryBoxes, getMysteryBoxDetail, createNewMysteryBox, addProductForBox } from '../../../services/api.mysterybox';
import { getAllCollection } from '../../../services/api.collection';
import { buildImageUrl } from '../../../services/api.imageproxy';
import { Modal, Upload, Button, Select, DatePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from "dayjs";
import './ModMysteryBox.css';
import { getAllProduct } from '../../../services/api.product';


export default function ModMysteryBox() {
  const [boxBackupImg, setBoxBackupImg] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const [rarityRatios, setRarityRatios] = useState({
    common: 0.6,
    uncommon: 0.2,
    rare: 0.12,
    epic: 0.06,
    legendary: 0.02,
  });

  const [newBoxData, setNewBoxData] = useState({
    name: '',
    title: '',
    description: '',
    price: '',
    totalProduct: '',
    quantity: '',
    start_time: '',
    end_time: '',
    collectionTopicId: '',
    imageUrl: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [collections, setCollections] = useState([]);
  const [productList, setProductList] = useState([]);
  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState(null);

  const fetchBoxes = async () => {
    setLoading(true);
    const res = await getAllMysteryBoxes();
    if (res && res.status && Array.isArray(res.data)) {
      setBoxes(res.data);
    } else {
      setBoxes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBoxes();
  }, []);
  
  const handleViewDetail = async (id) => {
    try {
      console.log('Fetching details for Box ID:', id); // Debug log
      const response = await getMysteryBoxDetail(id);
      if (response && response.status) {
        console.log('Fetched detail:', response.data); // Debug log
        setSelectedBox(response.data);
        console.log('Updated selectedBox state:', response.data); // Debug log
        setIsModalVisible(true);
      } else {
        console.error('Failed to fetch box details:', response);
      }
    } catch (error) {
      console.error('Error fetching box details:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBox(null);
  };

  const handleCreateNewBox = async () => {
    try {
      // Validate required fields
      const { name, title, description, price, totalProduct, collectionTopicId, imageUrl } = newBoxData;

      if (!name?.trim()) {
        toast.error('Name is required.');
        return;
      }
      if (!title?.trim()) {
        toast.error('Title is required.');
        return;
      }
      if (!description?.trim()) {
        toast.error('Description is required.');
        return;
      }
      if (!collectionTopicId?.trim()) {
        toast.error('CollectionTopicId is required.');
        return;
      }
      if (!price || isNaN(price) || price <= 0) {
        toast.error('Price must be a positive number.');
        return;
      }
      if (!totalProduct || isNaN(totalProduct) || totalProduct <= 0) {
        toast.error('TotalProduct must be a positive integer.');
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append('Name', name.trim());
      formData.append('Title', title.trim());
      formData.append('Description', description.trim());
      formData.append('Price', parseFloat(price));
      formData.append('TotalProduct', parseInt(totalProduct, 10));
      formData.append('CollectionTopicId', collectionTopicId.trim());

      if (imageUrl instanceof File) {
        formData.append('ImageUrl', imageUrl);
      } else if (imageUrl) {
        toast.error('Invalid image file. Please upload a valid file.');
        return;
      }

      // Debugging: Log FormData content
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Call API
      const response = await createNewMysteryBox(formData);

      // Log API response after initialization
      console.log('API Response:', response);

      if (response && response.status) {
        toast.success('New mystery box created successfully!');
        setIsCreateModalVisible(false);
        setNewBoxData({
          name: '',
          title: '',
          description: '',
          price: '',
          totalProduct: '',
          collectionTopicId: '',
          imageUrl: null,
        });
        setImagePreview(null);
        fetchBoxes(); // Refresh the list of boxes
      } else {
        toast.error('Failed to create new mystery box.');
      }
    } catch (error) {
      console.error('Error creating new mystery box:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewBoxData({ ...newBoxData, imageUrl: file });
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload behavior
  };

  useEffect(() => {
    if (isCreateModalVisible) {
      const fetchCollections = async () => {
        try {
          const response = await getAllCollection();
          if (response && response.status && Array.isArray(response.data)) {
            setCollections(response.data);
          } else {
            setCollections([]);
          }
        } catch (error) {
          console.error('Error fetching collections:', error);
          toast.error('Failed to fetch collections. Please check your authentication.');
        }
      };
      fetchCollections();
    }
  }, [isCreateModalVisible]);

  const handleAddProduct = async (boxId, productsWithChances) => {
    // Logic to add products with chances to the box
    const response = await addProductForBox(boxId, productsWithChances);
    console.log("Calling API with boxId:", boxId, "products:", productsWithChances);

    if (response && response.status) {
      toast.success('Products added successfully!');
      fetchBoxes(); // Refresh the list of boxes
    } else {
      toast.error('Failed to add products to the box.');
    }
  };

  const handleOpenAddProductModal = async (box) => {
    const collectionsResponse = await getAllCollection();
    if (collectionsResponse && collectionsResponse.status) {
      const collection = collectionsResponse.data.find(
        (col) => col.topic === box.collectionTopic
      );
      if (collection) {
        const productsResponse = await getAllProduct();
        if (productsResponse && productsResponse.status) {
          const filteredProducts = productsResponse.data.filter(
            (product) => product.collectionId === collection.id
                        && (product.status === 0 || product.status === 1 || product.status === 2 || product.status === 4)
          );
          setProductList(filteredProducts.map((product) => ({
          ...product,
          selected: false,
          chance: 0,
          productId: product.productId || product.id, // đảm bảo có productId
        })));

          setSelectedBoxId(box.id);
          console.log("Selected Box ID:", selectedBoxId);
          setIsAddProductModalVisible(true);
          console.log("Modal open state:", isAddProductModalVisible);
        }
      }
    }
  };
    useEffect(() => {
      console.log("📢 Modal open state (useEffect):", isAddProductModalVisible);
    }, [isAddProductModalVisible]);
  return (
    <div className="mod-mysterybox-container">
      <h2 className="mod-mysterybox-title">List Mystery Box</h2>
      <button
        className="mod-mysterybox-create-button"
        onClick={() => setIsCreateModalVisible(true)}
      >
        Create New Box
      </button>
      {loading ? (
        <div className="mod-mysterybox-loading">Loading...</div>
      ) : boxes.length === 0 ? (
        <div className="mod-mysterybox-empty">There is no mystery box.</div>
      ) : (
        <div className="mod-mysterybox-card-list">
          {boxes.map((box) => (
            <div className="mod-mysterybox-card" key={box.id}>
              <div className="mod-mysterybox-card-img-wrap">
                {(() => {
                  const imgUrl = buildImageUrl(box.urlImage, boxBackupImg);
                  return (
                    <img
                      className="mod-mysterybox-card-img"
                      src={imgUrl}
                      onError={() => setBoxBackupImg(true)}
                      alt={box.mysteryBoxName}
                    />
                  );
                })()}
              </div>
              <div className="mod-mysterybox-card-content">
                <div className="mod-mysterybox-card-name" title={box.mysteryBoxName}>{box.mysteryBoxName}</div>
                <div className="mod-mysterybox-card-desc">{box.collectionTopic}</div>
                <div className="mod-mysterybox-card-info">
                  <span className="mod-mysterybox-card-label">Price:</span> <span className="mod-mysterybox-card-value">{box.mysteryBoxPrice?.toLocaleString() || 'N/A'} VNĐ</span>
                </div>
                <div className="mod-mysterybox-card-info">
                  <span className="mod-mysterybox-card-label">Quantity:</span> <span className="mod-mysterybox-card-value">{box.quantity || 'N/A'} Boxes</span>
                </div>
                <div className="mod-mysterybox-card-info">
                  <span className="mod-mysterybox-card-label">Created:</span> <span className="mod-mysterybox-card-value">{box.createdAt ? new Date(box.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="mod-mysterybox-card-info">
                  <span className="mod-mysterybox-card-label">Start time:</span> <span className="mod-mysterybox-card-value">{box.start_time ? new Date(box.start_time).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="mod-mysterybox-card-info">
                  <span className="mod-mysterybox-card-label">End time:</span> <span className="mod-mysterybox-card-value">{box.end_time ? new Date(box.end_time).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <div className="mod-mysterybox-card-actions">
                <button
                  className="mod-mysterybox-view-detail"
                  onClick={() => handleViewDetail(box.id)}
                >
                  View Detail
                </button>
      
                <button
                  className="mod-mysterybox-add-product"
                  onClick={() =>{
                    setSelectedBoxId(box.id); 
                    handleOpenAddProductModal(box)
                  }}
                >
                  Add Product
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={selectedBox?.mysteryBoxName || 'Loading...'}
        open={isModalVisible}
        onCancel={handleCloseModal}
        className='mod-mysterybox-detail-modal'
        footer={null}
      >
        {console.log('Selected box in Modal:', selectedBox)} {/* Debug log */}
        {selectedBox ? (
          <div className="mod-mysterybox-detail-container">
            {(() => {
              const imgUrl = buildImageUrl(selectedBox.urlImage, boxBackupImg);
              return (
                <img
                  className="mod-mysterybox-detail-image"
                  src={imgUrl}
                  onError={() => setBoxBackupImg(true)}
                  alt={selectedBox.mysteryBoxName}
                />
              );
            })()}
            <p className="mod-mysterybox-detail-description">{selectedBox.mysteryBoxDescription}</p>
            <p className="mod-mysterybox-detail-price">Price: {selectedBox.mysteryBoxPrice} VNĐ</p>
            <p className="mod-mysterybox-detail-created">Start time: {new Date(selectedBox.start_time).toLocaleDateString()}</p>
            <p className="mod-mysterybox-detail-created">End time: {new Date(selectedBox.end_time).toLocaleDateString()}</p>

            <h3 className="mod-mysterybox-detail-products-title">Products:</h3>
            <div className="mod-mysterybox-detail-products">
              {selectedBox.products.map((product) => {
                const productImgUrl = buildImageUrl(product.urlImage, boxBackupImg);
                return (
                  <div key={product.productId} className={`mod-mysterybox-product rarity-${product.rarityName}`}>
                    <img
                      className="mod-mysterybox-product-image"
                      src={productImgUrl}
                      onError={() => setBoxBackupImg(true)}
                      alt={product.productName}
                    />
                    <div className="mod-mysterybox-product-info">
                      <p className="mod-mysterybox-product-name">{product.productName}</p>
                      <p className="mod-mysterybox-product-chance">Chance: {(product.chance).toFixed(2)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p>Loading box details...</p>
        )}
      </Modal>

      <Modal
        title="Create New Box"
        className='mod-mysterybox-create-modal'
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={handleCreateNewBox}
      >
        <div className="mod-mysterybox-create-form">
          <input
            type="text"
            placeholder="Name"
            value={newBoxData.name}
            onChange={(e) => setNewBoxData({ ...newBoxData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Title"
            value={newBoxData.title}
            onChange={(e) => setNewBoxData({ ...newBoxData, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={newBoxData.description}
            onChange={(e) => setNewBoxData({ ...newBoxData, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={newBoxData.price}
            onChange={(e) => setNewBoxData({ ...newBoxData, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Total Product"
            value={newBoxData.totalProduct}
            onChange={(e) => setNewBoxData({ ...newBoxData, totalProduct: e.target.value })}
          />
          <input
            type="number"
            placeholder='Quantity'
            value={newBoxData.quantity}
            onChange={(e) => setNewBoxData({ ...newBoxData, quantity: e.target.value })}
          />
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%", marginBottom: "16px" }}
            placeholder='Start Time'
            value={newBoxData.start_time ? dayjs(newBoxData.start_time) : null}
            onChange={(value) =>
              setNewBoxData({
                ...newBoxData,
                start_time: value ? value.toISOString() : null,
              })
            }
          />
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%", marginBottom: "16px" }}
            placeholder="End Time"
            value={newBoxData.end_time ? dayjs(newBoxData.end_time) : null}
            onChange={(value) =>
              setNewBoxData({
                ...newBoxData,
                end_time: value ? value.toISOString() : null,
              })
            }
          />
          <Select
            placeholder="Select Collection"
            style={{ width: '100%', marginBottom: '16px' }}
            onChange={(value) => setNewBoxData({ ...newBoxData, collectionTopicId: value })}
          >
            {collections.map((collection) => (
              <Select.Option key={collection.id} value={collection.id}>
                {collection.topic}
              </Select.Option>
            ))}
          </Select>
          <Upload
            accept="image/*"
            beforeUpload={handleImageUpload}
            maxCount={1}
            listType="picture-card"
          >
            <Button icon={<UploadOutlined />}>Choose Image</Button>
          </Upload>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}
        </div>
      </Modal>

      <Modal
          title="Add Products to Box"
          className="mod-mysterybox-create-modal"
          open={isAddProductModalVisible}
          onCancel={() => setIsAddProductModalVisible(false)}
          onOk={() => {
            console.log("onOk được gọi");
            console.log("📦 Selected Box ID:", selectedBoxId);
            console.log("📋 Product List:", productList);
            const selectedProducts = productList.filter(
              (product) => product.selected && !isNaN(product.chance) && product.chance > 0
            );
            console.log("✅ Selected Products:", selectedProducts);
            if (selectedProducts.length === 0) {
              toast.error('Vui lòng chọn ít nhất một sản phẩm và tỷ lệ.');
              return;
            }
            const productsWithChances = selectedProducts.map((product) => ({
              productId: product.productId,
              chance: product.chance,
            }));
            console.log("📦 Products with Chances:", productsWithChances);
            handleAddProduct(selectedBoxId, productsWithChances);
            setIsAddProductModalVisible(false);
          }}
        >
          {/* Nhập tỷ lệ rarity */}
          <div className="rarity-ratio-inputs">
            <p>Chance of rarity (Total = 1.0)</p>

            {Object.entries(rarityRatios).map(([rarity, value]) => (
              <div key={rarity} className={`rarity-row ${rarity.toLowerCase()}`}>
                <label>{rarity}:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={value}
                  onChange={(e) => {
                    const inputValue = Number(e.target.value.replace(',', '.')) || 0;
                    const lowercaseRarity = rarity.toLowerCase(); // 👈 đảm bảo key là lowercase

                    setRarityRatios(prev => ({
                      ...prev,
                      [lowercaseRarity]: inputValue,
                    }));
                  }}
                />
              </div>
            ))}

            <button
              className="apply-button"
              onClick={() => {
                const updatedList = [...productList];

                const selectedProducts = updatedList.filter(p => p.selected);

                const groupedByRarity = {};

                selectedProducts.forEach(p => {
                  const rarity = p.rarityName?.toLowerCase();
                  if (!rarity) return;

                  if (!groupedByRarity[rarity]) groupedByRarity[rarity] = [];
                  groupedByRarity[rarity].push(p);
                });

                Object.entries(groupedByRarity).forEach(([rarity, group]) => {
                  const ratio = rarityRatios[rarity]; // 🔍 giờ chắc chắn tồn tại
                  if (!ratio || group.length === 0) return;

                  const perItemChance = ratio;

                  group.forEach((p) => {
                    const target = updatedList.find(prod => prod.productId === p.productId);
                    if (target) target.chance = parseFloat(perItemChance.toFixed(4));
                  });
                });

                setProductList(updatedList);
              }}
            >
              Apply
            </button>

          </div>
          {/* Danh sách sản phẩm */}
          <div className="mod-mysterybox-add-product-list">
            {productList.map((product, index) => (
              <div key={product.productId || index} className="add-product-item">
                <input
                  type="checkbox"
                  checked={!!product.selected}
                  onChange={(e) => {
                    const updatedList = [...productList];
                    updatedList[index].selected = e.target.checked;

                    // Gán chance tự động theo rarity
                    const selectedProducts = updatedList.filter((p) => p.selected);
                    const groupedByRarity = selectedProducts.reduce((acc, p) => {
                      const rarity = p.rarityName?.toLowerCase();
                      if (!rarity) return acc;

                      if (!acc[rarity]) acc[rarity] = [];
                      acc[rarity].push(p);
                      return acc;
                    }, {});

                    Object.entries(groupedByRarity).forEach(([rarity, group]) => {
                      const ratio = rarityRatios[rarity] || 0;
                      const perItemChance = ratio;

                      group.forEach((p) => {
                        const target = updatedList.find(prod => prod.productId === p.productId);
                        if (target) target.chance = parseFloat(perItemChance.toFixed(4));
                      });
                    });

                    setProductList(updatedList);
                  }}

                />
                <img
                  src={buildImageUrl(product.urlImage, boxBackupImg)}
                  alt={product.name}
                  className="add-product-image"
                />
                <div className="add-product-info">
                  <p className="add-product-name">{product.name || product.productName}</p>
                  <input
                    type="number"
                    placeholder="Chance (0 - 1)"
                    onChange={(e) => {
                      const updatedList = [...productList];
                      updatedList[index].chance = parseFloat(e.target.value);
                      setProductList(updatedList);
                    }}
                    disabled={!product.selected}
                    value={product.chance ?? ''}
                  />
                  <p className="auto-chance">
                    Chance: {
                      product.selected
                        ? (() => {
                            const rarity = product.rarityName?.toLowerCase();
                            const count = productList.filter(p => p.selected && p.rarityName?.toLowerCase() === rarity).length;
                            const total = rarityRatios[rarity] ?? 0;
                            return count ? (total * 100).toFixed(2) + '%' : '0%';
                          })()
                        : '—'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Modal>
    </div>
  );
}
