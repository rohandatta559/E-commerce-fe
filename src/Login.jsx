import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Paper,
    InputAdornment,
    IconButton,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import {
    LockOutlined as LockIcon,
    EmailOutlined as EmailIcon,
    Visibility,
    VisibilityOff,
    Google as GoogleIcon,
    Facebook as FacebookIcon,
    GitHub as GitHubIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { loginUser, setAuthToken } from './services/api';

// Animations
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
`;

const blobMove = keyframes`
  0% { transform: translate(0px, 0px) scale(1); }
  50% { transform: translate(16px, -24px) scale(1.06); }
  100% { transform: translate(0px, 0px) scale(1); }
`;

const Login = ({ onLoginSuccess }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const validateForm = () => {
        if (!formData.email) {
            setError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const { token, user } = await loginUser(formData.email, formData.password);
            setAuthToken(token);
            const displayName = user?.fullName || user?.name || 'User';
            localStorage.setItem('userName', displayName);
            if (onLoginSuccess) {
                onLoginSuccess(user);
                const from = location.state?.from || '/products';
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Failed to sign in. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        console.log(`Logging in with ${provider}`);
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ position: 'relative' }}>
            <Box
                sx={{
                    mt: { xs: 6, sm: 10 },
                    mb: { xs: 6, sm: 10 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    minHeight: { xs: '70vh', sm: '60vh' },
                    overflow: 'hidden',
                }}
            >
                {/* Background decorative blobs */}
                <Box
                    aria-hidden
                    sx={{
                        position: 'absolute',
                        top: -80,
                        left: -80,
                        width: 220,
                        height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle at 30% 30%, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                        opacity: 0.18,
                        filter: 'blur(10px)',
                        animation: `${blobMove} 10s ease-in-out infinite`,
                        zIndex: 0,
                    }}
                />
                <Box
                    aria-hidden
                    sx={{
                        position: 'absolute',
                        bottom: -60,
                        right: -60,
                        width: 260,
                        height: 260,
                        borderRadius: '50%',
                        background: `radial-gradient(circle at 30% 30%, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
                        opacity: 0.16,
                        filter: 'blur(12px)',
                        animation: `${blobMove} 12s ease-in-out infinite`,
                        animationDelay: '500ms',
                        zIndex: 0,
                    }}
                />
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: 4,
                        animation: `${fadeInUp} 600ms ease 60ms both`,
                        position: 'relative',
                        zIndex: 1,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
                        border: '1px solid rgba(124,58,237,0.12)',
                    }}
                >
                    <LockIcon
                        sx={{
                            margin: 1,
                            backgroundColor: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                            color: 'white',
                            padding: 2,
                            borderRadius: '50%',
                            fontSize: 40,
                            animation: `${pulse} 2500ms ease-in-out infinite`,
                            boxShadow: `0 8px 20px rgba(124, 58, 237, 0.25)`,
                        }}
                    />
                    <Typography component="h1" variant="h5" sx={{ mt: 2, mb: 3, fontWeight: 700 }}>
                        Sign in
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ width: '100%', mt: 1 }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                },
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="primary" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                },
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Link
                                component={RouterLink}
                                to="/forgot-password"
                                variant="body2"
                                sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 600 }}
                            >
                                Forgot password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Button
                                    component={RouterLink}
                                    to="/sign-up"
                                    variant="text"
                                    size="small"
                                    sx={{ textTransform: 'none', fontWeight: 600, color: 'secondary.main' }}
                                >
                                    Sign Up
                                </Button>
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }}>OR</Divider>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        <IconButton
                            onClick={() => handleSocialLogin('google')}
                            sx={{ border: '1px solid #ddd' }}
                        >
                            <GoogleIcon color="error" />
                        </IconButton>
                        <IconButton
                            onClick={() => handleSocialLogin('facebook')}
                            sx={{ border: '1px solid #ddd' }}
                        >
                            <FacebookIcon color="primary" />
                        </IconButton>
                        <IconButton
                            onClick={() => handleSocialLogin('github')}
                            sx={{ border: '1px solid #ddd' }}
                        >
                            <GitHubIcon />
                        </IconButton>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
