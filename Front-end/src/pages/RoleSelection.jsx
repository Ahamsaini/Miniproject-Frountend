import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Typography,
    Stack,
    Fade,
    Zoom,
    Card,
    CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    MdSchool,
    MdPerson,
    MdAdminPanelSettings,
    MdArrowForward
} from 'react-icons/md';
import UniversityLogo from '../components/UniversityLogo';
import Footer from '../components/Footer';
import universityTheme from '../theme/universityTheme';

const RoleSelection = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [hoveredRole, setHoveredRole] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const roles = [
        {
            title: 'Student',
            icon: MdSchool,
            color: universityTheme.colors.primary.main,
            gradient: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.primary.light} 100%)`,
            role: 'STUDENT',
            description: 'Access lab sessions, attendance, and academic resources'
        },
        {
            title: 'Teacher',
            icon: MdPerson,
            color: universityTheme.colors.accent.main,
            gradient: `linear-gradient(135deg, ${universityTheme.colors.accent.main} 0%, ${universityTheme.colors.accent.light} 100%)`,
            role: 'TEACHER',
            description: 'Manage lab sessions, track attendance, and monitor students'
        },
        {
            title: 'Administrator',
            icon: MdAdminPanelSettings,
            color: universityTheme.colors.secondary.dark,
            gradient: `linear-gradient(135deg, ${universityTheme.colors.secondary.dark} 0%, ${universityTheme.colors.secondary.main} 100%)`,
            role: 'ADMIN',
            description: 'Full system access and management capabilities'
        }
    ];

    const handleRoleSelect = (role) => {
        navigate(`/register?role=${role}`);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${universityTheme.colors.neutral.light} 0%, ${universityTheme.colors.neutral.white} 100%)`,
                    py: 6,
                    px: 2,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative background elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-10%',
                        right: '-5%',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${universityTheme.colors.primary.main}15 0%, transparent 70%)`,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '-15%',
                        left: '-10%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${universityTheme.colors.accent.main}10 0%, transparent 70%)`,
                    }}
                />

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Fade in={mounted} timeout={800}>
                        <Box>
                            {/* Header */}
                            <Box sx={{ textAlign: 'center', mb: 6 }}>
                                <Zoom in={mounted} timeout={600}>
                                    <Box>
                                        <UniversityLogo size="xlarge" />
                                    </Box>
                                </Zoom>
                                <Fade in={mounted} timeout={1000}>
                                    <Typography
                                        sx={{
                                            fontFamily: universityTheme.typography.fontFamily.heading,
                                            fontSize: { xs: '1.75rem', sm: '2.25rem' },
                                            fontWeight: universityTheme.typography.fontWeight.bold,
                                            color: universityTheme.colors.primary.main,
                                            mt: 4,
                                            mb: 1,
                                        }}
                                    >
                                        Welcome to Lab Management System
                                    </Typography>
                                </Fade>
                                <Fade in={mounted} timeout={1200}>
                                    <Typography
                                        sx={{
                                            color: universityTheme.colors.neutral.medium,
                                            fontSize: '1.125rem',
                                        }}
                                    >
                                        Select your role to get started
                                    </Typography>
                                </Fade>
                            </Box>

                            {/* Role Cards */}
                            <Stack spacing={3} sx={{ mb: 4 }}>
                                {roles.map((item, index) => {
                                    const Icon = item.icon;
                                    const isHovered = hoveredRole === item.role;

                                    return (
                                        <Zoom
                                            key={item.role}
                                            in={mounted}
                                            timeout={800 + index * 200}
                                        >
                                            <Card
                                                onMouseEnter={() => setHoveredRole(item.role)}
                                                onMouseLeave={() => setHoveredRole(null)}
                                                onClick={() => handleRoleSelect(item.role)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    borderRadius: universityTheme.borderRadius.xl,
                                                    border: `2px solid ${isHovered ? item.color : universityTheme.colors.neutral.light}`,
                                                    boxShadow: isHovered ? universityTheme.shadows.xl : universityTheme.shadows.md,
                                                    transition: 'all 0.3s ease',
                                                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                                                    background: isHovered ? `${item.color}05` : universityTheme.colors.neutral.white,
                                                    '&:hover': {
                                                        borderColor: item.color,
                                                    },
                                                }}
                                            >
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        {/* Icon */}
                                                        <Box
                                                            sx={{
                                                                width: 64,
                                                                height: 64,
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                                background: isHovered ? item.gradient : `${item.color}15`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.3s ease',
                                                            }}
                                                        >
                                                            <Icon
                                                                size={32}
                                                                color={isHovered ? universityTheme.colors.neutral.white : item.color}
                                                            />
                                                        </Box>

                                                        {/* Content */}
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography
                                                                sx={{
                                                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                                                    fontSize: '1.5rem',
                                                                    fontWeight: universityTheme.typography.fontWeight.bold,
                                                                    color: isHovered ? item.color : universityTheme.colors.neutral.dark,
                                                                    mb: 0.5,
                                                                    transition: 'color 0.3s ease',
                                                                }}
                                                            >
                                                                {item.title}
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    color: universityTheme.colors.neutral.medium,
                                                                    fontSize: '0.875rem',
                                                                }}
                                                            >
                                                                {item.description}
                                                            </Typography>
                                                        </Box>

                                                        {/* Arrow */}
                                                        <MdArrowForward
                                                            size={24}
                                                            color={isHovered ? item.color : universityTheme.colors.neutral.medium}
                                                            style={{
                                                                transition: 'all 0.3s ease',
                                                                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                                                            }}
                                                        />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Zoom>
                                    );
                                })}
                            </Stack>

                            {/* Sign In Link */}
                            <Fade in={mounted} timeout={1400}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        borderRadius: universityTheme.borderRadius.xl,
                                        border: `1px solid ${universityTheme.colors.neutral.light}`,
                                        bgcolor: universityTheme.colors.neutral.white,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{ color: universityTheme.colors.neutral.medium }}
                                    >
                                        Already have an account?{' '}
                                        <Button
                                            variant="text"
                                            onClick={() => navigate('/login')}
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
                                            Sign in to your account
                                        </Button>
                                    </Typography>
                                </Paper>
                            </Fade>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default RoleSelection;
