import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Link,
    InputAdornment,
    IconButton,
    CircularProgress,
    Alert,
    Stack,
} from '@mui/material';
import {
    LockOutlined as LockIcon,
    EmailOutlined as EmailIcon,
    Visibility,
    VisibilityOff,
    Google as GoogleIcon,
    Facebook as FacebookIcon,
    GitHub as GitHubIcon,
    PhoneAndroid as PhoneIcon,
    KeyboardArrowRight,
} from '@mui/icons-material';
import { keyframes, styled } from '@mui/system';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { loginUser, requestOtpLogin, setAuthToken, verifyOtpLogin } from './services/api';

/* ─── Keyframes ─────────────────────────────────────────────────────────── */
const aurora = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatOrb = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(30px, -40px) scale(1.05); }
  66%  { transform: translate(-20px, 20px) scale(0.97); }
  100% { transform: translate(0, 0) scale(1); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

/* ─── Styled primitives ─────────────────────────────────────────────────── */
const Root = styled(Box)({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#060914',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Sora', sans-serif",
    padding: '24px 16px',
});

const Orb = styled(Box)(({ color, size, top, left, delay }) => ({
    position: 'absolute',
    width: size || 400,
    height: size || 400,
    top,
    left,
    borderRadius: '50%',
    background: color,
    filter: 'blur(80px)',
    opacity: 0.35,
    animation: `${floatOrb} ${12 + (parseInt(delay) || 0)}s ease-in-out infinite`,
    animationDelay: delay || '0s',
    pointerEvents: 'none',
}));

const GridLines = styled(Box)({
    position: 'absolute',
    inset: 0,
    backgroundImage: `
        linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
});

const Card = styled(Box)({
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: 460,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 24,
    padding: '48px 40px 40px',
    animation: `${fadeUp} 0.7s ease both`,
    boxShadow: `
        0 0 0 1px rgba(99,102,241,0.15),
        0 32px 64px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.08)
    `,
    '@media (max-width:480px)': {
        padding: '36px 24px 32px',
    },
});

const TabBar = styled(Box)({
    display: 'flex',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    border: '1px solid rgba(255,255,255,0.08)',
});

const Tab = styled(Box)(({ active }) => ({
    flex: 1,
    textAlign: 'center',
    padding: '10px 12px',
    borderRadius: 9,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    fontFamily: "'Sora', sans-serif",
    color: active ? '#fff' : 'rgba(255,255,255,0.45)',
    background: active
        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
        : 'transparent',
    boxShadow: active ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
    transition: 'all 0.25s ease',
    userSelect: 'none',
}));

const StyledInput = styled(TextField)({
    '& .MuiInputBase-root': {
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        color: '#fff',
        fontFamily: "'Sora', sans-serif",
        fontSize: 14,
        transition: 'all 0.2s',
    },
    '& .MuiInputBase-root:hover': {
        background: 'rgba(255,255,255,0.08)',
    },
    '& .MuiInputBase-root.Mui-focused': {
        background: 'rgba(99,102,241,0.08)',
        boxShadow: '0 0 0 2px rgba(99,102,241,0.5)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255,255,255,0.10) !important',
        borderRadius: 12,
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: "'Sora', sans-serif",
        fontSize: 14,
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#818cf8',
    },
    '& .MuiInputAdornment-root svg': {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 20,
    },
    '& input': {
        color: '#fff',
        '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px rgba(99,102,241,0.08) inset',
            WebkitTextFillColor: '#fff',
        },
    },
});

const GradientButton = styled(Button)(({ disabled }) => ({
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    textTransform: 'none',
    letterSpacing: '0.02em',
    background: disabled
        ? 'rgba(99,102,241,0.3)'
        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    backgroundSize: '200% auto',
    color: '#fff',
    border: 'none',
    boxShadow: disabled ? 'none' : '0 8px 32px rgba(99,102,241,0.45)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        backgroundPosition: 'right center',
        boxShadow: '0 12px 40px rgba(99,102,241,0.6)',
        transform: 'translateY(-1px)',
    },
    '&:active': {
        transform: 'translateY(0)',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
        backgroundSize: '200% auto',
        animation: `${shimmer} 2.5s linear infinite`,
    },
}));

const OutlineButton = styled(Button)({
    flex: 1,
    padding: '12px',
    borderRadius: 12,
    fontFamily: "'Sora', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    textTransform: 'none',
    color: '#fff',
    borderColor: 'rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.04)',
    '&:hover': {
        background: 'rgba(99,102,241,0.15)',
        borderColor: 'rgba(99,102,241,0.5)',
    },
});

const SocialBtn = styled(IconButton)({
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    color: 'rgba(255,255,255,0.7)',
    transition: 'all 0.2s',
    '&:hover': {
        background: 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.22)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    },
});

const Divider = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '24px 0',
    '& span': {
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: "'Sora', sans-serif",
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
    },
    '& hr': {
        flex: 1,
        border: 'none',
        borderTop: '1px solid rgba(255,255,255,0.08)',
    },
});

const LogoRing = styled(Box)({
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0 0 0 8px rgba(99,102,241,0.15), 0 12px 32px rgba(99,102,241,0.4)',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        inset: -4,
        borderRadius: '50%',
        border: '2px solid transparent',
        borderTopColor: 'rgba(99,102,241,0.6)',
        borderRightColor: 'rgba(168,85,247,0.4)',
        animation: `${spin} 3s linear infinite`,
    },
});

/* ─── Component ─────────────────────────────────────────────────────────── */
const Login = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [loginMode, setLoginMode] = useState('email');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [otpData, setOtpData] = useState({ phoneNumber: '', code: '' });

    // Load Sora font
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.email) { setError('Email address is required'); return false; }
        if (!/\S+@\S+\.\S+/.test(formData.email)) { setError('Please enter a valid email address'); return false; }
        if (!formData.password) { setError('Password is required'); return false; }
        return true;
    };

    const completeLogin = (response) => {
        const token = response.token;
        const user = response.user || response;
        setAuthToken(token);
        localStorage.setItem('userName', user?.fullName || user?.name || 'User');
        localStorage.setItem('userRole', user?.role || 'user');
        if (onLoginSuccess) {
            onLoginSuccess(user);
            const defaultRoute = user?.role === 'admin' ? '/admin' : '/products';
            navigate(location.state?.from || defaultRoute, { replace: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setError('');
        try {
            const response = await loginUser(formData.email, formData.password);
            completeLogin(response);
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpRequest = async () => {
        if (!otpData.phoneNumber) { setError('Phone number is required'); return; }
        setIsLoading(true);
        setError('');
        try {
            await requestOtpLogin(otpData.phoneNumber);
            setOtpSent(true);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpVerify = async () => {
        if (!otpData.phoneNumber || !otpData.code) { setError('Phone number and OTP are required'); return; }
        setIsLoading(true);
        setError('');
        try {
            const response = await verifyOtpLogin(otpData.phoneNumber, otpData.code);
            completeLogin(response);
        } catch (err) {
            setError(err.message || 'OTP verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = (mode) => {
        setLoginMode(mode);
        setError('');
        setOtpSent(false);
    };

    return (
        <Root>
            {/* Background atmosphere */}
            <Orb color="radial-gradient(circle, #6366f1, #4f46e5)" size={500} top="-10%" left="-15%" delay="0s" />
            <Orb color="radial-gradient(circle, #a855f7, #7c3aed)" size={400} top="50%" left="60%" delay="4s" />
            <Orb color="radial-gradient(circle, #ec4899, #be185d)" size={300} top="80%" left="-5%" delay="8s" />
            <GridLines />

            <Card>
                {/* Logo */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
                    <LogoRing>
                        <LockIcon sx={{ color: '#fff', fontSize: 24 }} />
                    </LogoRing>
                    <Typography
                        sx={{
                            fontFamily: "'Sora', sans-serif",
                            fontWeight: 800,
                            fontSize: 28,
                            color: '#fff',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.1,
                        }}
                    >
                        Welcome back
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'Sora', sans-serif",
                            fontSize: 14,
                            color: 'rgba(255,255,255,0.45)',
                            mt: 0.8,
                            mb: 3,
                        }}
                    >
                        Sign in to continue to your account
                    </Typography>
                </Box>

                {/* Tab switcher */}
                <TabBar>
                    <Tab active={loginMode === 'email' ? 1 : 0} onClick={() => switchMode('email')}>
                        📧 Email
                    </Tab>
                    <Tab active={loginMode === 'otp' ? 1 : 0} onClick={() => switchMode('otp')}>
                        📱 Mobile OTP
                    </Tab>
                </TabBar>

                {/* Error */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2.5,
                            borderRadius: 3,
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#fca5a5',
                            fontFamily: "'Sora', sans-serif",
                            fontSize: 13,
                            '& .MuiAlert-icon': { color: '#f87171' },
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* ── Email Mode ── */}
                {loginMode === 'email' && (
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <StyledInput
                                fullWidth
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={formData.email}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <StyledInput
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#818cf8' } }}
                                            >
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5, mb: 3 }}>
                            <Link
                                component={RouterLink}
                                to="/forgot-password"
                                sx={{
                                    fontFamily: "'Sora', sans-serif",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#818cf8',
                                    textDecoration: 'none',
                                    '&:hover': { color: '#a5b4fc' },
                                }}
                            >
                                Forgot password?
                            </Link>
                        </Box>

                        <GradientButton type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <CircularProgress size={20} sx={{ color: '#fff' }} />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Sign In
                                    <KeyboardArrowRight fontSize="small" />
                                </Box>
                            )}
                        </GradientButton>

                        <Typography
                            sx={{
                                textAlign: 'center',
                                mt: 3,
                                fontFamily: "'Sora', sans-serif",
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.4)',
                            }}
                        >
                            Don't have an account?{' '}
                            <Link
                                component={RouterLink}
                                to="/sign-up"
                                sx={{
                                    color: '#a78bfa',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    '&:hover': { color: '#c4b5fd' },
                                }}
                            >
                                Create one
                            </Link>
                        </Typography>
                    </Box>
                )}

                {/* ── OTP Mode ── */}
                {loginMode === 'otp' && (
                    <Box>
                        <Stack spacing={2}>
                            <StyledInput
                                fullWidth
                                label="Mobile Number"
                                placeholder="+91 98765 43210"
                                value={otpData.phoneNumber}
                                onChange={(e) => setOtpData((p) => ({ ...p, phoneNumber: e.target.value }))}
                                disabled={otpSent}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {!otpSent ? (
                                <GradientButton onClick={handleOtpRequest} disabled={isLoading}>
                                    {isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Send OTP'}
                                </GradientButton>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            background: 'rgba(99,102,241,0.12)',
                                            border: '1px solid rgba(99,102,241,0.3)',
                                            borderRadius: 3,
                                            p: 1.5,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography sx={{ fontFamily: "'Sora', sans-serif", fontSize: 13, color: '#818cf8' }}>
                                            ✓ OTP sent to {otpData.phoneNumber}
                                        </Typography>
                                    </Box>
                                    <StyledInput
                                        fullWidth
                                        label="Enter OTP"
                                        value={otpData.code}
                                        onChange={(e) => setOtpData((p) => ({ ...p, code: e.target.value }))}
                                        inputProps={{ maxLength: 6, letterSpacing: '0.4em', textAlign: 'center' }}
                                    />
                                    <Stack direction="row" spacing={1.5}>
                                        <OutlineButton variant="outlined" onClick={() => setOtpSent(false)}>
                                            Resend
                                        </OutlineButton>
                                        <GradientButton
                                            onClick={handleOtpVerify}
                                            disabled={isLoading}
                                            sx={{ flex: 2, width: 'auto' }}
                                        >
                                            {isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Verify & Login'}
                                        </GradientButton>
                                    </Stack>
                                </>
                            )}
                        </Stack>

                        <Typography
                            sx={{
                                textAlign: 'center',
                                mt: 3,
                                fontFamily: "'Sora', sans-serif",
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.4)',
                            }}
                        >
                            Don't have an account?{' '}
                            <Link
                                component={RouterLink}
                                to="/sign-up"
                                sx={{
                                    color: '#a78bfa',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    '&:hover': { color: '#c4b5fd' },
                                }}
                            >
                                Create one
                            </Link>
                        </Typography>
                    </Box>
                )}

                {/* Social Login */}
                <Divider>
                    <hr /><span>or continue with</span><hr />
                </Divider>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <SocialBtn title="Sign in with Google">
                        <GoogleIcon sx={{ fontSize: 22, color: '#ea4335' }} />
                    </SocialBtn>
                    <SocialBtn title="Sign in with Facebook">
                        <FacebookIcon sx={{ fontSize: 22, color: '#1877f2' }} />
                    </SocialBtn>
                    <SocialBtn title="Sign in with GitHub">
                        <GitHubIcon sx={{ fontSize: 22, color: '#fff' }} />
                    </SocialBtn>
                </Box>

                {/* Footer note */}
                <Typography
                    sx={{
                        textAlign: 'center',
                        mt: 3,
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.2)',
                        lineHeight: 1.6,
                    }}
                >
                    By signing in you agree to our{' '}
                    <Link href="#" sx={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', '&:hover': { color: '#818cf8' } }}>
                        Terms
                    </Link>{' '}
                    &{' '}
                    <Link href="#" sx={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', '&:hover': { color: '#818cf8' } }}>
                        Privacy Policy
                    </Link>
                </Typography>
            </Card>
        </Root>
    );
};

export default Login;