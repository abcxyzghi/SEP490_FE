import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Upload } from "antd";
import { toast } from "react-toastify";
import { getAllProduct, createProduct } from '../../../services/api.product';
import { buildImageUrl } from '../../../services/api.imageproxy';
import { block_unblock_product } from '../../../services/api.product';
import { getAllCollection } from '../../../services/api.collection';
import './ModProduct.css';

export default function ModProduct() {
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loadingBlock, setLoadingBlock] = useState({}); // lưu trạng thái loading cho từng productId
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    const res = await getAllProduct();
    if (res && Array.isArray(res.data)) {
      res.data.reverse();
      setProducts(res.data);
    } else if (Array.isArray(res)) {
      setProducts(res);
    } else {
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Lấy danh sách collection cho popup create
    getAllCollection().then(res => {
      console.log('getAllCollection response:', res);
      if (res && Array.isArray(res.data)) setCollections(res.data);
      else if (Array.isArray(res)) setCollections(res);
      else if (res && Array.isArray(res.collections)) setCollections(res.collections);
      else setCollections([]);
    });
  }, []);

  const handleBlockToggle = async (productId) => {
    setLoadingBlock(prev => ({ ...prev, [productId]: true }));
    await block_unblock_product(productId);
    await fetchProducts();
    setLoadingBlock(prev => ({ ...prev, [productId]: false }));
  };

  const handleCreateProduct = async () => {
    try {
      setCreateLoading(true);
      const values = await form.validateFields();
      // Chuẩn bị formData cho API nhận [FromForm]
      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('RarityName', values.rarityName);
      formData.append('Description', values.description);
      formData.append('CollectionId', values.CollectionId);
      if (values.UrlImage && values.UrlImage.length > 0) {
        formData.append('UrlImage', values.UrlImage[0].originFileObj);
      }
      const res = await createProduct(formData); // API phải nhận FormData
      if (res) {
        setShowCreateModal(false);
        toast.success("Create successfully");
        form.resetFields();
        setTimeout(() => {
          fetchProducts();
        }, 3000);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const columns = [
    { title: 'Product ID', dataIndex: 'productId', key: 'productId', className: 'productid-cell' },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), className: 'name-cell' },
    {
      title: 'Image',
      dataIndex: 'urlImage',
      key: 'urlImage',
      render: url => {
        const imgUrl = buildImageUrl(url, useBackupImg);
        return <img src={imgUrl} onError={() => setUseBackupImg(true)} alt="product" style={{ width: 240 }} />
      }
    },
    { title: 'Description', dataIndex: 'description', key: 'description', className: 'description-cell' },
    {
      title: 'Rarity', dataIndex: 'rarityName', key: 'rarityName', sorter: (a, b) => a.rarityName.localeCompare(b.rarityName),
      filters: [
        { text: 'Common', value: 'common' },
        { text: 'Uncommon', value: 'uncommon' },
        { text: 'Rare', value: 'rare' },
        { text: 'Epic', value: 'epic' },
        { text: 'Legendary', value: 'legendary' },
      ],
      onFilter: (value, record) => record.rarityName?.toLowerCase() === value,
      render: rarity => {
        const r = rarity?.toLowerCase();
        let className = 'rarity-common';
        if (r === 'uncommon') className = 'rarity-uncommon';
        else if (r === 'rare') className = 'rarity-rare';
        else if (r === 'epic') className = 'rarity-epic';
        else if (r === 'legendary') className = 'rarity-legendary';
        // Viết hoa chữ cái đầu
        const rarityLabel = rarity ? rarity.charAt(0).toUpperCase() + rarity.slice(1) : '';
        return <span className={className}>{rarityLabel}</span>;
      }
    },
    {
      title: 'Blocked',
      dataIndex: 'is_Block',
      key: 'is_Block',
      render: (val, record) => {
        const isBlocked = !!val;
        return (
          <Button
            type="default"
            className={isBlocked ? 'mod-block-btn' : 'mod-unblock-btn'}
            loading={!!loadingBlock[record.productId]}
            onClick={() => handleBlockToggle(record.productId)}
          >
            {isBlocked ? 'Block' : 'Unblock'}
          </Button>
        );
      }
    },
  ];

  return (
    <div className='table-glow-wrapper'>
      <div className="mod-product-container">
        <Button type="default" className="mod-create-btn" style={{ marginBottom: 16 }} onClick={() => setShowCreateModal(true)}>
          Create New Product
        </Button>
        <Table
          dataSource={products}
          columns={columns}
          rowKey="productId"
        />
      </div>
      <Modal
        open={showCreateModal}
        title="Create New Product"
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields(); // clear form data khi cancel
        }}
        onOk={handleCreateProduct}
        confirmLoading={createLoading}
        okText="Confirm"
        cancelText="Cancel"
        className="mod-create-modal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Product's Name"
            rules={[{ required: true, message: 'Please enter product name' }]} // 
          >
            <Input.TextArea allowClear autoComplete="off" row={0} />
          </Form.Item>

          <Form.Item
            name="rarityName"
            label="Rarity"
            rules={[{ required: true, message: 'Please must choose a rarity' }]}
          >
            <Select
              allowClear
              autoFocus
              options={[
                { value: 'Common', label: 'Common' },
                { value: 'Uncommon', label: 'Uncommon' },
                { value: 'Rare', label: 'Rare' },
                { value: 'Epic', label: 'Epic' },
                { value: 'Legendary', label: 'Legendary' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter descriptiondescription' }]}
          >
            <Input.TextArea allowClear autoComplete="off" rows={3} />
          </Form.Item>

          <Form.Item name="CollectionId" label="Collection" rules={[{ required: true, message: 'Please must choose a collectioncollection' }]}>
            <Select allowClear options={collections.map(c => ({ value: c.id, label: c.topic }))} showSearch optionFilterProp="label" placeholder="Choose a collection" notFoundContent={collections.length === 0 ? 'There are no collections' : null} />
          </Form.Item>
          <Form.Item
            name="UrlImage"
            label="Product's Image"
            valuePropName="fileList" // <-- quan trọng!
            getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
            rules={[{ required: true, message: 'Choose Image' }]}
          >
            <Upload
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
              listType="picture-card"
            >
              <Button>Choose image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
