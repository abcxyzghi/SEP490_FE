import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stepper,
    Step,
    StepLabel,
    Box,
    IconButton,
    InputAdornment,
    Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { unstable_OneTimePasswordField as OTPField } from "radix-ui";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const steps = ['Enter Email', 'Verify Code', 'Reset Password'];

export default function ForgotPasswordDialog({ open, onClose }) {
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(''); // from array to string
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [timer, setTimer] = useState(300); // 5 mins
    const [resendTimer, setResendTimer] = useState(30);
    const [loadingResetPwd, setLoadingResetPwd] = useState(false);
    const otpRefs = useRef([]);

    // Countdown func
    useEffect(() => {
        if (activeStep === 1 && timer > 0) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [activeStep, timer]);

    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    // Otp help keeps the value when modal close func (doesn't seem affective)
    // useEffect(() => {
    //     if (!open) {
    //         setActiveStep(0);
    //         setEmail('');
    //         setOtp(['', '', '', '', '', '']);
    //         setNewPassword('');
    //         setConfirmPassword('');
    //         setShowPassword(false);
    //         setShowConfirm(false);
    //         setTimer(300);
    //         setResendTimer(30);
    //         setSnackbar({ open: false, message: '', severity: 'info' });
    //     }
    // }, [open]);

    // Otp handling
    const handleOtpChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleResend = () => {
        setResendTimer(30);
        setTimer(300);
        console.log('Resending OTP to:', email);
    };

    // Inputs validation before proceed next step
    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (newPassword) =>
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/.test(newPassword);

    const handleNext = async () => {
        setLoadingResetPwd(true);
        try {
            if (activeStep === 0) {
                // If the email is not empty but invalid, the second condition is evaluated and the message will be about invalid format
                if (!email.trim() || (email.trim() && !validateEmail(email))) {
                    return setSnackbar({
                        open: true,
                        message: !email.trim() ? 'Please enter your email.' : 'Invalid Email format.',
                        severity: 'warning'
                    });
                }
                console.log('Send OTP to:', email);
            } else if (activeStep === 1) {
                if (otp.length < 6) {
                    return setSnackbar({ open: true, message: 'Please complete the OTP.', severity: 'warning' });
                }
                console.log('Verify OTP:', otp);
            } else if (activeStep === 2) {
                if (!newPassword.trim() || !confirmPassword.trim()) {
                    return setSnackbar({ open: true, message: 'Please fill in both password fields.', severity: 'warning' });
                }
                if (!validatePassword(newPassword)) {
                    return setSnackbar({
                        open: true,
                        message: 'Password must be between 8 - 15 characters long, include at least an uppercase, lowercase, number, and special character.',
                        severity: 'warning',
                    });
                }
                if (newPassword !== confirmPassword) {
                    return setSnackbar({ open: true, message: 'Passwords do not match.', severity: 'error' });
                }
                console.log('Resetting password to:', newPassword);
                setSnackbar({ open: true, message: 'Password successfully reset!', severity: 'success' });
                onClose();
                return;
            }
            setActiveStep((prev) => prev + 1);
        } catch (e) {
            setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
        } finally {
            setLoadingResetPwd(false);
        }
    };

    const handleBack = () => {
        if (activeStep > 0) setActiveStep((prev) => prev - 1);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{
            sx: {
                borderRadius: 4,
                background: 'linear-gradient(to bottom right, #ffffff, #f0f0f0)',
            },
        }}>
            <DialogTitle className='oxanium-semibold'>Forgot Password</DialogTitle>
            <DialogContent>
                <Stepper alternativeLabel activeStep={activeStep} sx={{ mb: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Box mt={3}>
                        {/* <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        /> */}
                        <div className="login-form-control">
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                className="login-input h-12 oxanium-regular w-full"
                                // required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box>
                        <OTPField.Root
                            className="flex justify-between gap-1"
                            value={otp}
                            onValueChange={setOtp}
                            maxLength={6}
                        >
                            {Array.from({ length: 6 }).map((_, i) => (
                                <OTPField.Input
                                    key={i}
                                    aria-label={`OTP ${i + 1}`}
                                    inputMode="numeric"
                                    type="tel"
                                    className="OTPInput border border-gray-300 text-center text-lg rounded-md py-2 w-10 oxanium-semibold"
                                />
                            ))}
                            <OTPField.HiddenInput />
                        </OTPField.Root>

                        <Box mt={2} textAlign="center">
                            <div className="oxanium-regular">Your code will expire in {`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}</div>
                            {resendTimer > 0 ? (
                                <div className="oxanium-light">Resend code in {resendTimer}s</div>
                            ) : (
                                <Button onClick={handleResend} size="small">Click to resend</Button>
                            )}
                        </Box>
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box mt={3}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type={showConfirm ? 'text' : 'password'}
                            variant="outlined"
                            sx={{ mt: 2 }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirm((prev) => !prev)}>
                                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
                <Button variant="contained" onClick={handleNext} disabled={loadingResetPwd}>
                    {loadingResetPwd ? 'Please wait...' : activeStep === 2 ? 'Reset Password' : 'Next'}
                </Button>
            </DialogActions>

            <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}
