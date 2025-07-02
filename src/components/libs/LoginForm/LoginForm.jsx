import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import ForgotPasswordDialog from '../ForgotPasswordDialog/ForgotPasswordDialog';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { loginApi } from '../../../services/api.auth';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../../../redux/features/userSlice';
import { setToken } from '../../../redux/features/authSlice';
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
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isLoading) return; // Prevent spam
        setIsLoading(true);
        setError('');
        const { userName, password } = form;
        if (!userName.trim() || !password.trim()) {
            return setSnackbar({ open: true, message: 'Please fill in all fields.', severity: 'error' });
        }
        try {
            const data = await loginApi(userName, password);
            if (data && data.access_token && data.is_email_verification) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
                dispatch(loginAction(data));
                dispatch(setToken(data.access_token));
                setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
                navigate("/");
            } else if (data && data.is_email_verification === false) {
                setSnackbar({ open: true, message: 'Please verify your email before logging in.', severity: 'warning' });
            } else if (data && data.success === false && data.error_code === 403) {
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
                    message: responseData.error || 'You will be restricted for 30 minutes after 10 failed login attempts. Please try again later.',
                    severity: 'error'
                });
            } else if (responseData?.error_code === 404) {
                setSnackbar({
                    open: true,
                    message: responseData.error || 'Login Failed ! Incorrect username or password!',
                    severity: 'error'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: 'Login failed. Please check your credentials.',
                    severity: 'error'
                });
            }


        } finally {
            setIsLoading(false);

        }
    };

    // // Logout function
    // const handleLogout = () => {
    //     localStorage.removeItem('access_token');
    //     localStorage.removeItem('user');
    //     window.location.reload();
    // };

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
                        placeholder="User Name or Email"
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
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`login-btn oleo-script-regular
                backdrop-blur-lg border border-white/10 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-100  active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:border-white/30 hover:bg-gradient-to-tr hover:from-white/10 hover:to-black/40 group relative overflow-hidden
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                    ></div>
                    {isLoading ? (
                        <span className="loading loading-bars loading-md"></span>
                    ) : (
                        'Login'
                    )}
                </button>
            </form>
            {error && (
                <div style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</div>
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