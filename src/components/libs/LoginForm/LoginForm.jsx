import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import OtpDialog from '../OtpDialog/OtpDialog';
import ForgotPasswordDialog from '../ForgotPasswordDialog/ForgotPasswordDialog';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { confirmOtpApi, loginApi, sendVerifyEmailApi } from '../../../services/api.auth';
import { useDispatch } from 'react-redux';
import { setToken } from '../../../redux/features/authSlice';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function LoginForm() {
  const [form, setForm] = useState({ userName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'warning' });
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
      return setSnackbar({ open: true, message: 'Please fill in all fields.', severity: 'error' });
    }

    try {
      const data = await loginApi(userName, password);
      if (data?.access_token && data?.is_email_verification) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        dispatch(setToken(data.access_token));
        setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
        navigate("/");
      } else if (data?.is_email_verification === false) {
        setEmailToVerify(data.email);
        setSnackbar({ open: true, message: 'Please verify your email before logging in.', severity: 'warning' });
        setShowOtpSection(true); // Mở dialog OTP
        await sendVerifyEmailApi(data.email);
      } else if (data?.success === false && data?.error_code === 403) {
        setSnackbar({ open: true, message: data.error || 'Incorrect username or password!', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Login failed. Please try again.', severity: 'error' });
      }
    } catch (error) {
      console.error('API call error:', error);
      const responseData = error?.response?.data;
      if (responseData?.error_code === 403) {
        setSnackbar({
          open: true,
          message: responseData.error || 'You will be restricted for 30 minutes after 10 failed login attempts.',
          severity: 'error',
        });
      } else if (responseData?.error_code === 404) {
        setSnackbar({
          open: true,
          message: responseData.error || 'Login Failed! Incorrect username or password!',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Login failed. Please check your credentials.',
          severity: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (code) => {
  if (!code || code.length !== 6) {
    return setSnackbar({ open: true, message: 'Please enter the 6-digit OTP.', severity: 'error' });
  }

  try {
    const res = await confirmOtpApi(code, emailToVerify);
    const result = res.data;

    if (result.success) {
      setSnackbar({ open: true, message: 'Email verified successfully! Please login again.', severity: 'success' });
      setShowOtpSection(false); // đóng OTP section nếu có
      setEmailToVerify('');
      navigate('/login');
    } else {
      setSnackbar({ open: true, message: res.message || 'Invalid verification code.', severity: 'error' });
    }
  } catch (err) {
    console.error('Verify email error:', err);
    setSnackbar({ open: true, message: 'Verification failed. Please try again.', severity: 'error' });
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
          <IconButton className="login-toggle-icon" onClick={() => setShowPassword(!showPassword)} size="small">
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
          className={`login-btn oleo-script-regular transition-all duration-300 ease-out ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? <span className="loading loading-bars loading-md"></span> : 'Login'}
        </button>
      </form>

         {/* Error */}
      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</div>
      )}

        {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

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
