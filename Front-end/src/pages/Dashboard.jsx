import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Chip,
    LinearProgress,
    Container,
    Fade,
    Zoom,
    Card,
    CardContent,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    MdSchool,
    MdComputer,
    MdPeople,
    MdAssignmentTurnedIn,
    MdRefresh,
    MdDashboard,
    MdTrendingUp,
    MdArrowForward
} from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardStats } from '../features/dashboard/dashboardSlice';
import { fetchTeachers } from '../features/teachers/teachersSlice';
import { fetchStudents } from '../features/students/studentsSlice';
import { fetchLabSessions } from '../features/labs/labsSlice';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import universityTheme from '../theme/universityTheme';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const { stats: dashboardStats, isLoading: statsLoading } = useSelector((state) => state.dashboard);
    const { items: teachers, pagination: teacherPagination, loading: teachersLoading } = useSelector((state) => state.teachers);
    const { items: students, pagination: studentPagination, loading: studentsLoading } = useSelector((state) => state.students);
    const { sessions: allSessions, loading: sessionsLoading } = useSelector((state) => state.labs);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mounted, setMounted] = useState(false);
    const [hoveredStat, setHoveredStat] = useState(null);

    useEffect(() => {
        setMounted(true);
        dispatch(fetchDashboardStats());
        dispatch(fetchTeachers({ size: 1000 })); // Fetch all for count if pagination not handled
        dispatch(fetchStudents({ size: 1 })); // Just need total count from pagination
        dispatch(fetchLabSessions({ size: 100 })); // Fetch recent sessions for charts
    }, [dispatch]);

    // Data Processing for Charts
    const sessionData = useMemo(() => {
        // Prefer data from dashboard stats API if available
        if (dashboardStats?.sessionData && dashboardStats.sessionData.length > 0) {
            return dashboardStats.sessionData;
        }

        if (!allSessions || allSessions.length === 0) return [];

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekData = days.map(day => ({ name: day, sessions: 0, students: 0 }));

        allSessions.forEach(session => {
            if (!session.sessionDate) return;
            // Parse date manually to avoid timezone shifts for YYYY-MM-DD
            const [year, month, day] = session.sessionDate.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const dayIndex = date.getDay();
            if (weekData[dayIndex]) {
                weekData[dayIndex].sessions += 1;
                weekData[dayIndex].students += (session.presentCount || 0);
            }
        });

        return [...weekData.slice(1), weekData[0]]; // Mon-Sun
    }, [allSessions, dashboardStats]);

    const attendanceTrend = useMemo(() => {
        // Prefer data from dashboard stats API if available
        if (dashboardStats?.attendanceTrend && dashboardStats.attendanceTrend.length > 0) {
            return dashboardStats.attendanceTrend;
        }

        if (!allSessions || allSessions.length === 0) return [];

        // Group by date, last 7 unique dates
        const dateMap = {};
        allSessions.forEach(session => {
            if (session.status === 'COMPLETED' && session.sessionDate) {
                const date = session.sessionDate; // YYYY-MM-DD
                if (!dateMap[date]) {
                    dateMap[date] = { date, totalPercentage: 0, count: 0 };
                }
                const percentage = session.totalStudents > 0
                    ? (session.presentCount / session.totalStudents) * 100
                    : 0;
                dateMap[date].totalPercentage += percentage;
                dateMap[date].count += 1;
            }
        });

        const trend = Object.values(dateMap)
            .map(d => {
                const [year, month, day] = d.date.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day);
                return {
                    date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    percentage: Math.round(d.totalPercentage / d.count),
                    rawDate: d.date
                };
            })
            .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))
            .slice(-7); // Last 7 days with data

        return trend.length > 0 ? trend : [{ date: 'Today', percentage: 0 }];
    }, [allSessions, dashboardStats]);

    const userDistData = useMemo(() => {
        return [
            { name: 'Students', value: studentPagination?.totalElements || students?.length || 0, color: universityTheme.colors.primary.main },
            { name: 'Teachers', value: teacherPagination?.totalElements || teachers?.length || 0, color: universityTheme.colors.accent.main },
            { name: 'Admins', value: 3, color: universityTheme.colors.secondary.main }, // Hardcoded for now as we don't fetch admins
        ];
    }, [studentPagination, students, teacherPagination, teachers]);

    const stats = [
        {
            label: 'Total Courses',
            value: dashboardStats?.totalCourses || 0,
            icon: MdSchool,
            color: universityTheme.colors.primary.main,
            gradient: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.primary.light} 100%)`,
            path: '/courses'
        },
        {
            label: 'Active Sessions',
            value: dashboardStats?.activeSessions || 0,
            icon: MdComputer,
            color: universityTheme.colors.accent.main,
            gradient: `linear-gradient(135deg, ${universityTheme.colors.accent.main} 0%, ${universityTheme.colors.accent.light} 100%)`,
            path: '/labs'
        },
        {
            label: 'Total Students',
            value: dashboardStats?.totalStudents || 0,
            icon: MdPeople,
            color: universityTheme.colors.secondary.main,
            gradient: `linear-gradient(135deg, ${universityTheme.colors.secondary.main} 0%, ${universityTheme.colors.secondary.light} 100%)`,
            path: '/students'
        },
        {
            label: 'Absent Today',
            value: dashboardStats?.absentToday || 0,
            icon: MdAssignmentTurnedIn,
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            path: '/labs/history'
        },
    ];

    const quickActions = [
        {
            title: 'Curriculum',
            subtitle: 'Semesters & Subjects',
            icon: MdSchool,
            color: universityTheme.colors.primary.main,
            actions: [
                { label: 'Manage Semesters', path: '/curriculum' },
                { label: 'Create New Course', path: '/courses/new' },
            ]
        },
        {
            title: 'Students',
            subtitle: 'Enrollment & Cohorts',
            icon: MdPeople,
            color: universityTheme.colors.accent.main,
            actions: [
                { label: 'Enroll in Semester', path: '/students/enroll' },
                { label: 'Student Directory', path: '/students' },
            ]
        },
        {
            title: 'Lab Operations',
            subtitle: 'Sessions & Rooms',
            icon: MdComputer,
            color: universityTheme.colors.secondary.main,
            actions: [
                { label: 'Schedule Session', path: '/labs/new' },
                { label: 'Add Laboratory', path: '/labs/new-lab' },
                { label: 'View Lab History', path: '/labs/history' },
            ]
        },
    ];

    const isLoading = statsLoading; // Use main stats loading for simplicity

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
            <Fade in={mounted} timeout={600}>
                <Box>
                    {/* Header */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 5 },
                            mb: { xs: 4, md: 6 },
                            borderRadius: universityTheme.borderRadius.xl,
                            background: `linear-gradient(135deg, ${universityTheme.colors.primary.dark} 0%, ${universityTheme.colors.primary.main} 100%)`,
                            color: universityTheme.colors.primary.contrast,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: `0 20px 40px ${universityTheme.colors.primary.main}30`,
                        }}
                    >
                        {/* Glassmorphism overlays */}
                        <Box sx={{
                            position: 'absolute',
                            top: '-50px',
                            right: '-50px',
                            width: '300px',
                            height: '300px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.15)',
                            filter: 'blur(60px)',
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            bottom: '-100px',
                            left: '-100px',
                            width: '400px',
                            height: '400px',
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.1)',
                            filter: 'blur(80px)',
                        }} />

                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Box sx={{
                                        width: { xs: 60, md: 80 },
                                        height: { xs: 60, md: 80 },
                                        borderRadius: universityTheme.borderRadius.lg,
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2)'
                                    }}>
                                        <MdDashboard size={isMobile ? 32 : 44} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h3" sx={{
                                            fontWeight: 900,
                                            fontSize: { xs: '1.5rem', md: '2.5rem' },
                                            letterSpacing: '-0.03em',
                                            mb: 0.5,
                                            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}>
                                            System Intelligence
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            fontSize: { xs: '0.9rem', md: '1.25rem' },
                                            opacity: 0.9,
                                            fontWeight: 500
                                        }}>
                                            {universityTheme.university.name} • Control Center
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5 }}>
                                    <Typography sx={{ 
                                        px: 2, 
                                        py: 0.75, 
                                        bgcolor: 'rgba(255, 255, 255, 0.15)', 
                                        backdropFilter: 'blur(5px)',
                                        borderRadius: '30px',
                                        fontSize: '0.875rem', 
                                        fontWeight: 700,
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}>
                                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<MdRefresh />}
                                        onClick={() => {
                                            dispatch(fetchDashboardStats());
                                            dispatch(fetchTeachers({ page: 0, size: 1000 }));
                                            dispatch(fetchStudents({ page: 0, size: 1 }));
                                            dispatch(fetchLabSessions({ page: 0, size: 100 }));
                                        }}
                                        sx={{
                                            bgcolor: '#fff',
                                            color: universityTheme.colors.primary.main,
                                            borderRadius: universityTheme.borderRadius.lg,
                                            textTransform: 'none',
                                            fontWeight: 800,
                                            px: 3,
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.9)',
                                                transform: 'translateY(-2px)'
                                            },
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Sync Analytics
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Stats Grid */}
                    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 5 } }}>
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            const isHovered = hoveredStat === idx;

                            return (
                                <Grid item xs={12} sm={6} lg={3} key={idx}>
                                    <Zoom in={mounted} timeout={800 + idx * 100}>
                                        <Card
                                            onMouseEnter={() => setHoveredStat(idx)}
                                            onMouseLeave={() => setHoveredStat(null)}
                                            onClick={() => stat.path && navigate(stat.path)}
                                            sx={{
                                                cursor: stat.path ? 'pointer' : 'default',
                                                borderRadius: universityTheme.borderRadius.xl,
                                                border: `2px solid ${isHovered ? stat.color : universityTheme.colors.neutral.light}`,
                                                boxShadow: isHovered ? universityTheme.shadows.xl : universityTheme.shadows.md,
                                                transition: 'all 0.3s ease',
                                                transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                                            }}
                                        >
                                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                                <Box
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: universityTheme.borderRadius.lg,
                                                        background: isHovered ? stat.gradient : `${stat.color}15`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mb: 2,
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    <Icon
                                                        size={28}
                                                        color={isHovered ? universityTheme.colors.neutral.white : stat.color}
                                                    />
                                                </Box>
                                                <Typography
                                                    sx={{
                                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                                        fontSize: '2rem',
                                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                                        color: universityTheme.colors.neutral.dark,
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {isLoading ? '...' : stat.value}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        color: universityTheme.colors.neutral.medium,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        fontWeight: universityTheme.typography.fontWeight.semibold,
                                                    }}
                                                >
                                                    {stat.label}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Zoom>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Quick Actions */}
                    <Typography
                        sx={{
                            fontFamily: universityTheme.typography.fontFamily.heading,
                            fontSize: '1.5rem',
                            fontWeight: universityTheme.typography.fontWeight.bold,
                            color: universityTheme.colors.neutral.dark,
                            mb: 3,
                        }}
                    >
                        Quick Actions
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {quickActions.map((section, idx) => {
                            const Icon = section.icon;

                            return (
                                <Grid item xs={12} md={4} key={idx}>
                                    <Fade in={mounted} timeout={1000 + idx * 200}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: universityTheme.borderRadius.xl,
                                                border: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                                                bgcolor: '#fff',
                                                boxShadow: universityTheme.shadows.md,
                                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                '&:hover': {
                                                    boxShadow: universityTheme.shadows.xl,
                                                    transform: 'translateY(-10px)',
                                                    borderColor: section.color,
                                                    '& .action-icon': {
                                                        bgcolor: section.color,
                                                        color: '#fff',
                                                        transform: 'scale(1.1) rotate(10deg)'
                                                    }
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
                                                <Box
                                                    className="action-icon"
                                                    sx={{
                                                        width: 52,
                                                        height: 52,
                                                        borderRadius: universityTheme.borderRadius.lg,
                                                        bgcolor: `${section.color}10`,
                                                        color: section.color,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    <Icon size={26} />
                                                </Box>
                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            fontFamily: universityTheme.typography.fontFamily.heading,
                                                            fontSize: '1.25rem',
                                                            fontWeight: 900,
                                                            color: universityTheme.colors.neutral.gray[900],
                                                            letterSpacing: '-0.02em'
                                                        }}
                                                    >
                                                        {section.title}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.8rem',
                                                            color: universityTheme.colors.neutral.gray[400],
                                                            fontWeight: 600,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }}
                                                    >
                                                        {section.subtitle}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {section.actions.map((action, actionIdx) => (
                                                    <Button
                                                        key={actionIdx}
                                                        fullWidth
                                                        onClick={() => navigate(action.path)}
                                                        endIcon={<MdArrowForward size={14} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />}
                                                        className="group"
                                                        sx={{
                                                            justifyContent: 'space-between',
                                                            color: universityTheme.colors.neutral.gray[600],
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '0.85rem',
                                                            borderRadius: universityTheme.borderRadius.lg,
                                                            py: 1.25,
                                                            px: 2,
                                                            '&:hover': {
                                                                bgcolor: `${section.color}08`,
                                                                color: section.color,
                                                            },
                                                        }}
                                                    >
                                                        {action.label}
                                                    </Button>
                                                ))}
                                            </Box>
                                        </Paper>
                                    </Fade>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Charts Section */}
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {/* Lab Usage Bar Chart */}
                        <Grid item xs={12} lg={8}>
                            <Fade in={mounted} timeout={1200}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, md: 3 },
                                        borderRadius: universityTheme.borderRadius.xl,
                                        border: `1px solid ${universityTheme.colors.neutral.light}`,
                                        boxShadow: universityTheme.shadows.md,
                                        height: '100%',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                                                    fontWeight: 900,
                                                    color: universityTheme.colors.neutral.gray[900],
                                                    mb: 0.5,
                                                    letterSpacing: '-0.01em'
                                                }}
                                            >
                                                Lab Usage Analysis
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                                    color: universityTheme.colors.neutral.gray[500],
                                                    fontWeight: 500
                                                }}
                                            >
                                                7-day throughput & activity levels
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: universityTheme.colors.primary.main }} />
                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: universityTheme.colors.neutral.gray[600], textTransform: 'uppercase' }}>Sessions</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${universityTheme.colors.primary.main}30` }} />
                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: universityTheme.colors.neutral.gray[600], textTransform: 'uppercase' }}>Students</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ height: { xs: 250, md: 300 } }}>
                                        {sessionsLoading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : sessionData.length === 0 || sessionData.every(d => d.sessions === 0) ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: universityTheme.colors.neutral.medium }}>
                                                <MdComputer size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>No lab session data available</Typography>
                                                <Typography sx={{ fontSize: '0.75rem', opacity: 0.7, mt: 0.5 }}>Sessions will appear here once scheduled and conducted</Typography>
                                            </Box>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={sessionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={universityTheme.colors.neutral.light} />
                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: universityTheme.colors.neutral.medium, fontSize: 10, fontWeight: 600 }}
                                                        interval={isMobile ? 1 : 0}
                                                    />
                                                    <YAxis hide />
                                                    <ReTooltip
                                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                        contentStyle={{
                                                            borderRadius: universityTheme.borderRadius.lg,
                                                            border: 'none',
                                                            boxShadow: universityTheme.shadows.lg
                                                        }}
                                                    />
                                                    <Bar name="Sessions" dataKey="sessions" fill={universityTheme.colors.primary.main} radius={[4, 4, 0, 0]} barSize={isMobile ? 12 : 20} />
                                                    <Bar name="Students" dataKey="students" fill={`${universityTheme.colors.primary.main}30`} radius={[4, 4, 0, 0]} barSize={isMobile ? 12 : 20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </Box>
                                </Paper>
                            </Fade>
                        </Grid>

                        {/* User Distribution Pie Chart */}
                        <Grid item xs={12} lg={4}>
                            <Fade in={mounted} timeout={1200}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, md: 3 },
                                        borderRadius: universityTheme.borderRadius.xl,
                                        border: `1px solid ${universityTheme.colors.neutral.light}`,
                                        boxShadow: universityTheme.shadows.md,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Box sx={{ mb: 3 }}>
                                        <Typography
                                            sx={{
                                                fontFamily: universityTheme.typography.fontFamily.heading,
                                                fontSize: { xs: '1.1rem', md: '1.25rem' },
                                                fontWeight: 900,
                                                color: universityTheme.colors.neutral.gray[900],
                                                mb: 0.5,
                                                letterSpacing: '-0.01em'
                                            }}
                                        >
                                            User Demographics
                                        </Typography>
                                        <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, color: universityTheme.colors.neutral.gray[500], fontWeight: 500 }}>
                                            Role-based account distribution
                                        </Typography>
                                    </Box>
                                    <Box sx={{ height: 220, position: 'relative', flexGrow: 1 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={userDistData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={90}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {userDistData.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={entry.color}
                                                            style={{ filter: `drop-shadow(0 4px 8px ${entry.color}40)` }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <ReTooltip
                                                    contentStyle={{
                                                        borderRadius: universityTheme.borderRadius.lg,
                                                        border: 'none',
                                                        boxShadow: universityTheme.shadows.lg,
                                                        fontWeight: 800
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], letterSpacing: '-0.05em' }}>
                                                {userDistData.reduce((acc, curr) => acc + curr.value, 0)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
                                                Total
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                                        {userDistData.map((item, i) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: universityTheme.colors.neutral.gray[50], px: 1.5, py: 0.5, borderRadius: '20px' }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[700], fontSize: '0.65rem', textTransform: 'uppercase' }}>
                                                    {item.name}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            </Fade>
                        </Grid>

                        {/* Attendance Trend Area Chart */}
                        <Grid item xs={12}>
                            <Fade in={mounted} timeout={1400}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, md: 3 },
                                        borderRadius: universityTheme.borderRadius.xl,
                                        border: `1px solid ${universityTheme.colors.neutral.light}`,
                                        boxShadow: universityTheme.shadows.md,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                                                    fontWeight: 900,
                                                    color: universityTheme.colors.neutral.gray[900],
                                                    mb: 0.5,
                                                    letterSpacing: '-0.01em'
                                                }}
                                            >
                                                Daily Attendance Trend
                                            </Typography>
                                            <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, color: universityTheme.colors.neutral.gray[500], fontWeight: 500 }}>
                                                Average attendance % across completed sessions
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ height: 250 }}>
                                        {sessionsLoading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : attendanceTrend.length === 0 || (attendanceTrend.length === 1 && attendanceTrend[0].date === 'Today' && attendanceTrend[0].percentage === 0) ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: universityTheme.colors.neutral.medium }}>
                                                <MdTrendingUp size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>No attendance data yet</Typography>
                                                <Typography sx={{ fontSize: '0.75rem', opacity: 0.7, mt: 0.5 }}>Trends will populate as sessions are completed</Typography>
                                            </Box>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={attendanceTrend}>
                                                    <defs>
                                                        <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={universityTheme.colors.accent.main} stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor={universityTheme.colors.accent.main} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={universityTheme.colors.neutral.light} />
                                                    <XAxis
                                                        dataKey="date"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: universityTheme.colors.neutral.medium, fontSize: 11, fontWeight: 600 }}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: universityTheme.colors.neutral.medium, fontSize: 10, fontWeight: 600 }}
                                                        domain={[0, 100]}
                                                        tickFormatter={(v) => `${v}%`}
                                                    />
                                                    <ReTooltip
                                                        contentStyle={{
                                                            borderRadius: universityTheme.borderRadius.lg,
                                                            border: 'none',
                                                            boxShadow: universityTheme.shadows.lg
                                                        }}
                                                        formatter={(value) => [`${value}%`, 'Attendance']}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="percentage"
                                                        stroke={universityTheme.colors.accent.main}
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorPercentage)"
                                                        dot={{ r: 4, fill: universityTheme.colors.accent.main, strokeWidth: 2, stroke: '#fff' }}
                                                        activeDot={{ r: 6, fill: universityTheme.colors.accent.main, strokeWidth: 2, stroke: '#fff' }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}
                                    </Box>
                                </Paper>
                            </Fade>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
        </Container>
    );
};

export default AdminDashboard;
