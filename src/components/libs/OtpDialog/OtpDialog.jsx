import React, { useEffect, useState } from 'react';
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

export default function OtpDialog({ open, email, onClose, onVerify, onResend }) {
    // OTP to store 6 digits
    const [otp, setOtp] = useState(new Array(6).fill(''));
    // 5 minutes = 300 seconds
    const [expirySeconds, setExpirySeconds] = useState(300);
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

    const handleResend = () => {
        if (resendSeconds > 0) return; // ignore clicks during cooldown

        // Your resend logic here (e.g., API call to resend OTP)
        console.log("OTP resent!");

        // 🔄 Reset both countdowns
        setResendSeconds(30);     // cooldown for resend
        setExpirySeconds(300);    // reset 5 min OTP validity
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <div className='otpDialog-wrapper'>
                <DialogTitle className='otpDialog-title oxanium-bold'>
                    Almost there!
                </DialogTitle>

                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        We’ve sent a code to <strong>{email}</strong>
                    </Typography>

                    <Box display="flex" justifyContent="center" gap={1} mb={2}>
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
                                        color: 'currentColor',
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
                    <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                        Your code will expire in {String(Math.floor(expirySeconds / 60)).padStart(2, '0')}:{String(expirySeconds % 60).padStart(2, '0')}
                    </Typography>

                    <DialogActions sx={{ justifyContent: 'space-evenly', px: 3 }}>
                        <Button onClick={handleClose} variant="outlined" color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleVerify} variant="contained" color="primary" disabled={otp.join('').length < 6}>
                            Verify
                        </Button>
                    </DialogActions>

                    {/* <Typography variant="caption">
                        Didn’t get the code?{' '}
                        <Link href="#" onClick={(e) => { e.preventDefault(); onResend(); }}>
                            Click to resend
                        </Link>
                    </Typography> */}
                    <Typography variant="caption" align="center" sx={{ mt: 2 }}>
                        Didn't get the code?{' '}
                        {/* Link trigger resend code api */}
                        <Link
                            component="button"
                            onClick={handleResend}
                            disabled={resendSeconds > 0}
                            sx={{ pointerEvents: resendSeconds > 0 ? 'none' : 'auto' }}
                        >
                            Click to resend {resendSeconds > 0 ? `(${resendSeconds}s)` : ''}
                        </Link>
                    </Typography>

                </DialogContent>

            </div>
        </Dialog>
    );
}
