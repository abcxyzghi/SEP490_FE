import React, { useState } from 'react';
import './LoginForm.css';
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
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'warning' });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) =>
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password);

    const handleSubmit = (e) => {
        e.preventDefault();
        const { email, password } = form;

        if (!email || !password) {
            return setSnackbar({ open: true, message: 'Please fill in all fields.', severity: 'error' });
        }

        if (!validateEmail(email)) {
            return setSnackbar({ open: true, message: 'Invalid email format.', severity: 'warning' });
        }

        if (!validatePassword(password)) {
            return setSnackbar({
                open: true,
                message: 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.',
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
                {/* Email and Password inputs */}
                <div className="login-form-control">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="login-input input-bordered h-12 oxanium-regular"
                        // required
                        value={form.email}
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

                {/* Login submit button */}
                <button type="submit" className="login-btn oleo-script-regular">Login</button>
            </form>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    )
}
