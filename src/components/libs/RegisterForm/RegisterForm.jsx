import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './RegisterForm.css';
import OtpDialog from '../OtpDialog/OtpDialog';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import { registerApi, sendVerifyEmailApi, confirmOtpApi } from '../../../services/api.auth';
import { PATH_NAME } from '../../../router/Pathname';

export default function RegisterForm({ showSnackbar = () => { } }) {
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
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const timerRef = useRef(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const validateUsername = (userName) =>
    /^[a-zA-Z0-9]{3,15}$/.test(userName);

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) =>
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?\\:{}|<>]).{8,15}$/.test(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return; // Prevent spam
        setIsLoading(true);
        const { userName, email, password, confirmPassword, accepted } = form;

        if (!userName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setIsLoading(false);
            return showSnackbar('Please fill in all fields.', 'error');
        }

        if (!validateUsername(userName)) {
            setIsLoading(false);
            return showSnackbar(
                'Username must be 3-15 characters and may contain letters, numbers only.',
                'warning'
            );
        }

        if (!validateEmail(email)) {
            setIsLoading(false);
            return showSnackbar('Invalid Email format.', 'warning');
        }

        if (!validatePassword(password)) {
            setIsLoading(false);
            return showSnackbar(
                'Password must be 8-15 chars and include uppercase, lowercase, number, and special character.',
                'warning'
            );
        }

        if (password !== confirmPassword) {
            setIsLoading(false);
            return showSnackbar('Passwords do not match!', 'error');
        }

        if (!accepted) {
            setIsLoading(false);
            return showSnackbar('You must agree to the policies.', 'warning');
        }

        try {
            await registerApi({ userName, email, password });
            await sendVerifyEmailApi(email);
            toast.success('Successfully created new account. OTP sent to your email.');
            setShowOtpModal(true);
        } catch (err) {
            const apiError = err.response?.data;
            if (apiError && apiError.error === 'Email aready in use !') {
                showSnackbar(apiError.error, 'error');
            } else if (apiError && apiError.error === '400: username already exist !') {
                showSnackbar(apiError.error, 'error');
            } else {
                // fallback to toast if you still want the toast behavior
                toast.error(apiError || 'Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (showOtpModal) {
            setOtpTimer(60);
            timerRef.current = setInterval(() => {
                setOtpTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [showOtpModal]);

    const handleResendOtp = async () => {
        try {
            await sendVerifyEmailApi(form.email);
            toast.success('A new OTP has been sent to your email.');
            // Reset and restart the OTP timer after successful resend
            setOtpTimer(60);
            clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setOtpTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch {
            toast.error('Failed to resend OTP.');
        }
    };

    // Fix: Accept code, not event
    const handleOtpSubmit = async (code) => {
        if (otpTimer === 0) {
            toast.error('OTP has expired. Please request a new one.');
            return;
        }
        if (!/^[0-9]{6}$/.test(code)) {
            toast.error('OTP must be a 6-digit number.');
            return;
        }
        try {
            await confirmOtpApi(code, form.email);
            toast.success('Email verified successfully! Please go to the login page to access the website.');
            setShowOtpModal(false);
            navigate('/login');
        } catch (err) {
            if (err.response?.data && typeof err.response.data === 'string' && err.response.data.toLowerCase().includes('invalid')) {
                toast.error('Invalid OTP. Please check and try again.');
            } else {
                toast.error(err.response?.data || 'OTP verification failed');
            }
        }
    };

    return (
        <div className="register-container">
            <h2 className="register-title oleo-script-bold">Register to Manga Mystery Box</h2>

            <form className="register-form" onSubmit={handleSubmit}>
                {/* User Name input */}
                <div className="register-form-control register-full-width">
                    <input
                        name="userName"
                        type="text" 
                        placeholder="User Name"
                        className="register-input input-bordered h-12 oxanium-regular"
                        // required
                        value={form.userName}
                        onChange={handleChange} />
                </div>

                {/* Email input */}
                <div className="register-form-control register-full-width">
                    <input
                        name="email"
                        type="email" 
                        placeholder="Email"
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
                        <IconButton className="register-toggle-icon" onClick={() => setShowPassword(!showPassword)} size="small" sx={{ color: "white" }}>
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
                        <IconButton className="register-toggle-icon" onClick={() => setShowConfirm(!showConfirm)} size="small" sx={{ color: "white" }}>
                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </div>
                </div>

                {/* Policy tick box  */}
                <div className="register-form-control register-checkbox-control oxanium-regular">
                    <label>
                        <Checkbox type="checkbox"
                            size="small"
                            sx={{ padding: 0, mt: "-5px", color: "white" }}
                            color="secondary"
                            // required 
                            name="accepted"
                            checked={form.accepted}
                            onChange={handleChange} />
                        <span>
                            &nbsp;I agree with MMB's{" "}
                            <a
                                href={PATH_NAME.TERM_OF_SERVICE}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="register-link"
                            >
                                Terms of Service
                            </a>
                            ,{" "}
                            <a
                                href={PATH_NAME.PRIVACY_POLICY}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="register-link"
                            >
                                Privacy Policy
                            </a>
                            , and {" "}
                            <a
                                href={PATH_NAME.COPYRIGHT_POLICY}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="register-link"
                            >
                                Copyright Policy
                            </a>
                            .
                        </span>
                    </label>
                </div>

                {/* Register submit button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`register-btn oleo-script-regular
                     backdrop-blur-lg border border-white/10 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:scale-100  active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:border-white/30 hover:bg-gradient-to-tr hover:from-white/10 hover:to-black/40 group relative overflow-hidden 
                     ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                    ></div>
                    {isLoading ? (
                        <span className="loading loading-bars loading-md"></span>
                    ) : (
                        'Register an account'
                    )}
                </button>
            </form>

            {/* Navigate note */}
            <p className="register-botNote oxanium-light">
                Already have an account? <span className="register-botNote-link oxanium-regular" onClick={() => navigate(PATH_NAME.LOGIN)}>Login</span>
            </p>


            {/* OTP Modal */}
            <OtpDialog
                open={showOtpModal}
                email={form.email}
                onClose={() => setShowOtpModal(false)}
                onVerify={handleOtpSubmit}
                onResend={handleResendOtp}
            />
        </div>
    );
}
