import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { updateProfile, getProfile } from '../../../services/api.user';
import { Pathname, PATH_NAME } from "../../../router/Pathname";
import { useDispatch } from 'react-redux';
import { updateProfileImage } from '../../../redux/features/authSlice';
export default function Settingpage() {
  const reduxUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [user, setUser] = useState(reduxUser || {});
  const [form, setForm] = useState({
    profileImage: null,
    phoneNumber: '',
    accountBankName: '',
    bankNumber: '',
    bankid: ''
  });
  // Lấy profile mới nhất khi vào trang và sau khi cập nhật
  async function fetchProfile() {
    try {
      const res = await getProfile();
      if (res?.data) {
        setUser(res.data);
        setForm(f => ({
          ...f,
          phoneNumber: res.data.phoneNumber || '',
          accountBankName: res.data.accountBankName || '',
          bankNumber: res.data.banknumber || '',
          bankid: res.data.bankId || ''
        }));
      }
    } catch {
      setUser(reduxUser || {});
    }
  }

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);


  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage' && files && files[0]) {
      setForm({ ...form, profileImage: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      if (form.profileImage) formData.append('urlImage', form.profileImage);
      formData.append('phoneNumber', form.phoneNumber);
      formData.append('accountBankName', form.accountBankName);
      formData.append('bankNumber', form.bankNumber);
      formData.append('bankid', form.bankid);

      const res = await updateProfile(formData, true);

      if (res.data?.data?.profileImage) {
        dispatch(updateProfileImage(res.data.data.profileImage));
      }
      setMessage(res.status === 200 || res.status === 204 ? 'Cập nhật thành công!' : 'Cập nhật thất bại!');
      if (res.status === 200 || res.status === 204) {
        await fetchProfile(); // Load lại thông tin mới nhất
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('Có lỗi xảy ra!');
    }

    setLoading(false);
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Cập nhật thông tin cá nhân</h2>
      {/* Form cập nhật thông tin cá nhân */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }} encType="multipart/form-data">
        <div>
          <label>Ảnh đại diện:</label>
          <br />
          {form.profileImage ? (
            <img
              src={URL.createObjectURL(form.profileImage)}
              alt="Preview"
              style={{ width: 120, height: 120, objectFit: 'cover', marginBottom: 10, borderRadius: 10 }}
            />
          ) : user?.profileImage ? (
            <img
              src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${user.profileImage}`}
              alt="Current avatar"
              style={{ width: 120, height: 120, objectFit: 'cover', marginBottom: 10, borderRadius: 10 }}
            />
          ) : null}
          <input type="file" name="profileImage" accept="image/*" onChange={handleChange} />
        </div>
        <div>
          <label>Số điện thoại:</label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />
        </div>
        <div>
          <label>Tên ngân hàng:</label>
          <input
            name="accountBankName"
            value={form.accountBankName}
            onChange={handleChange}
            placeholder="Nhập tên ngân hàng"
          />
        </div>
        <div>
          <label>Số tài khoản:</label>
          <input
            name="bankNumber"
            value={form.bankNumber}
            onChange={handleChange}
            placeholder="Nhập số tài khoản"
          />
        </div>
        <div>
          <label>Bank ID:</label>
          <input
            name="bankid"
            value={form.bankid}
            onChange={handleChange}
            placeholder="Nhập Bank ID"
          />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Đang cập nhật...' : 'Cập nhật'}</button>
      </form>
      {message && <div style={{ marginTop: 10 }}>{message}</div>}
    </div>
  );
}
