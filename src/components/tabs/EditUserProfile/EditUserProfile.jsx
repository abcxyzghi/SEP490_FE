import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { updateProfile, getProfile, ChangePassword, getBankID } from '../../../services/api.user';
import { Pathname, PATH_NAME } from "../../../router/Pathname";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout, updateProfileImage } from '../../../redux/features/authSlice';
import { clearCart } from '../../../redux/features/cartSlice';
import { Input, Select } from "antd";
const { Option } = Select;

export default function EditUserProfile() {
  const [bankList, setBankList] = useState([]);
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
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const bankRes = await getBankID();
        setBankList(bankRes.data);

        const profileRes = await getProfile();
        if (profileRes?.data) {
          setUser(profileRes.data);
          setForm(f => ({
            ...f,
            phoneNumber: profileRes.data.phoneNumber || '',
            accountBankName: profileRes.data.accountBankName || '',
            bankNumber: profileRes.data.banknumber || '',
            bankid: profileRes.data.bankId || ''
          }));
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
        setUser(reduxUser || {});
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
              width={20}
              height={20}
              style={{ objectFit: 'contain' }}
            />
            <span>{bank.short_name}-{bank.name}</span>
          </div>
        ),
      }
      : undefined;
  }, [bankList, form.bankid]);
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
  async function fetchProfile() {
    try {
      const res = await getProfile();
      if (res?.data) {
        console.log(res?.data)
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate không cho phép rỗng tên tài khoản ngân hàng và số tài khoản nếu đã chọn bankid
    if (form.bankid) {
      if (!form.accountBankName.trim()) {
        setMessage('Vui lòng nhập tên tài khoản ngân hàng.');
        return;
      }
      if (!form.bankNumber.trim()) {
        setMessage('Vui lòng nhập số tài khoản ngân hàng.');
        return;
      }
    }

    const confirm = window.confirm(
      "⚠️ Lưu ý quan trọng:\n\n" +
      "Thông tin tài khoản ngân hàng bạn cung cấp sẽ được dùng để Admin chuyển tiền cho bạn trong tương lai.\n\n" +
      "- Nếu bạn nhập sai số tài khoản hoặc tên tài khoản (không trùng khớp), yêu cầu sẽ bị từ chối và huỷ ngay lập tức.\n" +
      "- Bạn hoàn toàn chịu trách nhiệm với thông tin đã nhập. Nếu xảy ra sai sót trong quá trình chuyển tiền do bạn cung cấp sai, Admin sẽ không chịu trách nhiệm.\n\n" +
      "Hãy đảm bảo rằng bạn đã kiểm tra thật kỹ thông tin trước khi lưu.\n\n" +
      "Bạn có chắc chắn muốn cập nhật không?"
    );

    if (!confirm) return; // Người dùng chọn Cancel → không làm gì

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
      console.log(res)
      setMessage(res.status ? 'Cập nhật thành công!' : 'Cập nhật thất bại!');
      if (res.status) {
        await fetchProfile();
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
        <Select
          placeholder="Chọn ngân hàng"
          optionFilterProp="children"
          onChange={(value) => {
            setForm((prev) => ({
              ...prev,
              bankid: value.value, // chỉ lưu bank.id
            }));
          }}

          style={{ width: "100%", marginTop: 10 }}
          labelInValue
          value={selectBankValue}
        >
          {bankList.map((bank) => (
            <Option key={bank.id} value={bank.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={bank.logo} alt={bank.name} width={24} height={24} style={{ objectFit: 'contain' }} />
                <span>{bank.short_name}-{bank.name}</span>
              </div>
            </Option>
          ))}
        </Select>


        {form.bankid && (
          <>
            <Input
              placeholder="Tên tài khoản"
              value={form.accountBankName}
              onChange={(e) => {
                const value = e.target.value;

                const cleanValue = value.replace(/[^a-zA-ZÀ-ỹ\s]/g, '');
                setForm((prev) => ({ ...prev, accountBankName: cleanValue }));
              }}
              style={{ marginTop: 10 }}
            />

            <Input
              placeholder="Số tài khoản"
              value={form.bankNumber}
              onChange={(e) => {
                const value = e.target.value;
                // Chỉ cho phép số
                const numericValue = value.replace(/\D/g, '');
                setForm((prev) => ({ ...prev, bankNumber: numericValue }));
              }}
              style={{ marginTop: 10 }}
            />

          </>
        )}
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
