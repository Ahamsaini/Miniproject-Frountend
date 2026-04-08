import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Fade,
    Slide
} from '@mui/material';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import UniversityLogo from '../components/UniversityLogo';
import Footer from '../components/Footer';
import universityTheme from '../theme/universityTheme';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [mounted, setMounted] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        setMounted(true);
        // Console message for developer credit
        console.log('%c🎓 Shobhit University Lab Management System', 'font-size: 16px; font-weight: bold; color: #1e3a8a;');
        console.log('%c✨ Crafted with care by Aham Saini', 'font-size: 12px; color: #0d9488;');
    }, []);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());

        try {
            const response = await axiosInstance.post('/auth/login', {
                email: formData.email.trim(),
                password: formData.password,
                rememberMe: formData.rememberMe
            });

            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            dispatch(loginSuccess(user));
            navigate('/');
        } catch (err) {
            const message = err.response?.data?.message || 'Invalid email or password';
            dispatch(loginFailure(message));
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 200px)' }}>
                {/* Left Panel - University Branding */}
                <Slide direction="right" in={mounted} timeout={800}>
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            flex: 1,
                            background: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.accent.main} 100%)`,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 6,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Decorative circles */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '-10%',
                                right: '-5%',
                                width: '300px',
                                height: '300px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.05)',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '-15%',
                                left: '-10%',
                                width: '400px',
                                height: '400px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.03)',
                            }}
                        />

                        {/* Content */}
                        <Fade in={mounted} timeout={1200}>
                            <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                                <UniversityLogo size="xlarge" showText={false} />
                                <Typography
                                    sx={{
                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                        fontSize: '2.5rem',
                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                        color: universityTheme.colors.primary.contrast,
                                        mt: 4,
                                        mb: 2,
                                    }}
                                >
                                    {universityTheme.university.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: universityTheme.typography.fontFamily.body,
                                        fontSize: '1.125rem',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        mb: 1,
                                    }}
                                >
                                    {universityTheme.university.tagline}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontFamily: universityTheme.typography.fontFamily.body,
                                        fontSize: '1rem',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontWeight: universityTheme.typography.fontWeight.medium,
                                    }}
                                >
                                    Lab Management System
                                </Typography>
                            </Box>
                        </Fade>
                    </Box>
                </Slide>

                {/* Right Panel - Login Form */}
                <Slide direction="left" in={mounted} timeout={800}>
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: { xs: 2, sm: 4 },
                            bgcolor: universityTheme.colors.neutral.light,
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 4, sm: 6 },
                                maxWidth: '480px',
                                width: '100%',
                                borderRadius: universityTheme.borderRadius['2xl'],
                                border: `1px solid ${universityTheme.colors.neutral.light}`,
                                boxShadow: universityTheme.shadows.xl,
                                bgcolor: universityTheme.colors.neutral.white,
                            }}
                        >
                            {/* Mobile Logo */}
                            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
                                <UniversityLogo size="large" />
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                        color: universityTheme.colors.neutral.dark,
                                        mb: 1,
                                    }}
                                >
                                    Welcome Back
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: universityTheme.colors.neutral.medium,
                                    }}
                                >
                                    Sign in to access your lab management portal
                                </Typography>
                            </Box>

                            {error && (
                                <Fade in={true}>
                                    <Alert
                                        severity="error"
                                        sx={{
                                            mb: 3,
                                            borderRadius: universityTheme.borderRadius.lg,
                                        }}
                                    >
                                        {error}
                                    </Alert>
                                </Fade>
                            )}

                            <form onSubmit={handleSubmit}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        variant="outlined"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <MdEmail color={universityTheme.colors.neutral.medium} size={20} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: universityTheme.borderRadius.lg,
                                            },
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <MdLock color={universityTheme.colors.neutral.medium} size={20} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: universityTheme.borderRadius.lg,
                                            },
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name="rememberMe"
                                                    checked={formData.rememberMe}
                                                    onChange={handleChange}
                                                    size="small"
                                                    sx={{
                                                        color: universityTheme.colors.primary.main,
                                                        '&.Mui-checked': {
                                                            color: universityTheme.colors.primary.main,
                                                        },
                                                    }}
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium }}>
                                                    Remember me
                                                </Typography>
                                            }
                                        />
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => navigate('/forgot-password')}
                                            sx={{
                                                color: universityTheme.colors.primary.main,
                                                textTransform: 'none',
                                                fontWeight: universityTheme.typography.fontWeight.medium,
                                            }}
                                        >
                                            Forgot password?
                                        </Button>
                                    </Box>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        sx={{
                                            py: 1.5,
                                            bgcolor: universityTheme.colors.primary.main,
                                            borderRadius: universityTheme.borderRadius.lg,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: universityTheme.typography.fontWeight.semibold,
                                            boxShadow: universityTheme.shadows.md,
                                            '&:hover': {
                                                bgcolor: universityTheme.colors.primary.dark,
                                                boxShadow: universityTheme.shadows.lg,
                                            },
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                                    </Button>
                                </Box>
                            </form>

                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium }}>
                                    Don't have an account?{' '}
                                    <Button
                                        variant="text"
                                        onClick={() => navigate('/role-selection')}
                                        sx={{
                                            color: universityTheme.colors.primary.main,
                                            fontWeight: universityTheme.typography.fontWeight.semibold,
                                            textTransform: 'none',
                                            p: 0,
                                            minWidth: 0,
                                            '&:hover': {
                                                bgcolor: 'transparent',
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Sign up
                                    </Button>
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                </Slide>
            </Box>

            <Footer />
        </Box>
    );
};

export default Login;
