import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Chip,
    Alert,
    Grid,
    useMediaQuery,
    useTheme,
    Avatar,
    Stack,
    Tabs,
    Tab
} from '@mui/material';
import {
    MdAccessTime,
    MdLocationOn,
    MdPerson,
    MdCalendarToday,
    MdClass
} from 'react-icons/md';
import axiosInstance from '../api/axiosInstance';
import { useSelector } from 'react-redux';
import { universityTheme } from '../theme/universityTheme';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const StudentTimetable = () => {
    const { user } = useSelector((state) => state.auth);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [timetableSlots, setTimetableSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDayTab, setSelectedDayTab] = useState(new Date().getDay() === 0 ? 0 : new Date().getDay() - 1); // Default to today

    useEffect(() => {
        if (user?.id) {
            fetchStudentTimetable();
        }
    }, [user]);

    const fetchStudentTimetable = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/timetable/students/${user.id}`);
            setTimetableSlots(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching timetable:', error);
            setError('Failed to load your timetable. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getSlotForCell = (day, time) => {
        return timetableSlots.find(slot =>
            slot.dayOfWeek === day &&
            slot.startTime === time
        );
    };

    const getDaySlots = (day) => {
        return timetableSlots.filter(slot => slot.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    if (loading) {
        return (
            <Box className="flex justify-center items-center h-[60vh]">
                <CircularProgress />
            </Box>
        );
    }

    const MobileView = () => (
        <Box sx={{ pb: 10 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    position: 'sticky', 
                    top: 64, 
                    zIndex: 10, 
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                    mb: 4
                }}
            >
                <Tabs
                    value={selectedDayTab}
                    onChange={(e, v) => setSelectedDayTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTabs-indicator': { height: 4, borderRadius: '4px 4px 0 0' },
                        '& .MuiTab-root': { 
                            py: 3, 
                            minWidth: 90, 
                            fontWeight: 900, 
                            fontSize: '0.75rem', 
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'all 0.3s'
                        }
                    }}
                >
                    {DAYS.map((day) => (
                        <Tab key={day} label={day.slice(0, 3)} />
                    ))}
                </Tabs>
            </Paper>

            <Box sx={{ px: 2.5 }}>
                {getDaySlots(DAYS[selectedDayTab]).length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 12, 
                        bg: universityTheme.colors.neutral.gray[50], 
                        borderRadius: universityTheme.borderRadius.xl, 
                        border: `2px dashed ${universityTheme.colors.neutral.gray[100]}`,
                        opacity: 0.8
                    }}>
                        <MdCalendarToday size={48} color={universityTheme.colors.neutral.gray[200]} style={{ margin: '0 auto 16px' }} />
                        <Typography sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>
                            Rest Day
                        </Typography>
                        <Typography sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 600, mt: 1 }}>
                            No sessions scheduled for today
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2.5}>
                        {getDaySlots(DAYS[selectedDayTab]).map((slot, index) => (
                            <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                                    borderRadius: universityTheme.borderRadius.xl,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: universityTheme.shadows.sm,
                                    bgcolor: '#fff',
                                    transition: 'transform 0.3s ease',
                                    '&:active': { transform: 'scale(0.98)' }
                                }}
                            >
                                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, bgcolor: universityTheme.colors.primary.main }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={3.5}>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: universityTheme.colors.primary.main, mb: 0.5 }}>
                                            {slot.startTime}
                                        </Typography>
                                        <Typography sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                                            to {slot.endTime}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={8.5}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], leading: 1.2, mb: 1.5 }}>
                                            {slot.subjectName}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                                            <Chip 
                                                label={slot.subjectCode} 
                                                size="small" 
                                                sx={{ 
                                                    fontWeight: 900, 
                                                    fontSize: '0.65rem',
                                                    bgcolor: universityTheme.colors.neutral.gray[50], 
                                                    color: universityTheme.colors.neutral.gray[600],
                                                    borderRadius: '6px'
                                                }} 
                                            />
                                            <Chip 
                                                label={slot.labType?.replace('_', ' ') || 'LAB'} 
                                                size="small" 
                                                sx={{ 
                                                    fontWeight: 900, 
                                                    fontSize: '0.65rem',
                                                    bgcolor: `${universityTheme.colors.primary.main}10`, 
                                                    color: universityTheme.colors.primary.main,
                                                    borderRadius: '6px'
                                                }} 
                                            />
                                        </Box>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: universityTheme.colors.neutral.gray[600] }}>
                                                <MdLocationOn size={16} color={universityTheme.colors.primary.main} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{slot.labName} ({slot.roomNumber})</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: universityTheme.colors.neutral.gray[600] }}>
                                                <MdPerson size={16} color={universityTheme.colors.primary.main} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{slot.teacherName}</Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    );

    const DesktopView = () => (
        <Paper 
            elevation={0}
            sx={{ 
                borderRadius: universityTheme.borderRadius.xl, 
                border: `1px solid ${universityTheme.colors.neutral.gray[100]}`, 
                overflow: 'hidden', 
                boxShadow: universityTheme.shadows.xl, 
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: universityTheme.colors.neutral.gray[900], color: '#fff' }}>
                            <th style={{ padding: '24px', textAlign: 'left', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', width: '120px', borderBottom: `1px solid ${universityTheme.colors.neutral.gray[800]}` }}>Time slot</th>
                            {DAYS.map(day => (
                                <th key={day} style={{ padding: '24px', textAlign: 'center', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', borderBottom: `1px solid ${universityTheme.colors.neutral.gray[800]}` }}>
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map(time => (
                            <tr key={time} style={{ borderBottom: `1px solid ${universityTheme.colors.neutral.gray[50]}` }}>
                                <td style={{ padding: '24px', fontFamily: 'monospace', fontSize: '1rem', color: universityTheme.colors.neutral.gray[400], fontWeight: 800, verticalAlign: 'top' }}>
                                    {time}
                                </td>
                                {DAYS.map(day => {
                                    const slot = getSlotForCell(day, time);
                                    return (
                                        <td key={`${day}-${time}`} style={{ padding: '8px', verticalAlign: 'top', height: '140px', borderLeft: `1px solid ${universityTheme.colors.neutral.gray[50]}`, minWidth: '200px' }}>
                                            {slot ? (
                                                <Box sx={{ 
                                                    bgcolor: '#fff', 
                                                    border: `1px solid ${universityTheme.colors.neutral.gray[100]}`, 
                                                    p: 3, 
                                                    borderRadius: universityTheme.borderRadius.xl, 
                                                    boxShadow: universityTheme.shadows.sm,
                                                    height: '100%', 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    justifyContent: 'space-between',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        boxShadow: universityTheme.shadows.lg,
                                                        transform: 'translateY(-4px)',
                                                        borderColor: universityTheme.colors.primary.main,
                                                        '& .slot-accent': { width: 8 }
                                                    }
                                                }}>
                                                    <Box className="slot-accent" sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: universityTheme.colors.primary.main, transition: 'width 0.3s' }} />
                                                    <Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 900, color: universityTheme.colors.primary.main, bgcolor: `${universityTheme.colors.primary.main}10`, px: 1.5, py: 0.5, borderRadius: '6px', fontSize: '0.65rem' }}>
                                                                {slot.subjectCode}
                                                            </Typography>
                                                            <MdClass size={18} style={{ color: universityTheme.colors.neutral.gray[200] }} />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[900], mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }} title={slot.subjectName}>
                                                            {slot.subjectName}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ spaceY: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: universityTheme.colors.neutral.gray[500], mb: 1 }}>
                                                            <Avatar sx={{ width: 22, height: 22, bgcolor: `${universityTheme.colors.primary.main}20`, color: universityTheme.colors.primary.main, fontSize: 10, fontWeight: 900 }}>{slot.roomNumber?.[0]}</Avatar>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.labName}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: universityTheme.colors.neutral.gray[400] }}>
                                                            <MdPerson size={14} />
                                                            <Typography variant="caption" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.teacherName}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box sx={{ width: '100%', height: '100%', borderRadius: universityTheme.borderRadius.lg, '&:hover': { bgcolor: universityTheme.colors.neutral.gray[50] }, transition: 'background 0.2s' }} />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{
            pb: 4,
            px: { xs: 0, sm: 4 },
            maxWidth: '1800px',
            mx: 'auto'
        }}>
            {!isMobile && (
                <Box className="mb-8 pt-4">
                    <Typography variant="h3" className="font-black text-slate-900 tracking-tight mb-2">
                        Weekly Schedule
                    </Typography>
                    <Typography variant="h6" className="text-slate-400 font-medium">
                        Your assigned university lab sessions and timings.
                    </Typography>
                </Box>
            )}

            {error && <Alert severity="error" className="mb-6 rounded-2xl">{error}</Alert>}

            {!error && timetableSlots.length === 0 ? (
                <Paper className="p-20 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'slate.50', mx: 'auto', mb: 4 }}>
                        <MdAccessTime className="text-4xl text-slate-300" />
                    </Avatar>
                    <Typography variant="h5" className="text-slate-800 font-black mb-2">
                        No Schedule Found
                    </Typography>
                    <Typography className="text-slate-500">
                        There are no lab sessions currently scheduled for your profile.
                    </Typography>
                </Paper>
            ) : (
                isMobile ? <MobileView /> : <DesktopView />
            )}
        </Box>
    );
};

export default StudentTimetable;

