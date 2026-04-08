import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Divider,
    Alert,
    Avatar,
    IconButton,
    Tooltip,
    CircularProgress,
    LinearProgress,
    useTheme,
    useMediaQuery,
    Container,
    Fade,
    Zoom
} from '@mui/material';
import {
    MdQrCode,
    MdPlayArrow,
    MdStop,
    MdPeople,
    MdSchedule,
    MdCheckCircle,
    MdHistory,
    MdRefresh,
    MdSearch,
    MdScience,
    MdAccessTime,
    MdDashboard,
    MdArrowForward
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { generateCode, fetchLabSessionById, fetchTeacherSessions } from '../features/labs/labsSlice';
import universityTheme from '../theme/universityTheme';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartTooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { sessions, loading: labsLoading, activeCodes } = useSelector((state) => state.labs);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mounted, setMounted] = useState(false);
    const [hoveredStat, setHoveredStat] = useState(null);

    // Dynamic Stats
    const today = new Date().toISOString().split('T')[0];
    const activeSessions = sessions.filter(s => s.status === 'ONGOING');
    const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED' || s.status === 'UPDATED');
    const completedToday = sessions.filter(s => s.status === 'COMPLETED' && s.sessionDate === today);
    const totalWeekly = sessions.filter(s => {
        const d = new Date(s.sessionDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d.setDate(diff));
        return weekStart <= new Date();
    });

    // Chart Data Preparation
    const attendanceData = sessions
        .filter(s => s.status === 'COMPLETED')
        .slice(-6)
        .map(s => ({
            name: s.subject.subjectCode,
            rate: Math.round((s.presentCount / s.totalStudents) * 100) || 0,
            present: s.presentCount,
            total: s.totalStudents
        }));

    useEffect(() => {
        setMounted(true);
        if (user?.id) {
            dispatch(fetchTeacherSessions(user.id));
        }
    }, [dispatch, user?.id]);

    const handleGenerateCode = (sessionId, type) => {
        dispatch(generateCode({ sessionId, type }));
    };

    const currentCodes = (sessionId) => activeCodes[sessionId] || {};

    if (labsLoading && !sessions.length) {
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

    const stats = [
        {
            label: 'Live Sessions',
            value: activeSessions.length,
            icon: MdSchedule,
            color: universityTheme.colors.primary.main,
            gradient: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.primary.light} 100%)`,
        },
        {
            label: 'Upcoming',
            value: upcomingSessions.length,
            icon: MdPeople,
            color: universityTheme.colors.accent.main,
            gradient: `linear-gradient(135deg, ${universityTheme.colors.accent.main} 0%, ${universityTheme.colors.accent.light} 100%)`,
        },
        {
            label: 'Done Today',
            value: completedToday.length,
            icon: MdCheckCircle,
            color: universityTheme.colors.secondary.main,
            gradient: `linear-gradient(135deg, ${universityTheme.colors.secondary.main} 0%, ${universityTheme.colors.secondary.light} 100%)`,
        },
        {
            label: 'Week Log',
            value: totalWeekly.length,
            icon: MdHistory,
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            path: '/teacher/history'
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Fade in={mounted} timeout={600}>
                <Box>
                    {/* Header */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, md: 4 },
                            mb: { xs: 3, md: 5 },
                            borderRadius: universityTheme.borderRadius.xl,
                            background: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.accent.main} 100%)`,
                            color: universityTheme.colors.primary.contrast,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Decorative circles - Adjusted for mobile */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '-20%',
                                right: '-5%',
                                width: { xs: '150px', md: '250px' },
                                height: { xs: '150px', md: '250px' },
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '-30%',
                                left: '-3%',
                                width: { xs: '120px', md: '200px' },
                                height: { xs: '120px', md: '200px' },
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.08)',
                            }}
                        />

                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: { xs: 2, md: 3 }, mb: 2 }}>
                                <Box
                                    sx={{
                                        width: { xs: 48, md: 64 },
                                        height: { xs: 48, md: 64 },
                                        borderRadius: universityTheme.borderRadius.lg,
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <MdDashboard size={isMobile ? 24 : 32} />
                                </Box>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontFamily: universityTheme.typography.fontFamily.heading,
                                            fontSize: { xs: '1.25rem', md: '1.75rem' },
                                            fontWeight: universityTheme.typography.fontWeight.bold,
                                            mb: 0.5,
                                        }}
                                    >
                                        Welcome, {user?.firstName || 'Teacher'}!
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: '0.875rem', md: '1.125rem' },
                                            opacity: 0.95,
                                        }}
                                    >
                                        Teacher Portal
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mt: 2, gap: 2 }}>
                                <Typography sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<MdRefresh />}
                                    onClick={() => dispatch(fetchTeacherSessions(user.id))}
                                    sx={{
                                        color: universityTheme.colors.primary.contrast,
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        borderRadius: universityTheme.borderRadius.lg,
                                        textTransform: 'none',
                                        fontWeight: universityTheme.typography.fontWeight.semibold,
                                        width: { xs: '100%', sm: 'auto' },
                                        '&:hover': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    Refresh
                                </Button>
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
                                                        width: { xs: 48, md: 56 },
                                                        height: { xs: 48, md: 56 },
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
                                                        size={isMobile ? 24 : 28}
                                                        color={isHovered ? universityTheme.colors.neutral.white : stat.color}
                                                    />
                                                </Box>
                                                <Typography
                                                    sx={{
                                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                                        fontSize: { xs: '1.5rem', md: '2rem' },
                                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                                        color: universityTheme.colors.neutral.dark,
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {stat.value}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: { xs: '0.65rem', md: '0.75rem' },
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

                    {/* Deep Analysis Section */}
                    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 5 } }}>
                        <Grid item xs={12} lg={8}>
                            <Fade in={mounted} timeout={1000}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, md: 4 },
                                        borderRadius: universityTheme.borderRadius.xl,
                                        border: `1px solid ${universityTheme.colors.neutral.light}`,
                                        boxShadow: universityTheme.shadows.md,
                                        height: '100%',
                                    }}
                                >
                                    <Box sx={{ mb: { xs: 2, md: 4 } }}>
                                        <Typography
                                            sx={{
                                                fontFamily: universityTheme.typography.fontFamily.heading,
                                                fontSize: { xs: '1.1rem', md: '1.25rem' },
                                                fontWeight: universityTheme.typography.fontWeight.bold,
                                                color: universityTheme.colors.neutral.dark,
                                            }}
                                        >
                                            Attendance Analytics
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                                color: universityTheme.colors.neutral.medium,
                                            }}
                                        >
                                            Recent completed sessions performance (%)
                                        </Typography>
                                    </Box>
                                    <Box sx={{ height: { xs: 250, md: 300 } }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={attendanceData}>
                                                <defs>
                                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={universityTheme.colors.primary.main} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={universityTheme.colors.primary.main} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={universityTheme.colors.neutral.light} />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: universityTheme.colors.neutral.medium, fontSize: 10, fontWeight: 600 }}
                                                    interval={isMobile ? 1 : 0}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: universityTheme.colors.neutral.medium, fontSize: 10, fontWeight: 600 }}
                                                    unit="%"
                                                />
                                                <RechartTooltip
                                                    contentStyle={{
                                                        borderRadius: universityTheme.borderRadius.lg,
                                                        border: 'none',
                                                        boxShadow: universityTheme.shadows.lg
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="rate"
                                                    stroke={universityTheme.colors.primary.main}
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorRate)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Paper>
                            </Fade>
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <Fade in={mounted} timeout={1100}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, md: 4 },
                                        borderRadius: universityTheme.borderRadius.xl,
                                        bgcolor: universityTheme.colors.neutral.dark,
                                        color: universityTheme.colors.neutral.white,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: universityTheme.shadows.lg,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: universityTheme.typography.fontWeight.bold, mb: 0.5 }}>
                                            Quick Insights
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.7, mb: 4 }}>
                                            Auto-generated performance audit
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600, textTransform: 'uppercase' }}>
                                                        Avg. Attendance
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: universityTheme.colors.accent.light, fontWeight: 700 }}>
                                                        {attendanceData.length > 0 ? Math.round(attendanceData.reduce((acc, v) => acc + v.rate, 0) / attendanceData.length) : 0}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={attendanceData.length > 0 ? attendanceData.reduce((acc, v) => acc + v.rate, 0) / attendanceData.length : 0}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': { bgcolor: universityTheme.colors.accent.main }
                                                    }}
                                                />
                                            </Box>
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600, textTransform: 'uppercase' }}>
                                                        Utilization Rate
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: universityTheme.colors.secondary.light, fontWeight: 700 }}>
                                                        {activeSessions.length + completedToday.length > 0 ? 'Optimal' : 'Low'}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={75}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': { bgcolor: universityTheme.colors.secondary.main }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => navigate('/attendance')}
                                        sx={{
                                            mt: 4,
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            color: universityTheme.colors.neutral.white,
                                            borderRadius: universityTheme.borderRadius.lg,
                                            py: 1.5,
                                            '&:hover': {
                                                borderColor: 'rgba(255,255,255,0.5)',
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                            },
                                        }}
                                    >
                                        Export Full Analysis
                                    </Button>
                                </Paper>
                            </Fade>
                        </Grid>
                    </Grid>

                    {/* Active Sessions with Code Generation */}
                    {activeSessions.length > 0 && (
                        <Fade in={mounted} timeout={1200}>
                            <Box sx={{ mb: { xs: 3, md: 5 } }}>
                                <Typography
                                    sx={{
                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                        color: universityTheme.colors.neutral.dark,
                                        mb: { xs: 2, md: 3 },
                                    }}
                                >
                                    Active Lab Sessions
                                </Typography>

                                <Grid container spacing={{ xs: 2, md: 3 }}>
                                    {activeSessions.map((session) => (
                                        <Grid item xs={12} key={session.id}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: { xs: 2, md: 4 },
                                                    borderRadius: universityTheme.borderRadius.xl,
                                                    border: `2px solid ${universityTheme.colors.secondary.main}`,
                                                    background: `linear-gradient(135deg, ${universityTheme.colors.neutral.white} 0%, #fafafa 100%)`,
                                                    boxShadow: universityTheme.shadows.md,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 3, md: 4 }, gap: 2 }}>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                            <Chip
                                                                label="LIVE"
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: '#22c55e',
                                                                    color: 'white',
                                                                    fontWeight: 800,
                                                                    height: 24,
                                                                    fontSize: '0.7rem',
                                                                }}
                                                            />
                                                            <Typography variant="h5" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                                                {session.subject.subjectName}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium, fontWeight: 500 }}>
                                                            {session.lab.labName} • {session.startTime} - {session.endTime}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<MdAccessTime />}
                                                            onClick={() => navigate(`/labs/reschedule/${session.id}`)}
                                                            fullWidth={isMobile}
                                                            sx={{
                                                                borderColor: universityTheme.colors.primary.light,
                                                                color: universityTheme.colors.primary.main,
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                                textTransform: 'none',
                                                            }}
                                                        >
                                                            Reschedule
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => navigate(`/labs/session/${session.id}`)}
                                                            fullWidth={isMobile}
                                                            sx={{
                                                                bgcolor: universityTheme.colors.neutral.dark,
                                                                color: 'white',
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                                textTransform: 'none',
                                                                '&:hover': { bgcolor: 'black' }
                                                            }}
                                                        >
                                                            Control Hub
                                                        </Button>
                                                    </Box>
                                                </Box>

                                                <Divider sx={{ mb: { xs: 3, md: 4 } }} />

                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: universityTheme.colors.neutral.dark, mb: { xs: 2, md: 3 } }}>
                                                    Attendance Verification Codes
                                                </Typography>

                                                <Grid container spacing={{ xs: 2, md: 3 }}>
                                                    <Grid item xs={12} md={6}>
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                p: 3,
                                                                bgcolor: `${universityTheme.colors.primary.main}10`,
                                                                border: `1px solid ${universityTheme.colors.primary.main}30`,
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                <Typography variant="caption" sx={{ color: universityTheme.colors.primary.main, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                                    Entry Code
                                                                </Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleGenerateCode(session.id, 'entry')}
                                                                    sx={{ color: universityTheme.colors.primary.main }}
                                                                >
                                                                    <MdRefresh />
                                                                </IconButton>
                                                            </Box>

                                                            <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {currentCodes(session.id).entry ? (
                                                                    <Typography variant="h3" sx={{ fontWeight: 900, color: universityTheme.colors.primary.main, letterSpacing: '0.1em', fontSize: { xs: '2rem', md: '3rem' } }}>
                                                                        {currentCodes(session.id).entry}
                                                                    </Typography>
                                                                ) : (
                                                                    <MdQrCode size={40} color={universityTheme.colors.primary.light} style={{ opacity: 0.5 }} />
                                                                )}
                                                            </Box>

                                                            <Button
                                                                fullWidth
                                                                variant="contained"
                                                                startIcon={<MdPlayArrow />}
                                                                onClick={() => handleGenerateCode(session.id, 'entry')}
                                                                sx={{
                                                                    mt: 2,
                                                                    bgcolor: universityTheme.colors.primary.main,
                                                                    borderRadius: universityTheme.borderRadius.lg,
                                                                    textTransform: 'none',
                                                                }}
                                                            >
                                                                {currentCodes(session.id).entry ? 'Refresh Code' : 'Generate Entry Code'}
                                                            </Button>
                                                        </Paper>
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                p: 3,
                                                                bgcolor: '#fff1f2',
                                                                border: '1px solid #fecdd3',
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                <Typography variant="caption" sx={{ color: '#be123c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                                    Exit Code
                                                                </Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleGenerateCode(session.id, 'exit')}
                                                                    sx={{ color: '#be123c' }}
                                                                >
                                                                    <MdRefresh />
                                                                </IconButton>
                                                            </Box>

                                                            <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {currentCodes(session.id).exit ? (
                                                                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#be123c', letterSpacing: '0.1em', fontSize: { xs: '2rem', md: '3rem' } }}>
                                                                        {currentCodes(session.id).exit}
                                                                    </Typography>
                                                                ) : (
                                                                    <MdQrCode size={40} color="#fda4af" style={{ opacity: 0.5 }} />
                                                                )}
                                                            </Box>

                                                            <Button
                                                                fullWidth
                                                                variant="contained"
                                                                startIcon={<MdStop />}
                                                                onClick={() => handleGenerateCode(session.id, 'exit')}
                                                                sx={{
                                                                    mt: 2,
                                                                    bgcolor: universityTheme.colors.neutral.dark,
                                                                    borderRadius: universityTheme.borderRadius.lg,
                                                                    textTransform: 'none',
                                                                    '&:hover': { bgcolor: 'black' }
                                                                }}
                                                            >
                                                                {currentCodes(session.id).exit ? 'Refresh Code' : 'Generate Exit Code'}
                                                            </Button>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Fade>
                    )}

                    {activeSessions.length === 0 && (
                        <Fade in={mounted} timeout={1200}>
                            <Alert
                                severity="info"
                                icon={<MdSchedule size={24} />}
                                sx={{
                                    mb: 5,
                                    borderRadius: universityTheme.borderRadius.lg,
                                    '& .MuiAlert-message': { fontWeight: 500 }
                                }}
                            >
                                No active lab sessions at the moment. Your upcoming sessions are listed below.
                            </Alert>
                        </Fade>
                    )}

                    {/* Upcoming Sessions */}
                    <Box sx={{ mb: { xs: 3, md: 5 } }}>
                        <Typography
                            sx={{
                                fontFamily: universityTheme.typography.fontFamily.heading,
                                fontSize: { xs: '1.25rem', md: '1.5rem' },
                                fontWeight: universityTheme.typography.fontWeight.bold,
                                color: universityTheme.colors.neutral.dark,
                                mb: { xs: 2, md: 3 },
                            }}
                        >
                            Upcoming Lab Sessions
                        </Typography>

                        <Grid container spacing={3}>
                            {upcomingSessions.map((session, index) => {
                                const now = new Date();
                                const today = now.toISOString().split('T')[0];
                                const currentTime = now.getHours() * 60 + now.getMinutes();

                                const [startHour, startMin] = session.startTime.split(':').map(Number);
                                const [endHour, endMin] = session.endTime.split(':').map(Number);
                                const startTimeInMin = startHour * 60 + startMin;
                                const endTimeInMin = endHour * 60 + endMin;

                                const isToday = session.sessionDate === today;
                                const isReady = isToday && currentTime >= (startTimeInMin - 15) && currentTime < endTimeInMin;

                                return (
                                    <Grid item xs={12} md={6} key={session.id}>
                                        <Fade in={mounted} timeout={1200 + index * 100}>
                                            <Card
                                                sx={{
                                                    borderRadius: universityTheme.borderRadius.xl,
                                                    border: `1px solid ${isReady ? universityTheme.colors.primary.light : universityTheme.colors.neutral.light}`,
                                                    bgcolor: isReady ? `${universityTheme.colors.primary.main}05` : 'white',
                                                    boxShadow: universityTheme.shadows.sm,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: universityTheme.shadows.md,
                                                        transform: 'translateY(-4px)',
                                                    },
                                                }}
                                            >
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                        <Box>
                                                            <Typography variant="h6" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark, lineHeight: 1.2, mb: 0.5 }}>
                                                                {session.subject.subjectName}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: universityTheme.colors.neutral.medium, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                {session.subject.subjectCode}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label={isReady ? 'READY' : session.status}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: isReady ? universityTheme.colors.primary.main : universityTheme.colors.neutral.light,
                                                                color: isReady ? 'white' : universityTheme.colors.neutral.dark,
                                                                fontWeight: 800,
                                                                fontSize: '0.65rem',
                                                                height: 24,
                                                            }}
                                                        />
                                                    </Box>

                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <MdSchedule color={universityTheme.colors.neutral.medium} />
                                                            <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.dark, fontWeight: 500 }}>
                                                                {session.sessionDate} • {session.startTime} - {session.endTime}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <MdScience color={universityTheme.colors.neutral.medium} />
                                                            <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.dark, fontWeight: 500 }}>
                                                                {session.lab.labName} - Room {session.lab.roomNumber}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                        <Button
                                                            fullWidth
                                                            variant="outlined"
                                                            onClick={() => navigate(`/labs/reschedule/${session.id}`)}
                                                            sx={{
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                                color: universityTheme.colors.neutral.medium,
                                                                borderColor: universityTheme.colors.neutral.light,
                                                                textTransform: 'none',
                                                            }}
                                                        >
                                                            Reschedule
                                                        </Button>
                                                        <Button
                                                            fullWidth
                                                            variant={isReady ? "contained" : "outlined"}
                                                            onClick={() => navigate(`/labs/session/${session.id}`)}
                                                            sx={{
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                                textTransform: 'none',
                                                                bgcolor: isReady ? universityTheme.colors.primary.main : 'transparent',
                                                                color: isReady ? 'white' : universityTheme.colors.neutral.dark,
                                                                borderColor: isReady ? 'transparent' : universityTheme.colors.neutral.light,
                                                            }}
                                                        >
                                                            {isReady ? 'Start Session' : 'Details'}
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Fade>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>

                    {/* Quick Actions */}
                    <Fade in={mounted} timeout={1400}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: universityTheme.borderRadius.xl,
                                border: `1px solid ${universityTheme.colors.neutral.light}`,
                                boxShadow: universityTheme.shadows.md,
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark, mb: 3 }}>
                                Quick Actions
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/labs/new')}
                                    sx={{
                                        borderRadius: universityTheme.borderRadius.lg,
                                        borderColor: universityTheme.colors.neutral.light,
                                        color: universityTheme.colors.neutral.dark,
                                        textTransform: 'none',
                                        px: 3,
                                        py: 1.5,
                                    }}
                                >
                                    Schedule New Session
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/teacher/history')}
                                    sx={{
                                        borderRadius: universityTheme.borderRadius.lg,
                                        borderColor: universityTheme.colors.neutral.light,
                                        color: universityTheme.colors.neutral.dark,
                                        textTransform: 'none',
                                        px: 3,
                                        py: 1.5,
                                    }}
                                >
                                    View My History
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/attendance')}
                                    sx={{
                                        borderRadius: universityTheme.borderRadius.lg,
                                        borderColor: universityTheme.colors.neutral.light,
                                        color: universityTheme.colors.neutral.dark,
                                        textTransform: 'none',
                                        px: 3,
                                        py: 1.5,
                                    }}
                                >
                                    Attendance Reports
                                </Button>
                            </Box>
                        </Paper>
                    </Fade>
                </Box>
            </Fade>
        </Container>
    );
};

export default TeacherDashboard;
