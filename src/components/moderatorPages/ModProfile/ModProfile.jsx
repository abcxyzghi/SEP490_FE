import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, getProfile, ChangePassword } from '../../../services/api.user';
import { PATH_NAME } from "../../../router/Pathname";
import { useNavigate } from 'react-router-dom';
import { logout, updateProfileImage } from '../../../redux/features/authSlice';
import { clearCart } from '../../../redux/features/cartSlice';

export default function EditUserProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);

  const [user, setUser] = useState(reduxUser || {});
  const [form, setForm] = useState({
    profileImage: null,
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwMessage, setPwMessage] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await getProfile();
      if (res?.data) {
        setUser(res.data);
        setForm(f => ({
          ...f,
          phoneNumber: res.data.phoneNumber || '',
        }));
      }
    } catch {
      setUser(reduxUser || {});
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage' && files && files[0]) {
      setForm({ ...form, profileImage: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

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
        setPwMessage('Đổi mật khẩu thành công! Đang chuyển hướng...');
        handleLogout();
      } else {
        setPwMessage(res?.message || 'Đổi mật khẩu thất bại!');
      }
    } catch {
      setPwMessage('Đổi mật khẩu thất bại!');
    }
    setPwLoading(false);
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
      } catch {}
    }
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
      formData.append('accountBankName', '');
      formData.append('bankNumber', '');
      formData.append('bankid', '');

      const res = await updateProfile(formData, true);
      if (res.data?.profileImage) {
        dispatch(updateProfileImage(res.data.profileImage));
      }
      setMessage(res.status ? '✅ Cập nhật thành công!' : '❌ Cập nhật thất bại!');
      if (res.status) {
        await fetchProfile();
      }
    } catch {
      setMessage('Có lỗi xảy ra!');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-8">
      <div className="max-w-xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">📝 Cập nhật thông tin cá nhân</h2>

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block mb-1 font-medium">Ảnh đại diện</label>
            {form.profileImage ? (
              <img src={URL.createObjectURL(form.profileImage)} alt="Preview"
                className="w-28 h-28 object-cover rounded-xl mb-3 border border-gray-700" />
            ) : user?.profileImage ? (
              <img src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${user.profileImage}`} alt="Current avatar"
                className="w-28 h-28 object-cover rounded-xl mb-3 border border-gray-700" />
            ) : null}
            <input type="file" name="profileImage" accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0 file:text-sm file:font-semibold
                         file:bg-blue-600 file:text-white hover:file:bg-blue-500"/>
          </div>

          <div>
            <label className="block mb-1 font-medium">Số điện thoại</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-semibold">
            {loading ? '⏳ Đang cập nhật...' : '💾 Cập nhật'}
          </button>
        </form>

        {message && <div className="mt-3 text-center">{message}</div>}

        {/* Change password */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">🔒 Đổi mật khẩu</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Mật khẩu hiện tại</label>
              <input type="password" name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
            <div>
              <label className="block mb-1 font-medium">Mật khẩu mới</label>
              <input type="password" name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Nhập mật khẩu mới"
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
            <div>
              <label className="block mb-1 font-medium">Xác nhận mật khẩu mới</label>
              <input type="password" name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Xác nhận mật khẩu mới"
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>

            <button type="submit" disabled={pwLoading}
              className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 transition font-semibold">
              {pwLoading ? '⏳ Đang đổi...' : '🔑 Đổi mật khẩu'}
            </button>
          </form>
          {pwMessage && <div className="mt-3 text-center">{pwMessage}</div>}
        </div>
      </div>
    </div>
  );
}
