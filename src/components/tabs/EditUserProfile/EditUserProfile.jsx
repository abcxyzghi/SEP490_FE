import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { updateProfile, getProfile, ChangePassword } from '../../../services/api.user';
import { Pathname, PATH_NAME } from "../../../router/Pathname";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout, updateProfileImage } from '../../../redux/features/authSlice';
import { clearCart } from '../../../redux/features/cartSlice';
export default function EditUserProfile() {
  const navigate = useNavigate();
  // State cho form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwMessage, setPwMessage] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  // Xử lý đổi mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMessage('');
    setPwLoading(true);
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPwMessage('Vui lòng nhập đầy đủ thông tin.');
      setPwLoading(false);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwMessage('Mật khẩu mới và xác nhận không khớp.');
      setPwLoading(false);
      return;
    }
    try {
      const res = await ChangePassword({
        curentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
      if (res?.status) {
        setPwMessage('Đổi mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...');

        handleLogout();
      } else {

        setPwMessage(res?.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      setPwMessage('Đổi mật khẩu thất bại!');
    }
    setPwLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage' && files && files[0]) {
      setForm({ ...form, profileImage: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const handleLogout = async () => {

    dispatch(logout());
    dispatch(clearCart());

    localStorage.clear();
    sessionStorage.clear();


    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch (e) {
        // Ignore cache errors
      }
    }

    // Navigate to login page (soft)
    navigate(PATH_NAME.LOGIN, { replace: true });
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

      <div style={{ marginTop: 40 }}>
        <h2>Đổi mật khẩu:</h2>
        <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 400 }}>
          <div>
            <label>Mật khẩu hiện tại:</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div>
            <label>Mật khẩu mới:</label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div>
            <label>Xác nhận mật khẩu mới:</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Xác nhận mật khẩu mới"
            />
          </div>
          <button type="submit" disabled={pwLoading}>{pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}</button>
        </form>
        {pwMessage && <div style={{ marginTop: 10 }}>{pwMessage}</div>}
      </div>
    </div>
  );
}
