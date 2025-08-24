import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, getProfile, ChangePassword } from '../../../services/api.user';
import { PATH_NAME } from "../../../router/Pathname";
import { useNavigate } from 'react-router-dom';
import { logout, updateProfileImage } from '../../../redux/features/authSlice';
import { clearCart } from '../../../redux/features/cartSlice';
import ProfileIcon from '../../../assets/others/mmbAvatar.png'; // Thêm import cho ảnh mặc định

// Import CSS
import "./ModProfile.css";

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
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwMessage, setPwMessage] = useState('');
  const [pwMessageType, setPwMessageType] = useState(''); // 'success' or 'error'
  const [pwLoading, setPwLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await getProfile();
      if (res?.data) {
        setUser(res.data);
        setForm(f => ({ ...f, phoneNumber: res.data.phoneNumber || '' }));
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
      setPwMessage('Please fill in all fields.');
      setPwMessageType('error');
      setPwLoading(false);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwMessage('New password and confirmation do not match.');
      setPwMessageType('error');
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
        setPwMessage('Password changed successfully! Redirecting...');
        setPwMessageType('success');
        setTimeout(handleLogout, 2000);
      } else {
        setPwMessage(res?.message || 'Failed to change password!');
        setPwMessageType('error');
      }
    } catch {
      setPwMessage('Failed to change password!');
      setPwMessageType('error');
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
      } catch { }
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
      if (res.status) {
        setMessage('Profile updated successfully!');
        setMessageType('success');
        await fetchProfile();
      } else {
        setMessage('Profile update failed!');
        setMessageType('error');
      }
    } catch {
      setMessage('An error occurred!');
      setMessageType('error');
    }
    setLoading(false);
  };

  const currentAvatar = user?.profileImage ? `https://mmb-be-dotnet.onrender.com/api/ImageProxy/${user.profileImage}` : ProfileIcon;

  return (
    <div className="profile-page">
      {/* --- Profile Header --- */}
      <div className="profile-header">
        <div className="profile-header__banner"></div>
        <div className="profile-header__main">
          <div className="profile-header__avatar">
            <img src={currentAvatar} alt="Avatar" />
          </div>
          <div className="profile-header__info">
            <h1>{user?.username || 'Username'}</h1>
            <p>{user?.email || 'email@example.com'}</p>
          </div>
        </div>
      </div>

      {/* --- Profile Content --- */}
      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`profile-tabs__button ${activeTab === 'profile' ? 'profile-tabs__button--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </button>
          <button
            className={`profile-tabs__button ${activeTab === 'password' ? 'profile-tabs__button--active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>

        <div className="profile-tab-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="profile-form">
              <h3 className="profile-form__title">Edit Information</h3>
              <div className="profile-form__group">
                <label className="profile-form__label">Profile Picture</label>
                {form.profileImage && <img src={URL.createObjectURL(form.profileImage)} alt="Preview" className="profile-form__avatar-preview" />}
                <input type="file" name="profileImage" accept="image/*" onChange={handleChange} className="profile-form__file-input" />
              </div>
              <div className="profile-form__group">
                <label className="profile-form__label">Phone Number</label>
                <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Enter your phone number" className="profile-form__input" />
              </div>
              <button type="submit" disabled={loading} className="profile-form__button">
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
              {message && <div className={`profile-form__message profile-form__message--${messageType}`}>{message}</div>}
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <h3 className="profile-form__title">Update Password</h3>
              <div className="profile-form__group">
                <label className="profile-form__label">Current Password</label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" className="profile-form__input" />
              </div>
              <div className="profile-form__group">
                <label className="profile-form__label">New Password</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} placeholder="Enter new password" className="profile-form__input" />
              </div>
              <div className="profile-form__group">
                <label className="profile-form__label">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" className="profile-form__input" />
              </div>
              <button type="submit" disabled={pwLoading} className="profile-form__button profile-form__button--secondary">
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
              {pwMessage && <div className={`profile-form__message profile-form__message--${pwMessageType}`}>{pwMessage}</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}