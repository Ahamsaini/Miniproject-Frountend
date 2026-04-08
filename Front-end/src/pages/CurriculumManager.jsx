import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    CircularProgress,
    Container,
    Fade,
    Zoom,
    Divider,
    Stack
} from '@mui/material';
import { MdSchool, MdArrowForward, MdCalendarMonth, MdMenuBook } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../features/courses/coursesSlice';
import universityTheme from '../theme/universityTheme';

const CurriculumManager = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items: courses, loading } = useSelector((state) => state.courses);
    const [mounted, setMounted] = useState(false);
    const [hoveredCourse, setHoveredCourse] = useState(null);

    useEffect(() => {
        setMounted(true);
        dispatch(fetchCourses({ page: 0, size: 100 }));
    }, [dispatch]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                }}
            >
                <CircularProgress
                    size={48}
                    sx={{ color: universityTheme.colors.primary.main }}
                />
            </Box>
        );
    }

    const groupedCourses = (courses || []).reduce((acc, course) => {
        const dept = course.department || 'General';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(course);
        return acc;
    }, {});

    const departmentColors = [
        { bg: universityTheme.colors.primary.main, light: `${universityTheme.colors.primary.main}15` },
        { bg: universityTheme.colors.accent.main, light: `${universityTheme.colors.accent.main}15` },
        { bg: universityTheme.colors.secondary.main, light: `${universityTheme.colors.secondary.main}15` },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Fade in={mounted} timeout={600}>
                <Box>
                    {/* Header Section */}
                    <Box
                        sx={{
                            p: { xs: 4, sm: 6 },
                            mb: 5,
                            borderRadius: universityTheme.borderRadius.xl,
                            background: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.accent.main} 100%)`,
                            color: universityTheme.colors.primary.contrast,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: universityTheme.shadows.lg
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: universityTheme.borderRadius.lg,
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <MdMenuBook size={32} color={universityTheme.colors.primary.contrast} />
                                </Box>
                                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                                    <Typography
                                        sx={{
                                            fontFamily: universityTheme.typography.fontFamily.heading,
                                            fontSize: { xs: '1.75rem', sm: '2.25rem' },
                                            fontWeight: 900,
                                            mb: 0.5,
                                            letterSpacing: '-0.02em',
                                            lineHeight: 1.1
                                        }}
                                    >
                                        Curriculum Architect
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '1.1rem',
                                            opacity: 0.85,
                                            fontWeight: 500
                                        }}
                                    >
                                        Configure instructional frameworks and subject catalogs for all academic departments.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                        {/* Decorative Background Elements */}
                        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
                        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                    </Box>

                    {/* Courses by Department */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {Object.entries(groupedCourses).map(([dept, deptCourses], deptIndex) => {
                            const colorScheme = departmentColors[deptIndex % departmentColors.length];

                            return (
                                <Fade key={dept} in={mounted} timeout={800 + deptIndex * 200}>
                                    <Box>
                                        {/* Department Header */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                mb: 3,
                                            }}
                                        >
                                            <Chip
                                                label={`${dept} Department`}
                                                sx={{
                                                    bgcolor: colorScheme.light,
                                                    color: colorScheme.bg,
                                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                                    fontWeight: universityTheme.typography.fontWeight.bold,
                                                    fontSize: '0.875rem',
                                                    px: 2,
                                                    py: 2.5,
                                                    height: 'auto',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                }}
                                            />
                                            <Divider sx={{ flex: 1 }} />
                                        </Box>

                                        {/* Course Cards */}
                                        <Grid container spacing={3}>
                                            {deptCourses.map((course, courseIndex) => {
                                                const isHovered = hoveredCourse === course.id;

                                                return (
                                                    <Grid item xs={12} md={6} lg={4} key={course.id}>
                                                        <Zoom in={mounted} timeout={1000 + courseIndex * 150}>
                                                            <Card
                                                                onMouseEnter={() => setHoveredCourse(course.id)}
                                                                onMouseLeave={() => setHoveredCourse(null)}
                                                                sx={{
                                                                    height: '100%',
                                                                    borderRadius: universityTheme.borderRadius.xl,
                                                                    border: `2px solid ${isHovered ? colorScheme.bg : universityTheme.colors.neutral.light}`,
                                                                    boxShadow: isHovered ? universityTheme.shadows.xl : universityTheme.shadows.md,
                                                                    transition: 'all 0.3s ease',
                                                                    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                }}
                                                            >
                                                                {/* Top accent bar */}
                                                                <Box
                                                                    sx={{
                                                                        height: 4,
                                                                        background: `linear-gradient(90deg, ${colorScheme.bg} 0%, ${universityTheme.colors.primary.light} 100%)`,
                                                                        transform: isHovered ? 'scaleX(1.1)' : 'scaleX(1)',
                                                                        transformOrigin: 'left',
                                                                        transition: 'transform 0.3s ease',
                                                                    }}
                                                                />

                                                                <CardContent sx={{ p: 3 }}>
                                                                    {/* Icon and Title */}
                                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: 56,
                                                                                height: 56,
                                                                                borderRadius: universityTheme.borderRadius.lg,
                                                                                bgcolor: isHovered ? colorScheme.bg : colorScheme.light,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                transition: 'all 0.3s ease',
                                                                            }}
                                                                        >
                                                                            <MdSchool
                                                                                size={28}
                                                                                color={isHovered ? universityTheme.colors.neutral.white : colorScheme.bg}
                                                                            />
                                                                        </Box>
                                                                        <Box sx={{ flex: 1 }}>
                                                                            <Typography
                                                                                sx={{
                                                                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                                                                    fontSize: '1.25rem',
                                                                                    fontWeight: universityTheme.typography.fontWeight.bold,
                                                                                    color: universityTheme.colors.neutral.dark,
                                                                                    mb: 0.5,
                                                                                    lineHeight: 1.3,
                                                                                }}
                                                                            >
                                                                                {course.courseName}
                                                                            </Typography>
                                                                            <Typography
                                                                                sx={{
                                                                                    fontFamily: universityTheme.typography.fontFamily.mono,
                                                                                    fontSize: '0.75rem',
                                                                                    color: universityTheme.colors.neutral.medium,
                                                                                    textTransform: 'uppercase',
                                                                                    letterSpacing: '0.1em',
                                                                                    fontWeight: universityTheme.typography.fontWeight.semibold,
                                                                                }}
                                                                            >
                                                                                {course.courseCode}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>

                                                                    {/* Stats */}
                                                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                                                        <Grid item xs={6}>
                                                                            <Paper
                                                                                elevation={0}
                                                                                sx={{
                                                                                    p: 2,
                                                                                    borderRadius: universityTheme.borderRadius.lg,
                                                                                    bgcolor: universityTheme.colors.neutral.light,
                                                                                    border: `1px solid ${universityTheme.colors.neutral.light}`,
                                                                                    transition: 'all 0.3s ease',
                                                                                    ...(isHovered && {
                                                                                        bgcolor: universityTheme.colors.neutral.white,
                                                                                        borderColor: colorScheme.light,
                                                                                    }),
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    sx={{
                                                                                        fontSize: '0.625rem',
                                                                                        color: universityTheme.colors.neutral.medium,
                                                                                        textTransform: 'uppercase',
                                                                                        letterSpacing: '0.1em',
                                                                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                                                                        mb: 0.5,
                                                                                    }}
                                                                                >
                                                                                    Duration
                                                                                </Typography>
                                                                                <Typography
                                                                                    sx={{
                                                                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                                                                        fontSize: '1.5rem',
                                                                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                                                                        color: universityTheme.colors.neutral.dark,
                                                                                    }}
                                                                                >
                                                                                    {course.durationYears}
                                                                                    <Typography component="span" sx={{ fontSize: '0.875rem', ml: 0.5 }}>
                                                                                        yrs
                                                                                    </Typography>
                                                                                </Typography>
                                                                            </Paper>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Paper
                                                                                elevation={0}
                                                                                sx={{
                                                                                    p: 2,
                                                                                    borderRadius: universityTheme.borderRadius.lg,
                                                                                    bgcolor: colorScheme.light,
                                                                                    border: `1px solid ${colorScheme.light}`,
                                                                                    transition: 'all 0.3s ease',
                                                                                    ...(isHovered && {
                                                                                        bgcolor: `${colorScheme.bg}20`,
                                                                                        borderColor: `${colorScheme.bg}40`,
                                                                                    }),
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    sx={{
                                                                                        fontSize: '0.625rem',
                                                                                        color: colorScheme.bg,
                                                                                        textTransform: 'uppercase',
                                                                                        letterSpacing: '0.1em',
                                                                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                                                                        mb: 0.5,
                                                                                    }}
                                                                                >
                                                                                    Semesters
                                                                                </Typography>
                                                                                <Typography
                                                                                    sx={{
                                                                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                                                                        fontSize: '1.5rem',
                                                                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                                                                        color: colorScheme.bg,
                                                                                    }}
                                                                                >
                                                                                    {course.totalSemesters}
                                                                                </Typography>
                                                                            </Paper>
                                                                        </Grid>
                                                                    </Grid>

                                                                    {/* Action Button */}
                                                                    <Button
                                                                        fullWidth
                                                                        variant="contained"
                                                                        onClick={() => navigate(`/courses/${course.id}`)}
                                                                        endIcon={
                                                                            <MdArrowForward
                                                                                style={{
                                                                                    transition: 'transform 0.3s ease',
                                                                                    transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                                                                                }}
                                                                            />
                                                                        }
                                                                        sx={{
                                                                            py: 1.5,
                                                                            bgcolor: universityTheme.colors.neutral.dark,
                                                                            borderRadius: universityTheme.borderRadius.lg,
                                                                            textTransform: 'none',
                                                                            fontSize: '0.875rem',
                                                                            fontWeight: universityTheme.typography.fontWeight.semibold,
                                                                            boxShadow: 'none',
                                                                            '&:hover': {
                                                                                bgcolor: colorScheme.bg,
                                                                                boxShadow: universityTheme.shadows.md,
                                                                            },
                                                                        }}
                                                                    >
                                                                        Manage Curriculum
                                                                    </Button>
                                                                </CardContent>
                                                            </Card>
                                                        </Zoom>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Box>
                                </Fade>
                            );
                        })}
                    </Box>

                    {/* Empty State */}
                    {courses && courses.length === 0 && (
                        <Fade in={mounted} timeout={800}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 8,
                                    textAlign: 'center',
                                    borderRadius: universityTheme.borderRadius.xl,
                                    border: `2px dashed ${universityTheme.colors.neutral.light}`,
                                }}
                            >
                                <MdSchool size={64} color={universityTheme.colors.neutral.medium} />
                                <Typography
                                    sx={{
                                        mt: 2,
                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                        fontSize: '1.25rem',
                                        fontWeight: universityTheme.typography.fontWeight.semibold,
                                        color: universityTheme.colors.neutral.dark,
                                    }}
                                >
                                    No Courses Available
                                </Typography>
                                <Typography sx={{ color: universityTheme.colors.neutral.medium, mt: 1 }}>
                                    Courses will appear here once they are added to the system.
                                </Typography>
                            </Paper>
                        </Fade>
                    )}
                </Box>
            </Fade>
        </Container>
    );
};

export default CurriculumManager;
