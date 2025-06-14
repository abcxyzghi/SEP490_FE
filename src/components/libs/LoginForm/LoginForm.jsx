import React, { useState } from 'react';
import './LoginForm.css';
import ForgotPasswordDialog from '../ForgotPasswordDialog/ForgotPasswordDialog';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const validateUsername = (userName) =>
        /^[a-zA-Z0-9_]{3,16}$/.test(userName);

    const validatePassword = (password) =>
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/.test(password);

    const handleSubmit = (e) => {
        e.preventDefault();
        const { userName, password } = form;

        if (!userName.trim() || !password.trim()) {
            return setSnackbar({ open: true, message: 'Please fill in all fields.', severity: 'error' });
        }

        if (!validateUsername(userName)) {
            return setSnackbar({
                open: true,
                message: 'Username must be between 3 - 15 characters long. Only letters, numbers, and underscores are allowed.',
                severity: 'warning'
            });
        }

        if (!validatePassword(password)) {
            return setSnackbar({
                open: true,
                message: 'Password must be between 8 - 15 characters long, include at least an uppercase, lowercase, number, and special character.',
                severity: 'warning',
            });
        }

        // Proceed with actual Login logic here
        console.log("Login successful:", form);
        setSnackbar({ open: true, message: 'You’re logged in!', severity: 'success' });
    };

    return (
        <div className="login-container">
            <h2 className="login-title oleo-script-bold">Welcome back to Manga Mystery Box</h2>

            <form className="login-form" onSubmit={handleSubmit}>
                {/* Username and Password inputs */}
                <div className="login-form-control">
                    <input
                        name="userName"
                        type="text"
                        placeholder="User Name"
                        className="login-input input-bordered h-12 oxanium-regular"
                        // required
                        value={form.userName}
                        onChange={handleChange} />
                </div>
                <div className="login-form-control login-password-wrapper">
                    <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="login-input input-bordered h-12 oxanium-regular"
                        // required
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
                <button type="submit" className="login-btn oleo-script-regular
                backdrop-blur-lg border border-white/10 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-100  active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:border-white/30 hover:bg-gradient-to-tr hover:from-white/10 hover:to-black/40 group relative overflow-hidden">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                    ></div>
                    Login
                </button>
            </form>

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
