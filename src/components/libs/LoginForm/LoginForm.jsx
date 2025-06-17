import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../../redux/features/userSlice';
import './LoginForm.css';
import ForgotPasswordDialog from '../ForgotPasswordDialog/ForgotPasswordDialog';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import api from '../../../config/axios';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function LoginForm() {
    // Form validation func
    const [form, setForm] = useState({
        userName: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'warning' });
    const [openForgotDialog, setOpenForgotDialog] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState(null);
    const MAX_ATTEMPTS = 10;
    const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { userName, password } = form;

        if (lockoutTime && Date.now() < lockoutTime) {
            const remaining = Math.ceil((lockoutTime - Date.now()) / 60000);
            setSnackbar({ open: true, message: `You have been temporarily blocked. You will be blocked for 30 minutes. Please try again in ${remaining} minute(s).`, severity: 'error' });
            return;
        }

        if (!userName) {
            setSnackbar({ open: true, message: 'Username or Email is required', severity: 'error' });
            return;
        }
        if (!password) {
            setSnackbar({ open: true, message: 'Password is required', severity: 'error' });
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('username', userName);
            params.append('password', password);
            params.append('scope', '');
            params.append('client_id', 'string');
            params.append('client_secret', 'string');

            const response = await api.post('api/user/auth/login', params, {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            // Check for success and email verification
            if (response.data && response.data.access_token) {
                if (response.data.is_email_verification) {
                    localStorage.setItem('token', response.data.access_token);
                    localStorage.setItem('refreshToken', response.data.refresh_token);
                    dispatch(login(response.data));
                    alert('Login successful!');
                    setLoginAttempts(0);
                    setLockoutTime(null);
                    navigate("/");
                } else {
                    setSnackbar({ open: true, message: 'Please verify your email before logging in.', severity: 'error' });
                }
            } else {
                setSnackbar({ open: true, message: response.data?.message || 'Login failed. Please check your credentials.', severity: 'error' });
            }
        } catch (err) {
            setLoginAttempts(prev => {
                const next = prev + 1;
                if (next >= MAX_ATTEMPTS) {
                    setLockoutTime(Date.now() + LOCKOUT_DURATION);
                    setSnackbar({ open: true, message: `Too many attempts. You are locked out for ${LOCKOUT_DURATION / 60000} minutes.`, severity: 'error' });
                } else {
                    setSnackbar({ open: true, message: `Password is wrong. You have ${MAX_ATTEMPTS - next} attempt(s) left before lockout.`, severity: 'error' });
                }
                return next;
            });
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title oleo-script-bold">Welcome back to Manga Mystery Box</h2>
            {/* <button onClick={handleLogout} style={{ position: 'top left', top: 20, right: 20 }}>Logout</button> */}

            <form className="login-form" onSubmit={handleLogin}>
                {/* Username and Password inputs */}
                <div className="login-form-control">
                    <input
                        name="userName"
                        type="text"
                        placeholder="Username or Email"
                        className="login-input input-bordered h-12 oxanium-regular"
                        value={form.userName}
                        onChange={handleChange} />
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

                {/* Links open "Send email code" and "Forgot password" Modal */}
                {/* <div className="login-form-link">
                    <span className='login-modal-link oxanium-light'>
                        Send email code
                    </span> */}

                <span className='login-modal-link oxanium-light'
                    onClick={() => setOpenForgotDialog(true)}>
                    Forgot password?
                </span>
                {/* </div> */}

                {/* Login submit button */}
                <button type="submit" className="login-btn oleo-script-regular">Login</button>
            </form>
            {lockoutTime && Date.now() < lockoutTime && (
                <div style={{ color: 'orange', textAlign: 'center', marginTop: 10 }}>
                    Login temporarily unavailable. Please try again in {Math.ceil((lockoutTime - Date.now()) / 60000)} minute(s).
                </div>
            )}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Forgot Password Modal */}
            <ForgotPasswordDialog
                open={openForgotDialog}
                onClose={() => setOpenForgotDialog(false)}
            />

        </div>
    )
}
