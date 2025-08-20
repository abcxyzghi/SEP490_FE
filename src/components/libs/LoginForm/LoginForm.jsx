import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import OtpDialog from '../OtpDialog/OtpDialog';
import ForgotPasswordDialog from '../ForgotPasswordDialog/ForgotPasswordDialog';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { confirmOtpApi, loginApi, sendVerifyEmailApi } from '../../../services/api.auth';
import { PATH_NAME } from '../../../router/Pathname';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../../../redux/features/authSlice';
import { jwtDecode } from "jwt-decode";

export default function LoginForm({ showSnackbar = () => { } }) {
  const [form, setForm] = useState({ userName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [openForgotDialog, setOpenForgotDialog] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');
  const [showOtpSection, setShowOtpSection] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    const { userName, password } = form;
    if (!userName.trim() || !password.trim()) {
      setIsLoading(false);
      return showSnackbar('Please fill in all fields.', 'error');
    }

    try {
      const data = await loginApi(userName, password);
      if (data?.access_token && data?.is_email_verification) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);

        // decode token for role
        const decoded = jwtDecode(data.access_token);
        const role = decoded.role;   // decode to get "role" inside token payload
        // console.log(role)  //debugg

        dispatch(setToken(data.access_token));
        showSnackbar('Login successful!', 'success');

        // role-based redirect
        if (role === 'admin') {
          navigate(PATH_NAME.ADMIN_DASHBOARD);
        } else if (role === 'mod') {
          navigate(PATH_NAME.MODERATOR_DASHBOARD);
        } else {
          navigate(PATH_NAME.HOMEPAGE);
        }

      } else if (data?.is_email_verification === false) {
        setEmailToVerify(data.email);
        showSnackbar('Please verify your email before logging in.', 'warning');
        setShowOtpSection(true); // Mở dialog OTP
        await sendVerifyEmailApi(data.email);
      } else if (data?.success === false && data?.error_code === 403) {
        showSnackbar( data.error || 'Incorrect username or password!', 'error');
      } else {
        showSnackbar('Login failed. Please try again later.', 'error');
      }
    } catch (error) {
      console.error('API call error:', error);
      const responseData = error?.response?.data;
      if (responseData?.error_code === 403) {
        showSnackbar( responseData.error || 'You will be restricted for 30 minutes after 10 failed login attempts.', 'error');
      } else if (responseData?.error_code === 404) {
        showSnackbar( responseData.error || 'Login Failed! Incorrect username or password!', 'error');
      } else {
        showSnackbar('Login failed. Please check your credentials.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (code) => {
    if (!code || code.length !== 6) {
      // return setSnackbar({ open: true, message: 'Please enter the 6-digit OTP.', severity: 'error' });
      return showSnackbar('Please enter the 6-digit OTP.', 'warning');
    }

    try {
      const res = await confirmOtpApi(code, emailToVerify);
      const result = res.data;

      if (result.success) {
        showSnackbar('Email verified successfully! Please login again.', 'success');
        setShowOtpSection(false); // đóng OTP section nếu có
        setEmailToVerify('');
        navigate('/login');
      } else {
        showSnackbar( res.message || 'Invalid verification code.', 'error');
      }
    } catch (err) {
      console.error('Verify email error:', err);
      showSnackbar('Verification failed. Please try again later.', 'error');
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title oleo-script-bold">Welcome back to Manga Mystery Box</h2>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="login-form-control">
          <input
            name="userName"
            type="text"
            placeholder="User Name or Email"
            className="login-input input-bordered h-12 oxanium-regular"
            value={form.userName}
            onChange={handleChange}
          />
        </div>
        <div className="login-form-control login-password-wrapper">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="login-input input-bordered h-12 oxanium-regular"
            value={form.password}
            onChange={handleChange}
          />
          <IconButton className="login-toggle-icon" onClick={() => setShowPassword(!showPassword)} size="small" sx={{ color: "white" }}>
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </div>

        {/* Forgot password */}
        <span
          className="login-modal-link oxanium-light"
          onClick={() => setOpenForgotDialog(true)}
        >
          Forgot password?
        </span>

        <button
          type="submit"
          disabled={isLoading}
          className={`login-btn oleo-script-regular transition-all duration-300 ease-out ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
        >
          {isLoading ? <span className="loading loading-bars loading-md"></span> : 'Login'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</div>
      )}

      {/* Navigate note */}
      <p className="login-botNote oxanium-light">
        Don't have an account? <span className="login-botNote-link" onClick={() => navigate(PATH_NAME.REGISTER)}>Register</span>
      </p>


      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={openForgotDialog}
        onClose={() => setOpenForgotDialog(false)}
      />


      {/* OTP Dialog */}
      <OtpDialog
        open={showOtpSection}
        onClose={() => setShowOtpSection(false)}
        email={emailToVerify}
        onVerify={handleVerifyEmail}
      // otp={otp}
      // setOtp={setOtp}
      />
    </div>
  );
}
