import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Avatar,
    LinearProgress,
    Button,
    CircularProgress,
    IconButton,
    Divider,
    Chip,
    useTheme,
    useMediaQuery,
    Container,
    Fade,
    Zoom,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Alert
} from '@mui/material';
import {
    MdSchool,
    MdPerson,
    MdEmail,
    MdArrowForward,
    MdCheckCircle,
    MdCancel,
    MdAccessTime,
    MdRefresh,
    MdExitToApp,
    MdOutlineVpnKey,
    MdDashboard,
    MdTimelapse,
    MdComputer,
    MdWarning
} from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStudentAttendanceSummary } from '../features/students/studentsSlice';
import { fetchActiveSessionForStudent, fetchDailySessionsForStudent, fetchTodayAttendance, submitAttendanceCode, clearLabError } from '../features/labs/labsSlice';
import universityTheme from '../theme/universityTheme';
import axiosInstance from '../api/axiosInstance';

import {
    ResponsiveContainer,
    Tooltip as RechartTooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { attendanceSummary } = useSelector((state) => state.students);
    const { studentActiveSession, dailySessions, todayAttendance, loading: labsLoading } = useSelector((state) => state.labs);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mounted, setMounted] = useState(false);

    const [openExit, setOpenExit] = React.useState(false);
    const [openJoin, setOpenJoin] = React.useState(false);
    const [selectedSession, setSelectedSession] = React.useState(null);
    const [exitCode, setExitCode] = React.useState(['', '', '', '', '', '']);
    const [entryCode, setEntryCode] = React.useState(['', '', '', '', '', '']);
    const [pcNumber, setPcNumber] = React.useState('');
    const [occupiedComputers, setOccupiedComputers] = React.useState([]);
    const [loadingOccupied, setLoadingOccupied] = React.useState(false);
    const [exitError, setExitError] = React.useState(null);
    const [joinError, setJoinError] = React.useState(null);

    useEffect(() => {
        setMounted(true);
        if (user?.id) {
            dispatch(fetchStudentAttendanceSummary(user.id));
            dispatch(fetchActiveSessionForStudent(user.id));
            dispatch(fetchDailySessionsForStudent(user.id));
            dispatch(fetchTodayAttendance(user.id));
        }
    }, [dispatch, user]);

    useEffect(() => {
        const fetchOccupied = async () => {
            if (!studentActiveSession?.id) return;
            setLoadingOccupied(true);
            try {
                const res = await axiosInstance.get(`/labs/sessions/${studentActiveSession.id}/occupied-computers`);
                setOccupiedComputers(res.data || []);
            } catch (err) {
                console.error('Failed to fetch occupied computers');
            } finally {
                setLoadingOccupied(false);
            }
        };

        if (openJoin && studentActiveSession) {
            fetchOccupied();
        }
    }, [openJoin, studentActiveSession]);

    const handleExitCodeInput = (index, value) => {
        if (value.length > 1) return;
        const newCode = [...exitCode];
        newCode[index] = value.toUpperCase();
        setExitCode(newCode);

        if (value && index < 5) {
            const nextInput = document.getElementById(`exit-code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleExitSubmit = async () => {
        const codeString = exitCode.join('');
        if (codeString.length < 6) return;

        setExitError(null);
        const result = await dispatch(submitAttendanceCode({
            sessionId: selectedSession.id,
            code: codeString,
            type: 'EXIT',
            studentId: user?.id
        }));

        if (!result.error) {
            setOpenExit(false);
            setExitCode(['', '', '', '', '', '']);
            dispatch(fetchTodayAttendance(user.id)); // Refresh status
        } else {
            setExitError(result.payload);
        }
    };

    const handleEntryCodeInput = (index, value) => {
        if (value.length > 1) return;
        const newCode = [...entryCode];
        newCode[index] = value.toUpperCase();
        setEntryCode(newCode);

        if (value && index < 5) {
            const nextInput = document.getElementById(`entry-code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleJoinSubmit = async () => {
        const codeString = entryCode.join('');
        if (codeString.length < 6) return;

        if (!pcNumber) {
            setJoinError('Please enter your Machine / Bench number');
            return;
        }

        if (occupiedComputers.some(pc => pc.toLowerCase() === pcNumber.toLowerCase())) {
            setJoinError('This computer is already occupied. Please use a different machine.');
            return;
        }

        setJoinError(null);
        const result = await dispatch(submitAttendanceCode({
            sessionId: studentActiveSession.id,
            code: codeString,
            type: 'ENTRY',
            studentId: user?.id,
            pcNumber: pcNumber
        }));

        if (!result.error) {
            setOpenJoin(false);
            setEntryCode(['', '', '', '', '', '']);
            setPcNumber('');
            dispatch(fetchTodayAttendance(user.id)); // Refresh status
        } else {
            setJoinError(result.payload);
        }
    };

    if (!user) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={48} sx={{ color: universityTheme.colors.primary.main }} />
        </Box>
    );

    const getAttendanceColor = (percentage) => {
        if (percentage >= 90) return universityTheme.colors.primary.main; // Excellent
        if (percentage >= 75) return universityTheme.colors.secondary.main; // Good (Gold)
        if (percentage >= 60) return universityTheme.colors.accent.main; // Average
        return '#ef4444'; // Risk (Red)
    };

    const getAttendanceBgClass = (percentage) => {
        if (percentage >= 90) return `${universityTheme.colors.primary.main}15`;
        if (percentage >= 75) return `${universityTheme.colors.secondary.main}15`;
        if (percentage >= 60) return `${universityTheme.colors.accent.main}15`;
        return '#ef444415';
    };

    // Prepare Charts Data
    const pieData = [
        { name: 'Attended', value: attendanceSummary?.attendancePercentage || 0 },
        { name: 'Remaining', value: 100 - (attendanceSummary?.attendancePercentage || 0) }
    ];

    const barData = attendanceSummary?.subjectWiseSummary ?
        Object.entries(attendanceSummary.subjectWiseSummary).map(([_, sub]) => ({
            name: sub.subjectCode,
            Attended: sub.attendedSessions,
            Conducted: sub.conductedSessions,
            Planned: sub.totalPlannedSessions || 15
        })) : [];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Fade in={mounted} timeout={600}>
                <Box>
                    {/* Header */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            mb: 4,
                            borderRadius: universityTheme.borderRadius.xl,
                            background: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.primary.dark} 100%)`,
                            color: universityTheme.colors.primary.contrast,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Decorative circles */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '-20%',
                                right: '-5%',
                                width: '300px',
                                height: '300px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.05)',
                            }}
                        />

                        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    bgcolor: universityTheme.colors.secondary.main,
                                    color: universityTheme.colors.secondary.contrast,
                                    border: '4px solid rgba(255,255,255,0.2)',
                                    boxShadow: universityTheme.shadows.lg
                                }}
                            >
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    sx={{
                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                        fontSize: { xs: '1.5rem', md: '2rem' },
                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                        lineHeight: 1.2
                                    }}
                                >
                                    Welcome back, {user.firstName}!
                                </Typography>
                                <Typography sx={{ opacity: 0.8, mt: 0.5, fontSize: '0.95rem' }}>
                                    {user.courseName || "Student"} •  Semester {user.currentSemester || 'N/A'} • Section {user.section || 'All'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Roll Number
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {user.rollNumber || 'N/A'}
                                    </Typography>
                                </Box>
                                <Button
                                    onClick={() => navigate('/student/timetable')}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                        borderRadius: universityTheme.borderRadius.lg,
                                        py: 1.5,
                                        px: 3,
                                        textTransform: 'none'
                                    }}
                                    startIcon={<MdAccessTime />}
                                >
                                    Timetable
                                </Button>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Active Session Notification */}
                    {studentActiveSession && (
                        <Fade in={mounted} timeout={800}>
                            <Box sx={{ mb: 4 }}>
                                {(() => {
                                    const attendance = todayAttendance.find(a => a.labSession?.id === studentActiveSession.id);
                                    const hasJoined = attendance && attendance.entryTime && !attendance.exitTime;
                                    const hasLeft = attendance && attendance.exitTime;

                                    if (hasLeft) return null;

                                    return (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: universityTheme.borderRadius.lg,
                                                border: `2px solid ${hasJoined ? universityTheme.colors.secondary.main : '#22c55e'}`,
                                                background: hasJoined
                                                    ? `linear-gradient(to right, ${universityTheme.colors.secondary.light}10, #ffffff)`
                                                    : `linear-gradient(to right, #ecfdf5, #ffffff)`,
                                                boxShadow: universityTheme.shadows.md,
                                                display: 'flex',
                                                flexDirection: { xs: 'column', md: 'row' },
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 3
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: '50%',
                                                        bgcolor: hasJoined ? universityTheme.colors.secondary.main : '#22c55e',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: universityTheme.shadows.sm
                                                    }}
                                                >
                                                    {hasJoined ? <MdExitToApp size={28} /> : <MdAccessTime size={28} />}
                                                </Box>
                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 800,
                                                            color: universityTheme.colors.neutral.dark,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }}
                                                    >
                                                        {hasJoined ? 'CURRENTLY IN LAB' : 'LIVE LAB SESSION'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium, fontWeight: 500 }}>
                                                        {studentActiveSession.subject?.subjectName} • {studentActiveSession.lab?.labName}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={() => {
                                                    if (hasJoined) {
                                                        setSelectedSession(studentActiveSession);
                                                        setOpenExit(true);
                                                    } else {
                                                        setOpenJoin(true);
                                                    }
                                                }}
                                                sx={{
                                                    bgcolor: hasJoined ? universityTheme.colors.secondary.main : '#22c55e',
                                                    color: hasJoined ? universityTheme.colors.secondary.contrast : 'white',
                                                    borderRadius: universityTheme.borderRadius.lg,
                                                    px: 4,
                                                    py: 1.5,
                                                    fontWeight: 'bold',
                                                    boxShadow: universityTheme.shadows.md,
                                                    '&:hover': {
                                                        bgcolor: hasJoined ? universityTheme.colors.secondary.dark : '#16a34a',
                                                    }
                                                }}
                                                endIcon={hasJoined ? <MdExitToApp /> : <MdArrowForward />}
                                            >
                                                {hasJoined ? 'LEAVE NOW' : 'JOIN NOW'}
                                            </Button>
                                        </Paper>
                                    );
                                })()}
                            </Box>
                        </Fade>
                    )}

                    <Grid container spacing={4}>
                        {/* Attendance Chart */}
                        <Grid item xs={12} lg={4}>
                            <Zoom in={mounted} timeout={800}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: universityTheme.borderRadius.xl,
                                        border: `1px solid ${universityTheme.colors.neutral.light}`,
                                        boxShadow: universityTheme.shadows.sm,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        position: 'relative'
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark, mb: 1, alignSelf: 'flex-start' }}>
                                        Aggregate Attendance
                                    </Typography>
                                    <Box sx={{ width: '100%', height: 250, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={100}
                                                    startAngle={90}
                                                    endAngle={450}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    <Cell fill={getAttendanceColor(attendanceSummary?.attendancePercentage)} stroke="none" />
                                                    <Cell fill={universityTheme.colors.neutral.light} stroke="none" />
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                                            <Typography
                                                variant="h2"
                                                sx={{
                                                    fontWeight: 900,
                                                    color: universityTheme.colors.neutral.dark,
                                                    lineHeight: 1
                                                }}
                                            >
                                                {(attendanceSummary?.attendancePercentage || 0).toFixed(0)}<span style={{ fontSize: '1.5rem', opacity: 0.5 }}>%</span>
                                            </Typography>
                                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: universityTheme.colors.neutral.medium, textTransform: 'uppercase', letterSpacing: '0.1em', mt: 1 }}>
                                                Present
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ width: '100%', mt: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Box sx={{ p: 2, bgcolor: universityTheme.colors.neutral.background, borderRadius: universityTheme.borderRadius.lg, textAlign: 'center' }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 800, color: universityTheme.colors.primary.main }}>
                                                        {attendanceSummary?.totalAttended || 0}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: universityTheme.colors.neutral.medium }}>
                                                        SESSIONS ATTENDED
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ p: 2, bgcolor: universityTheme.colors.neutral.background, borderRadius: universityTheme.borderRadius.lg, textAlign: 'center' }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark }}>
                                                        {attendanceSummary?.totalConducted || 0}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: universityTheme.colors.neutral.medium }}>
                                                        TOTAL SESSIONS
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Paper>
                            </Zoom>
                        </Grid>

                        {/* Subject Comparison */}
                        <Grid item xs={12} lg={8}>
                            <Zoom in={mounted} timeout={1000}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: universityTheme.borderRadius.xl,
                                        border: `1px solid ${universityTheme.colors.neutral.light}`,
                                        boxShadow: universityTheme.shadows.sm,
                                        height: '100%'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark }}>
                                                Subject-wise Participation
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium }}>
                                                Analysis of attended vs conducted lab sessions
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ w: 12, h: 12, borderRadius: '50%', bgcolor: universityTheme.colors.primary.main, width: 12, height: 12 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: universityTheme.colors.neutral.medium }}>Attended</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ w: 12, h: 12, borderRadius: '50%', bgcolor: universityTheme.colors.neutral.light, width: 12, height: 12 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: universityTheme.colors.neutral.medium }}>Conducted</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ height: 300, width: '100%' }}>
                                        {barData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={universityTheme.colors.neutral.light} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: universityTheme.colors.neutral.medium, fontSize: 11, fontWeight: 600 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: universityTheme.colors.neutral.medium, fontSize: 11, fontWeight: 600 }} />
                                                    <RechartTooltip
                                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                        contentStyle={{
                                                            borderRadius: universityTheme.borderRadius.lg,
                                                            border: 'none',
                                                            boxShadow: universityTheme.shadows.lg
                                                        }}
                                                    />
                                                    <Bar name="Attended" dataKey="Attended" fill={universityTheme.colors.primary.main} radius={[4, 4, 0, 0]} barSize={24} />
                                                    <Bar name="Conducted" dataKey="Conducted" fill={universityTheme.colors.neutral.light} radius={[4, 4, 0, 0]} barSize={24} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Typography sx={{ color: universityTheme.colors.neutral.medium, fontStyle: 'italic' }}>
                                                    No enrollment data available
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </Zoom>
                        </Grid>
                    </Grid>

                    {/* Subject Progress Cards */}
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark, mb: 3 }}>
                            My Lab Progress
                        </Typography>
                        <Grid container spacing={3}>
                            {attendanceSummary?.subjectWiseSummary ? (
                                Object.entries(attendanceSummary.subjectWiseSummary).map(([subjectId, subject], index) => (
                                    <Grid item xs={12} md={6} lg={4} key={subjectId}>
                                        <Fade in={mounted} timeout={1200 + index * 100}>
                                            <Paper
                                                elevation={0}
                                                onClick={() => navigate(`/my-history?subjectId=${subjectId}`)}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: universityTheme.borderRadius.xl,
                                                    border: `1px solid ${universityTheme.colors.neutral.light}`,
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    '&:hover': {
                                                        transform: 'translateY(-5px)',
                                                        boxShadow: universityTheme.shadows.md,
                                                        borderColor: universityTheme.colors.primary.light
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: `${universityTheme.colors.primary.main}15`,
                                                            color: universityTheme.colors.primary.main
                                                        }}
                                                    >
                                                        <MdSchool />
                                                    </Avatar>
                                                    <Chip
                                                        label={`${subject.attendancePercentage?.toFixed(0)}%`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getAttendanceBgClass(subject.attendancePercentage),
                                                            color: getAttendanceColor(subject.attendancePercentage),
                                                            fontWeight: 800,
                                                            borderRadius: '6px'
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: universityTheme.colors.neutral.dark, mb: 0.5, lineHeight: 1.2 }}>
                                                    {subject.subjectName}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: universityTheme.colors.neutral.medium, mb: 3, display: 'block' }}>
                                                    {subject.subjectCode}
                                                </Typography>

                                                <Box sx={{ mt: 'auto' }}>
                                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                        <Box sx={{ flex: 1, p: 1.5, bgcolor: universityTheme.colors.neutral.background, borderRadius: universityTheme.borderRadius.lg }}>
                                                            <Typography variant="caption" sx={{ display: 'block', color: universityTheme.colors.neutral.medium, fontWeight: 700, fontSize: '0.7rem' }}>
                                                                ATTENDED
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark }}>
                                                                {subject.attendedSessions}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ flex: 1, p: 1.5, bgcolor: universityTheme.colors.neutral.background, borderRadius: universityTheme.borderRadius.lg }}>
                                                            <Typography variant="caption" sx={{ display: 'block', color: universityTheme.colors.neutral.medium, fontWeight: 700, fontSize: '0.7rem' }}>
                                                                CONDUCTED
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark }}>
                                                                {subject.conductedSessions}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={subject.attendancePercentage || 0}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: universityTheme.colors.neutral.light,
                                                            mb: 2,
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: getAttendanceColor(subject.attendancePercentage),
                                                                borderRadius: 3
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        fullWidth
                                                        endIcon={<MdArrowForward />}
                                                        sx={{
                                                            color: universityTheme.colors.primary.main,
                                                            fontWeight: 600,
                                                            justifyContent: 'space-between',
                                                            textTransform: 'none',
                                                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                                        }}
                                                    >
                                                        Detailed History
                                                    </Button>
                                                </Box>
                                            </Paper>
                                        </Fade>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: universityTheme.colors.neutral.background, border: `1px dashed ${universityTheme.colors.neutral.light}`, borderRadius: universityTheme.borderRadius.xl }}>
                                        <Typography sx={{ color: universityTheme.colors.neutral.medium }}>No labs found for your enrollment.</Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Box>

                    {/* Today's Schedule */}
                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark, mb: 3 }}>
                            Today's Lab Schedule
                        </Typography>
                        <Grid container spacing={3}>
                            {dailySessions.length > 0 ? (
                                dailySessions.map((session, index) => (
                                    <Grid item xs={12} md={6} key={session.id}>
                                        <Fade in={mounted} timeout={1400 + index * 100}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: universityTheme.borderRadius.xl,
                                                    border: `1px solid ${session.status === 'ONGOING' ? universityTheme.colors.secondary.main : universityTheme.colors.neutral.light}`,
                                                    bgcolor: session.status === 'ONGOING' ? `${universityTheme.colors.secondary.light}10` : 'white',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: universityTheme.colors.neutral.dark }}>
                                                            {session.subject.subjectName}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: universityTheme.colors.neutral.medium }}>
                                                            {session.startTime} - {session.endTime} • Room {session.lab.roomNumber}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={session.status === 'ONGOING' ? 'LIVE NOW' : session.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: session.status === 'ONGOING' ? universityTheme.colors.secondary.main : universityTheme.colors.neutral.light,
                                                            color: session.status === 'ONGOING' ? 'white' : universityTheme.colors.neutral.medium,
                                                            fontWeight: 800,
                                                            fontSize: '0.65rem'
                                                        }}
                                                    />
                                                </Box>
                                                <Divider sx={{ my: 2, borderColor: session.status === 'ONGOING' ? `${universityTheme.colors.secondary.main}30` : universityTheme.colors.neutral.light }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <MdSchool color={universityTheme.colors.neutral.medium} />
                                                        <Typography variant="body2" sx={{ fontWeight: 500, color: universityTheme.colors.neutral.dark }}>
                                                            {session.lab.labName}
                                                        </Typography>
                                                    </Box>
                                                    {session.status === 'ONGOING' ? (
                                                        (() => {
                                                            const attendance = todayAttendance.find(a => a.labSession?.id === session.id);
                                                            const hasJoined = attendance && attendance.entryTime && !attendance.exitTime;
                                                            const hasLeft = attendance && attendance.exitTime;
                                                            if (hasLeft) return <Typography sx={{ color: '#16a34a', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 0.5 }}><MdCheckCircle /> Completed</Typography>;
                                                            return (
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    onClick={() => { if (hasJoined) { setSelectedSession(session); setOpenExit(true); } else { setOpenJoin(true); } }}
                                                                    sx={{
                                                                        bgcolor: hasJoined ? universityTheme.colors.secondary.main : '#22c55e',
                                                                        color: hasJoined ? 'black' : 'white',
                                                                        textTransform: 'none',
                                                                        borderRadius: universityTheme.borderRadius.lg
                                                                    }}
                                                                >
                                                                    {hasJoined ? 'Leave Lab' : 'Join Lab'}
                                                                </Button>
                                                            );
                                                        })()
                                                    ) : (
                                                        <Typography variant="caption" sx={{ fontStyle: 'italic', color: universityTheme.colors.neutral.medium }}>
                                                            {session.status === 'COMPLETED' ? 'Session Finished' : 'Waiting to start'}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Fade>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: universityTheme.colors.neutral.background, borderRadius: universityTheme.borderRadius.xl, border: `1px dashed ${universityTheme.colors.neutral.light}` }}>
                                        <MdAccessTime size={32} style={{ color: universityTheme.colors.neutral.medium, marginBottom: 8 }} />
                                        <Typography sx={{ color: universityTheme.colors.neutral.medium, fontWeight: 500 }}>No labs scheduled for today</Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Box>

                    {/* Exit Dialog */}
                    <Dialog open={openExit} onClose={() => setOpenExit(false)} PaperProps={{ sx: { borderRadius: universityTheme.borderRadius.xl, p: 2, maxWidth: 400 } }}>
                        <DialogTitle sx={{ textAlign: 'center', pt: 2 }}>
                            <Avatar sx={{ bgcolor: '#fff1f2', color: '#be123c', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                                <MdExitToApp size={32} />
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark }}>
                                Lab Exit Policy
                            </Typography>
                        </DialogTitle>
                        <DialogContent sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium, mb: 3 }}>
                                Enter the 6-digit Exit Code provided by your instructor to complete this session.
                            </Typography>
                            {exitError && <Alert severity="error" sx={{ mb: 3, borderRadius: universityTheme.borderRadius.lg }}>{exitError}</Alert>}
                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1 }}>
                                {exitCode.map((digit, i) => (
                                    <TextField
                                        key={i}
                                        id={`exit-code-${i}`}
                                        value={digit}
                                        onChange={(e) => handleExitCodeInput(i, e.target.value)}
                                        variant="outlined"
                                        sx={{
                                            width: '45px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: universityTheme.borderRadius.lg,
                                                fontWeight: 'bold',
                                                fontSize: '1.25rem',
                                                textAlign: 'center',
                                                bgcolor: universityTheme.colors.neutral.background
                                            },
                                            '& input': { textAlign: 'center', p: 1.5 }
                                        }}
                                        inputProps={{ maxLength: 1 }}
                                    />
                                ))}
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleExitSubmit}
                                disabled={exitCode.join('').length < 6 || labsLoading}
                                sx={{
                                    bgcolor: '#be123c',
                                    borderRadius: universityTheme.borderRadius.lg,
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    '&:hover': { bgcolor: '#9f1239' }
                                }}
                            >
                                LOG EXIT
                            </Button>
                            <Button
                                fullWidth
                                onClick={() => setOpenExit(false)}
                                sx={{
                                    color: universityTheme.colors.neutral.medium,
                                    fontWeight: 600,
                                    textTransform: 'none'
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Join Dialog */}
                    <Dialog open={openJoin} onClose={() => setOpenJoin(false)} PaperProps={{ sx: { borderRadius: universityTheme.borderRadius.xl, p: 2, maxWidth: 450 } }}>
                        <DialogTitle sx={{ textAlign: 'center', pt: 2 }}>
                            <Avatar sx={{ bgcolor: `${universityTheme.colors.primary.main}15`, color: universityTheme.colors.primary.main, width: 64, height: 64, mx: 'auto', mb: 2 }}>
                                <MdOutlineVpnKey size={32} />
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark }}>
                                Lab Session Entry
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium, mb: 1 }}>
                                    You are joining: <strong>{studentActiveSession?.subject?.subjectName}</strong>
                                </Typography>
                                <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.medium }}>
                                    Enter your machine number and the 6-digit entry code.
                                </Typography>
                            </Box>

                            {joinError && <Alert severity="error" sx={{ mb: 3, borderRadius: universityTheme.borderRadius.lg }}>{joinError}</Alert>}

                            <Box sx={{ mb: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Machine / Bench Number"
                                    variant="outlined"
                                    placeholder="e.g., M-24"
                                    value={pcNumber}
                                    onChange={(e) => setPcNumber(e.target.value)}
                                    error={pcNumber && occupiedComputers.some(pc => pc.toLowerCase() === pcNumber.toLowerCase())}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: universityTheme.borderRadius.lg,
                                            fontWeight: 'bold',
                                        }
                                    }}
                                    helperText={loadingOccupied ? 'Checking availability...' : `${occupiedComputers.length} machine(s) currently occupied`}
                                />
                                {occupiedComputers.length > 0 && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: '#fff7ed', borderRadius: universityTheme.borderRadius.lg, border: '1px solid #ffedd5' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <MdWarning size={14} color="#ea580c" />
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#9a3412', textTransform: 'uppercase' }}>Occupied</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {occupiedComputers.map((pc, idx) => (
                                                <Chip key={idx} label={pc} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#ffedd5', color: '#9a3412' }} />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}>ENTRY CODE</Typography>
                            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1 }}>
                                {entryCode.map((digit, i) => (
                                    <TextField
                                        key={i}
                                        id={`entry-code-${i}`}
                                        value={digit}
                                        onChange={(e) => handleEntryCodeInput(i, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !entryCode[i] && i > 0) {
                                                document.getElementById(`entry-code-${i - 1}`).focus();
                                            }
                                        }}
                                        variant="outlined"
                                        sx={{
                                            width: '45px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: universityTheme.borderRadius.lg,
                                                fontWeight: 'bold',
                                                fontSize: '1.25rem',
                                                bgcolor: universityTheme.colors.neutral.background
                                            },
                                            '& input': { textAlign: 'center', p: 1.5 }
                                        }}
                                        inputProps={{ maxLength: 1 }}
                                    />
                                ))}
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleJoinSubmit}
                                disabled={entryCode.join('').length < 6 || !pcNumber || labsLoading}
                                sx={{
                                    bgcolor: universityTheme.colors.primary.main,
                                    borderRadius: universityTheme.borderRadius.lg,
                                    py: 1.5,
                                    fontWeight: 'bold',
                                }}
                            >
                                {labsLoading ? <CircularProgress size={24} color="inherit" /> : 'CONFIRM ARRIVAL'}
                            </Button>
                            <Button
                                fullWidth
                                onClick={() => setOpenJoin(false)}
                                sx={{
                                    color: universityTheme.colors.neutral.medium,
                                    fontWeight: 600,
                                    textTransform: 'none'
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Fade>
        </Container>
    );
};

export default StudentDashboard;
