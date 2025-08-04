import React, { useEffect, useState } from 'react';
import './OtpDialog.css';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    TextField,
    Button,
    Box,
    Link
} from '@mui/material';
import EmailCheck from '../../../assets/Icon_fill/Send_fill.svg';
import api from '../../../config/axios';
import { toast } from 'react-toastify';
export default function OtpDialog({ open, email, onClose, onVerify, onResend }) {
    // OTP to store 6 digits
    const [otp, setOtp] = useState(new Array(6).fill(''));
    // 10 minutes = 600 seconds
    const [expirySeconds, setExpirySeconds] = useState(600);
    // 30 seconds resend cooldown
    const [resendSeconds, setResendSeconds] = useState(0);

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/g, ''); // Only digits
        if (!value) return;

        const newOtp = [...otp];
        newOtp[index] = value.charAt(0); // Only one digit
        setOtp(newOtp);

        // Auto-focus to next
        if (index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (otp[index]) {
                // Just clear current digit
                const updatedOtp = [...otp];
                updatedOtp[index] = '';
                setOtp(updatedOtp);
            } else if (index > 0) {
                // Move back if current is empty
                const updatedOtp = [...otp];
                updatedOtp[index - 1] = '';
                setOtp(updatedOtp);
                document.getElementById(`otp-${index - 1}`).focus();
            }
        }
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code.length === 6) {
            onVerify(code);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
        if (paste.length === 6) {
            setOtp(paste.split(''));
            // Optionally auto-submit:
            // onVerify(paste);
        }
    };

    const handleClose = () => {
        setOtp(new Array(6).fill(''));
        onClose();
    };

    // Handle countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (resendSeconds === 0) return;
        const resendTimer = setInterval(() => {
            setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(resendTimer);
    }, [resendSeconds]);

    const handleResend = async () => {
        if (resendSeconds > 0) return; // ignore clicks during cooldown
        try {
            await api.post(`/api/user/email/verify?email=${encodeURIComponent(email)}`, {});
            toast.success('A new OTP has been sent to your email.');
            // 🔄 Reset both countdowns
            setResendSeconds(30);     // cooldown for resend
            setExpirySeconds(600);    // reset 10 min OTP validity
        } catch {
            toast.error('Failed to resend OTP.');
        }
    };

    return (
        <Dialog
            className="otpDialog-container"
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{ className: 'otpDialog-animated-shadow' }}
        >
            <div class="card__border"></div>

            {/* Modal content wrapper */}
            <div className='otpDialog-box'>
                <div className='otpDialog-header'>
                    <div className='otpDialog-header-text'>
                        <div className='otpDialog-title oxanium-bold'>
                            Almost there!
                        </div>

                        <span className='otpDialog-subtitle oxanium-regular'>
                            We’ve sent a code to{' '}
                            <a
                                href="https://mail.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--secondary-1)', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                {email}
                            </a>
                        </span>
                    </div>

                    <img
                        src={EmailCheck}
                        alt="Email check icon"
                        className='otpDialog-header-icon'
                    />
                </div>

                <DialogContent sx={{ textAlign: 'center', padding: 0 }}>
                    {/* OTP text inputs */}
                    <Box display="flex" justifyContent="center" gap={1}>
                        {otp.map((digit, index) => (
                            <TextField
                                key={index}
                                id={`otp-${index}`}
                                inputProps={{
                                    maxLength: 1,
                                    style: {
                                        textAlign: 'center',
                                        fontSize: '20px',
                                        font: 'inherit',
                                        letterSpacing: 'inherit',
                                        color: 'var(--light-4)',
                                        padding: '15.5px 10px',
                                        border: '2px solid var(--primary-4-o90)',
                                        borderRadius: '5px',
                                        boxSizing: 'content-box',
                                        background: 'none',
                                        height: '0.9em',
                                        margin: '0px',
                                        display: 'block',
                                        minWidth: 0,
                                        width: '100%',
                                        WebkitTapHighlightColor: 'transparent',
                                    },
                                }}
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={(e) => handlePaste(e)}
                                sx={{ width: 40 }}
                                variant="outlined"
                            />
                        ))}
                    </Box>

                    {/* The 5 mins code expire only reset when reload or transion to other page then go back */}
                    <div className='otpDialog-countDownEvent oxanium-regular'>
                        Your code will expire in {String(Math.floor(expirySeconds / 60)).padStart(2, '0')}:{String(expirySeconds % 60).padStart(2, '0')}
                    </div>

                    {/* Cancel and Verify Btn */}
                    <DialogActions sx={{ justifyContent: 'space-evenly', px: 3 }}>
                        <div className='otpDialog-cancelBtn oxanium-regular' onClick={handleClose} >
                            Cancel
                        </div>
                        <div
                            className={`otpDialog-submitBtn oxanium-bold ${otp.join('').length < 6 ? 'disabled' : ''}`}
                            onClick={otp.join('').length >= 6 ? handleVerify : undefined}
                        >
                            Verify
                        </div>
                    </DialogActions>

                    {/* <Typography variant="caption">
                        Didn’t get the code?{' '}
                        <Link href="#" onClick={(e) => { e.preventDefault(); onResend(); }}>
                            Click to resend
                        </Link>
                    </Typography> */}
                    <div className='otpDialog-botLink oxanium-semibold' variant="caption" align="center" >
                        Didn't get the code?{' '}
                        {/* Link trigger resend code api */}
                        <Link
                            component="button"
                            onClick={handleResend}
                            disabled={resendSeconds > 0}
                            sx={{
                                color: 'var(--secondary-1)',
                                textDecoration: 'none',
                                pointerEvents: resendSeconds > 0 ? 'none' : 'auto'
                            }}>
                            Click to resend {resendSeconds > 0 ? `(${resendSeconds}s)` : ''}
                        </Link>
                    </div>

                </DialogContent>
            </div>
        </Dialog>
    );
}
