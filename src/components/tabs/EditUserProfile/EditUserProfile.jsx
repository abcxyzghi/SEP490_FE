import React, { useState, useEffect, useMemo } from "react";
import "./EditUserProfile.css";
import { useSelector } from "react-redux";
import {
  updateProfile,
  getProfile,
  ChangePassword,
  getBankID,
} from "../../../services/api.user";
import { buildImageUrl } from "../../../services/api.imageproxy";
import { Pathname, PATH_NAME } from "../../../router/Pathname";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout, updateProfileImage } from "../../../redux/features/authSlice";
import { clearCart } from "../../../redux/features/cartSlice";
import { Input, Select } from "antd";
import { IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import MessageModal from '../../libs/MessageModal/MessageModal';
import ConfirmModal from '../../libs/ConfirmModal/ConfirmModal';
// import assets
import ChangeProfileIcon from "../../../assets/Icon_line/refresh-square-2.svg";
import ProfileHolder from "../../../assets/others/mmbAvatar.png";

const { Option } = Select;

export default function EditUserProfile() {
  const [useBackupImg, setUseBackupImg] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();

  const [modal, setModal] = useState({ open: false, type: 'default', title: '', message: '' });
  const showModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const showConfirmModal = (title, message, onConfirm = null) => {
    setConfirmModal({ open: true, title, message, onConfirm });
  };
  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, open: false }));
  };


  // State cho form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [pwLoading, setPwLoading] = useState(false);

  // Xử lý đổi mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const [loading, setLoading] = useState(false);
  const reduxUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [user, setUser] = useState(reduxUser || {});
  const [form, setForm] = useState({
    username: '',
    email: '',
    profileImage: null,
    phoneNumber: "",
    accountBankName: "",
    bankNumber: "",
    bankid: "",
  });

  const [loadingProfileFetching, setLoadingProfileFetching] = useState(true);

  // Lấy profile mới nhất khi vào trang và sau khi cập nhật
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoadingProfileFetching(true); // Start loader

        const bankRes = await getBankID();
        setBankList(bankRes.data);

        const profileRes = await getProfile();
        if (profileRes?.data) {
          setUser(profileRes.data);
          setForm((f) => ({
            ...f,         
            username: profileRes.data.username || '',
            email: profileRes.data.email || '',
            phoneNumber: profileRes.data.phoneNumber || '',
            accountBankName: profileRes.data.accountBankName || '',
            bankNumber: profileRes.data.banknumber || '',
            bankid: profileRes.data.bankId || ''
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setUser(reduxUser || {});
      } finally {
        setLoadingProfileFetching(false); // Stop loader
      }
    };

    fetchAll();
  }, []);

  const selectBankValue = useMemo(() => {
    const bank = bankList.find((b) => String(b.id) === String(form.bankid));

    return bank
      ? {
        value: bank.id,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src={bank.logo}
              alt={bank.name}
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
            />
            <span>{bank.short_name}-{bank.name}</span>
          </div>
        ),
      }
      : undefined;
  }, [bankList, form.bankid]);


  // Validate only (returns true if valid, shows modal on error)
  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showModal('warning', 'Missing information', 'Please fill in all required fields.');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showModal('warning', 'Password mismatch', 'New password and confirmation do not match.');
      return false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,15}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      showModal(
        'warning',
        'Insecure password',
        'Password must be 8-15 characters, include uppercase, lowercase, number, and special character.'
      );
      return false;
    }
    return true;
  };

  // The API call (performs change). No event handling here.
  const performPasswordChange = async () => {
    setPwLoading(true);
    try {
      const res = await ChangePassword({
        curentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      if (res?.status) {
        // success -> directly logout / redirect
        handleLogout();
      } else {
        showModal('error', 'Failed', res?.message || 'Password change failed!');
      }
    } catch (err) {
      console.error(err);
      showModal('error', 'Failed', 'Password change failed!');
    }
    setPwLoading(false);
  };

  // Form submit: validate first, then show confirm modal which will call performPasswordChange
  const confirmThenSubmit = (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return; // stop here if invalid

    showConfirmModal(
      'Change Confirm',
      'You will be redirected to the login page for this action to proceed.',
      async () => {
        // onConfirm -> call the actual API action
        await performPasswordChange();
      }
    );
  };


  // Handle submit new Profile Image
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files && files[0]) {
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

    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch (e) {
        // Ignore cache errors
      }
    }

    // Navigate to login page (soft)
    navigate(PATH_NAME.LOGIN, { replace: true });
  };

  async function fetchProfile() {
    try {
      const res = await getProfile();
      if (res?.data) {
        console.log(res?.data);
        setUser(res.data);
        setForm((f) => ({
          ...f,
          phoneNumber: res.data.phoneNumber || "",
          accountBankName: res.data.accountBankName || "",
          bankNumber: res.data.banknumber || "",
          bankid: res.data.bankId || "",
        }));
      }
    } catch {
      setUser(reduxUser || {});
    }
  }

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await getBankID();

        setBankList(response.data);
      } catch (error) {
        console.error("Lỗi khi fetch bank list:", error);
      }
    };
    fetchBanks();
  }, []);
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);


  // Handle submit update profile info
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate không cho phép rỗng tên tài khoản ngân hàng và số tài khoản nếu đã chọn bankid
    if (form.bankid) {
      if (!form.accountBankName.trim()) {
        showModal('warning', 'Missing information', 'Please enter bank account holder name.');
        return;
      }
      // Validate accountBankName: only letters and max 50 chars
      const nameValue = form.accountBankName.trim();
      if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(nameValue)) {
        showModal('warning', 'Invalid name', 'Account holder name can only contain letters.');
        return;
      }
      if (nameValue.length > 50) {
        showModal('warning', 'Name too long', 'Account holder name must not exceed 50 characters.');
        return;
      }
      if (!form.bankNumber.trim()) {
        showModal('warning', 'Missing information', 'Please enter bank account number.');
        return;
      }
      // Validate bankNumber: only digits and max 22 digits
      const bankNumValue = form.bankNumber.trim();
      if (!/^\d+$/.test(bankNumValue)) {
        showModal('warning', 'Invalid account number', 'Bank account number must contain only digits.');
        return;
      }
      if (bankNumValue.length > 22) {
        showModal('warning', 'Account number too long', 'Bank account number must not exceed 22 digits.');
        return;
      }
    }

    // Phone number validation (only if there's something in the input)
    if (form.phoneNumber.trim() && !/^0\d{9}$/.test(form.phoneNumber.trim())) {
       showModal('warning', 'Invalid phone number', 'Phone number must start with 0 and contain exactly 10 digits.');
       return;
    }

    showConfirmModal(
      "Important Notice",
      "The bank account information you provide will be used by the Admin to transfer money to you in the future.\n\n" +
      "Ensure your bank details are correct. Admin not liable for errors.\n" +
      "Are you sure you want to update?",
      async () => {
        setLoading(true);
        try {
          const formData = new FormData();
          if (form.profileImage) formData.append('urlImage', form.profileImage);
          formData.append('phoneNumber', form.phoneNumber);
          formData.append('accountBankName', form.accountBankName);
          formData.append('bankNumber', form.bankNumber);
          formData.append('bankid', form.bankid);

          const res = await updateProfile(formData, true);

          if (res.data?.profileImage) {
            dispatch(updateProfileImage(res.data.profileImage));
          }
          showModal(
            res.status ? 'default' : 'error',
            res.status ? 'Success' : 'Failed',
            res.status ? 'Profile updated successfully!' : 'Profile update failed!'
          );
          if (res.status) {
            await fetchProfile();
          }
        } catch (err) {
          showModal('error', 'Error', 'An error occurred!');
        }
        setLoading(false);
      }
    );
  };

  // Daisy skeleton while fetching user data profile
  if (loadingProfileFetching) {
    return (
      <div className="editUserProfile-container flex flex-col items-center justify-center gap-8">
        {/* Title Skeleton */}
        <h2 className="editUserProfile-title">
          <div className="skeleton h-6 w-72 mb-4 bg-gray-700/40"></div>
        </h2>

        {/* Avatar + Info Skeleton */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* LEFT: Avatar Skeleton */}
          <div className="flex flex-col items-center gap-4">
            <div className="skeleton w-50 h-50 rounded bg-gray-700/40"></div>
            <div className="skeleton h-8 w-32 rounded bg-gray-700/40 mb-4"></div>
          </div>

          {/* RIGHT: Info Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="skeleton h-10 w-64 md:w-96 lg:w-[40rem] rounded bg-gray-700/40"></div>
            <div className="skeleton h-10 w-64 md:w-96 lg:w-[40rem] rounded bg-gray-700/40"></div>
            <div className="skeleton h-10 w-64 md:w-96 lg:w-[40rem] rounded bg-gray-700/40"></div>
            <div className="skeleton h-10 w-64 md:w-96 lg:w-[40rem] rounded bg-gray-700/40"></div>
            <div className="skeleton h-10 w-64 md:w-96 lg:w-[40rem] rounded bg-gray-700/40"></div>
          </div>
        </div>

        {/* Save Button Skeleton */}
        <div className="skeleton h-10 w-40 rounded bg-gray-700/40"></div>

        {/* Password Section Skeleton */}
        <div className="editUserProfile-password-section flex flex-col items-center gap-4 mt-8">
          <div className="skeleton h-6 w-64 mb-4 bg-gray-700/40"></div>
          <div className="skeleton h-10 w-60 md:w-80 lg:w-90 rounded bg-gray-700/40"></div>
          <div className="skeleton h-10 w-60 md:w-80 lg:w-90 rounded bg-gray-700/40"></div>
          <div className="skeleton h-10 w-60 md:w-80 lg:w-90 rounded bg-gray-700/40"></div>
          <div className="skeleton h-10 w-40 rounded mt-4 bg-gray-700/40"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="editUserProfile-container">
      <h2 className="editUserProfile-title oleo-script-bold">Update Personal Information</h2>

      {/* Form: Profile + Phone + Bank */}
      <form
        onSubmit={handleSubmit}
        className="editUserProfile-form"
        encType="multipart/form-data"
      >
        {/* LEFT: Avatar */}
        <div className="editUserProfile-avatar-section">
          <img
            src={
              form.profileImage
                ? URL.createObjectURL(form.profileImage)
                : user?.profileImage
                  ? buildImageUrl(user.profileImage, useBackupImg)
                  : ProfileHolder
            }
            onError={() => setUseBackupImg(true)}
            alt="Profile Preview"
            className="editUserProfile-avatar"
          />
          <label className="editUserProfile-change-profile-btn oxanium-regular">
            <img src={ChangeProfileIcon} alt="Change" className="editUserProfile-change-profile-icon" />
            <span>Change Avatar</span>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>

        {/* RIGHT: Contact + Bank */}
        <div className="editUserProfile-info-section">
          <div className="editUserProfile-field">
            <label>Username (Cannot be updated):</label>
            <input
              name="username"
              className='cursor-not-allowed'
              value={form.username}
              readOnly
              disabled
            />
          </div>

          <div className="editUserProfile-field">
            <label>Email (Cannot be updated):</label>
            <input
              name="email"
              className='cursor-not-allowed'
              value={form.email}
              readOnly
              disabled
            />
          </div>
          <div className="editUserProfile-field">
            <label>Phone Number:</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className='oxanium-semibold text-[0.9rem]'>Bank account:</label>
            <Select
              className="editUserProfile-select"
              placeholder="Select bank"
              optionFilterProp="children"
              onChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  bankid: value.value,
                }));
              }}
              style={{ width: "100%", marginTop: "3px" }}
              labelInValue
              value={selectBankValue}
            >
              {bankList.map((bank) => (
                <Option key={bank.id} value={bank.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      width={40}
                      height={40}
                      style={{ objectFit: "contain" }}
                    />
                    <span>
                      {bank.short_name} - {bank.name}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>

            {form.bankid && (
              <>
                <Input
                  className="editUserProfile-input oxanium-regular"
                  placeholder="Account holder name"
                  value={form.accountBankName}
                  maxLength={50}
                  onChange={(e) => {
                    // Only allow letters and spaces, max 50 chars
                    let cleanValue = e.target.value.replace(/[^a-zA-ZÀ-ỹ\s]/g, "");
                    if (cleanValue.length > 50) cleanValue = cleanValue.slice(0, 50);
                    setForm((prev) => ({
                      ...prev,
                      accountBankName: cleanValue,
                    }));
                  }}
                  style={{ marginTop: 20 }}
                />

                <Input
                  className="editUserProfile-input oxanium-regular"
                  placeholder="Account number"
                  value={form.bankNumber}
                  maxLength={22}
                  onChange={(e) => {
                    // Only allow digits, max 22 digits
                    let numericValue = e.target.value.replace(/\D/g, "");
                    if (numericValue.length > 22) numericValue = numericValue.slice(0, 22);
                    setForm((prev) => ({ ...prev, bankNumber: numericValue }));
                  }}
                  style={{ marginTop: 10 }}
                />
              </>
            )}

          </div>
        </div>

        {/* Save button */}
        <div className="editUserProfile-btn-container oxanium-semibold">
          <button type="submit" disabled={loading}>
            {loading ? <span className="loading loading-bars loading-md"></span> : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Password section */}
      <div className="editUserProfile-password-section">
        <h2 className="editUserProfile-title oleo-script-bold">Change Password</h2>
        <form
          onSubmit={confirmThenSubmit}
          className="editUserProfile-password-form"
        >
          <div className="editUserProfile-field">
            <label>Current Password:</label>
            <input
              type={showCurrentPass ? 'text' : 'password'}
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
            />
            <IconButton className="editUserProfile-toggle-icon" sx={{ color: 'var(--light-2)' }} onClick={() => setShowCurrentPass(!showCurrentPass)} size="small">
              {showCurrentPass ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </div>
          <div className="editUserProfile-field">
            <label>New Password:</label>
            <input
              type={showNewPass ? 'text' : 'password'}
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
            />
            <IconButton className="editUserProfile-toggle-icon" sx={{ color: 'var(--light-2)' }} onClick={() => setShowNewPass(!showNewPass)} size="small">
              {showNewPass ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </div>
          <div className="editUserProfile-field">
            <label>Confirm New Password:</label>
            <input
              type={showConfirmPass ? 'text' : 'password'}
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
            <IconButton className="editUserProfile-toggle-icon" sx={{ color: 'var(--light-2)' }} onClick={() => setShowConfirmPass(!showConfirmPass)} size="small">
              {showConfirmPass ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </div>
          <div className="editUserProfile-btn-container oxanium-semibold !mt-10">
            <button type="submit" disabled={pwLoading}>
              {pwLoading ? <span className="loading loading-bars loading-md"></span> : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Message Modal */}
      <MessageModal
        open={modal.open}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        onClose={closeConfirmModal}
        onConfirm={() => {
          if (confirmModal.onConfirm) confirmModal.onConfirm();
          closeConfirmModal();
        }}
        title={confirmModal.title}
        message={confirmModal.message}
      />

    </div>
  );
}

