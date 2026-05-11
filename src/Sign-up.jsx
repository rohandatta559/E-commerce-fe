import React, { useState } from "react";
import { TextField, Button, Typography, Box, Paper, Container, Alert, CircularProgress } from "@mui/material";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { registerUser, setAuthToken } from "./services/api";

const SignUp = ({ onSignUpSuccess }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        
        try {
            const { token, user } = await registerUser(
                formData.name,
                formData.email,
                formData.password,
                formData.phone
            );
            
            setAuthToken(token);
            localStorage.setItem('userName', user?.fullName || formData.name || 'User');
            if (onSignUpSuccess) {
                onSignUpSuccess(user);
            }
            const from = location.state?.from || '/products';
            navigate(from, { replace: true });
            
        } catch (err) {
            setError(err.message || 'Registration failed. Please check your information and try again.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Container component="main" maxWidth="xs">
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mt: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'linear-gradient(180deg, rgba(124,58,237,0.12), rgba(236,72,153,0.08))',
                    border: '1px solid rgba(124,58,237,0.12)',
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                    Create an Account
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
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
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required    
                        fullWidth
                        name="name"
                        label="Full Name"
                        type="text"
                        id="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required    
                        fullWidth
                        name="phone"
                        label="Phone Number"
                        type="tel"
                        id="phone"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        inputProps={{
                            pattern: '[0-9]{10}',
                            title: 'Please enter a valid 10-digit phone number'
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Sign Up'
                        )}
                    </Button>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="text" 
                                size="small"
                                sx={{ textTransform: 'none' }}
                            >
                                Sign In
                            </Button>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default SignUp;
