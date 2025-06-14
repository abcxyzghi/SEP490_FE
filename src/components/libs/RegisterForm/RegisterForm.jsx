import React, { useState } from 'react';
import './RegisterForm.css';
import OtpDialog from '../OtpDialog/OtpDialog';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function RegisterForm() {
    // Form validation func
    const [form, setForm] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        accepted: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'warning' });
    const [showOtp, setShowOtp] = useState(false);
    const [emailForOtp, setEmailForOtp] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const validateUsername = (userName) =>
        /^[a-zA-Z0-9_]{3,16}$/.test(userName);

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) =>
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/.test(password);

    const handleSubmit = (e) => {
        e.preventDefault();
        const { userName, email, password, confirmPassword, accepted } = form;

        if (!userName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            return setSnackbar({ open: true, message: 'Please fill in all fields.', severity: 'error' });
        }

        if (!validateUsername(userName)) {
            return setSnackbar({
                open: true,
                message: 'Username must be between 3 - 15 characters long. Only letters, numbers, and underscores are allowed.',
                severity: 'warning'
            });
        }

        if (!validateEmail(email)) {
            return setSnackbar({ open: true, message: 'Invalid Email format.', severity: 'warning' });
        }

        if (!validatePassword(password)) {
            return setSnackbar({
                open: true,
                message: 'Password must be between 8 - 15 characters long, include at least an uppercase, lowercase, number, and special character.',
                severity: 'warning',
            });
        }

        if (password !== confirmPassword) {
            return setSnackbar({ open: true, message: 'Passwords do not match!', severity: 'error' });
        }

        if (!accepted) {
            return setSnackbar({ open: true, message: 'You must agree to all policies.', severity: 'warning' });
        }

        // Proceed with actual Register logic here
        console.log("Register successful:", form);
        setSnackbar({ open: true, message: 'All done!', severity: 'success' });
        setEmailForOtp(form.email);
        setShowOtp(true);
    };

    // Handle OTP verification snackbar
    const handleVerifyOtp = (code) => {
        console.log('Verify OTP:', code);
        setShowOtp(false);
        setSnackbar({ open: true, message: 'Registration complete!', severity: 'success' });
        // Navigate to Login page logic

    };

    const handleResendOtp = () => {
        console.log('Resending OTP to:', emailForOtp);
        setSnackbar({ open: true, message: 'Code resent.', severity: 'info' });
    };

    return (
        <div className="register-container">
            <h2 className="register-title oleo-script-bold">Register to Manga Mystery Box</h2>

            <form className="register-form" onSubmit={handleSubmit}>
                {/* User Name input */}
                <div className="register-form-control register-full-width">
                    <input
                        name="userName"
                        type="text" placeholder="User Name"
                        className="register-input input-bordered h-12 oxanium-regular"
                        // required
                        value={form.userName}
                        onChange={handleChange} />
                </div>

                {/* Email input */}
                <div className="register-form-control register-full-width">
                    <input
                        name="email"
                        type="email" placeholder="Email"
                        className="register-input input-bordered w-full h-12 oxanium-regular"
                        // required
                        value={form.email}
                        onChange={handleChange} />
                </div>

                {/* Password and Confirm Password inputs */}
                <div className="register-form-row">
                    <div className="register-form-control register-password-wrapper">
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className="register-input input-pw h-12 oxanium-regular"
                            // required
                            value={form.password}
                            onChange={handleChange}
                        />
                        <IconButton className="register-toggle-icon" onClick={() => setShowPassword(!showPassword)} size="small">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </div>
                    <div className="register-form-control register-password-wrapper">
                        <input

                            name="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            className="register-input input-pw h-12 oxanium-regular"
                            // required
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                        <IconButton className="register-toggle-icon" onClick={() => setShowConfirm(!showConfirm)} size="small">
                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </div>
                </div>

                {/* Policy tick box  */}
                <div className="register-form-control register-checkbox-control">
                    <label>
                        <Checkbox type="checkbox"
                            size="small"
                            sx={{ padding: 0, mt: "-5px" }}
                            color="secondary"
                            // required 
                            name="accepted"
                            checked={form.accepted}
                            onChange={handleChange} />
                        <span>
                            &nbsp;I agree with MMB's <a href="https://example.com/terms" target="_blank" rel="noopener noreferrer" className="register-link">Terms of Service</a>,
                            <a href="https://example.com/privacy" target="_blank" rel="noopener noreferrer" className="register-link"> Privacy Policy</a>, and default
                            <a href="https://example.com/notifications" target="_blank" rel="noopener noreferrer" className="register-link"> Notification Settings</a>.
                        </span>
                    </label>
                </div>

                {/* Register submit button */}
                <button type="submit" className="register-btn oleo-script-regular backdrop-blur-lg border border-white/10 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-100  active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:border-white/30 hover:bg-gradient-to-tr hover:from-white/10 hover:to-black/40 group relative overflow-hidden">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                    ></div>
                    Register an account
                </button>
            </form>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* OTP Modal */}
            <OtpDialog
                open={showOtp}
                email={emailForOtp}
                onClose={() => setShowOtp(false)}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
            />
        </div>
    );
}
