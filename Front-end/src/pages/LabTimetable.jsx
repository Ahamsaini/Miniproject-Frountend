import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    useTheme,
    useMediaQuery,
    Avatar,
    Stack,
    Divider,
    Fade
} from '@mui/material';
import {
    MdAdd,
    MdEdit,
    MdDelete,
    MdAutorenew,
    MdCheck,
    MdWarning,
    MdAccessTime,
    MdLocationOn,
    MdPerson,
    MdCalendarToday,
    MdLibraryBooks
} from 'react-icons/md';
import axiosInstance from '../api/axiosInstance';
import universityTheme from '../theme/universityTheme';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const LabTimetable = ({ courseId, semester }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [tabValue, setTabValue] = useState(0);

    const [timetableSlots, setTimetableSlots] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [labs, setLabs] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [conflicts, setConflicts] = useState([]);
    const [generateDates, setGenerateDates] = useState({
        startDate: '',
        endDate: ''
    });

    const [formData, setFormData] = useState({
        courseId: courseId,
        semester: semester,
        subjectId: '',
        labId: '',
        teacherId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        section: '',
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2),
        isRecurring: true,
        recurrencePattern: 'WEEKLY',
        notes: ''
    });

    useEffect(() => {
        if (courseId && semester) {
            fetchTimetable();
            fetchSubjects();
            fetchLabs();
            fetchTeachers();
        }
    }, [courseId, semester]);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/timetable/courses/${courseId}/semesters/${semester}`);
            const mySlots = response.data.filter(slot => slot.isTarget);
            setTimetableSlots(mySlots);
        } catch (error) {
            console.error('Error fetching timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await axiosInstance.get(`/courses/${courseId}/subjects`);
            const semesterSubjects = response.data.filter(s => s.semesterNumber === semester);
            setSubjects(semesterSubjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchLabs = async () => {
        try {
            const response = await axiosInstance.get('/labs?page=0&size=100');
            setLabs(response.data.content || response.data);
        } catch (error) {
            console.error('Error fetching labs:', error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axiosInstance.get('/teachers?page=0&size=100');
            setTeachers(response.data.content || response.data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const handleOpenDialog = (day = '', time = '') => {
        setFormData({
            ...formData,
            courseId: courseId,
            semester: semester,
            dayOfWeek: day,
            startTime: time,
            endTime: time ? calculateEndTime(time) : ''
        });
        setEditingSlot(null);
        setConflicts([]);
        setOpenDialog(true);
    };

    const handleEditSlot = (slot) => {
        setFormData({
            courseId: courseId,
            semester: semester,
            subjectId: slot.subjectId,
            labId: slot.labId,
            teacherId: slot.teacherId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            section: slot.section || '',
            academicYear: slot.academicYear,
            isRecurring: slot.isRecurring,
            recurrencePattern: slot.recurrencePattern || 'WEEKLY',
            notes: slot.notes || ''
        });
        setEditingSlot(slot);
        setConflicts([]);
        setOpenDialog(true);
    };

    const calculateEndTime = (startTime) => {
        if (!startTime) return '';
        const [hours, minutes] = startTime.split(':');
        const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
        return `${endHour}:${minutes}`;
    };

    const checkConflicts = async () => {
        if (!formData.subjectId || !formData.labId || !formData.teacherId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
            setConflicts(['Please fill in all required fields.']);
            return true;
        }

        try {
            const payload = {
                ...formData,
                semester: parseInt(formData.semester) || semester
            };
            const response = await axiosInstance.post('/timetable/check-conflicts', payload, {
                params: { excludeSlotId: editingSlot?.id || '' }
            });
            setConflicts(response.data.conflicts || []);
            return response.data.hasConflicts;
        } catch (error) {
            console.error('Error checking conflicts:', error);
            setConflicts(['Server error while checking conflicts.']);
            return true;
        }
    };

    const handleSubmit = async () => {
        const hasConflicts = await checkConflicts();
        if (hasConflicts) return;

        try {
            const dataToSubmit = {
                ...formData,
                semester: parseInt(formData.semester) || semester
            };
            if (editingSlot) {
                await axiosInstance.put(`/timetable/slots/${editingSlot.id}`, dataToSubmit);
            } else {
                await axiosInstance.post('/timetable/slots', dataToSubmit);
            }
            fetchTimetable();
            setOpenDialog(false);
        } catch (error) {
            console.error('Error saving timetable slot:', error);
            alert('Error saving timetable slot');
        }
    };

    const handleDelete = async (slotId) => {
        if (window.confirm('Delete this timetable slot?')) {
            try {
                await axiosInstance.delete(`/timetable/slots/${slotId}`);
                fetchTimetable();
            } catch (error) {
                console.error('Error deleting slot:', error);
            }
        }
    };

    const handleGenerateSessions = async () => {
        try {
            await axiosInstance.post(
                `/timetable/courses/${courseId}/semesters/${semester}/generate-sessions`,
                null,
                { params: generateDates }
            );
            alert('Lab sessions generated successfully!');
            setOpenGenerateDialog(false);
        } catch (error) {
            console.error('Error generating sessions:', error);
            alert(error.response?.data?.message || 'Error generating sessions');
        }
    };

    const getSlotForCell = (day, time) => {
        const slots = timetableSlots.filter(slot =>
            slot.dayOfWeek === day &&
            slot.startTime?.substring(0, 5) === time
        );
        return slots.find(s => s.isTarget) || slots[0];
    };

    const renderMobileView = () => {
        const currentDay = DAYS[tabValue];
        const daySlots = timetableSlots
            .filter(slot => slot.dayOfWeek === currentDay)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
            <Box sx={{ pb: 10 }}>
                <Paper 
                    elevation={0}
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        bgcolor: 'background.paper',
                        borderBottom: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                        mb: 3
                    }}
                >
                    <Tabs
                        value={tabValue}
                        onChange={(e, v) => setTabValue(v)}
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
                                color: universityTheme.colors.neutral.gray[400],
                            }
                        }}
                    >
                        {DAYS.map((day) => (
                            <Tab key={day} label={day.slice(0, 3)} />
                        ))}
                    </Tabs>
                </Paper>

                <Box sx={{ px: 2.5 }}>
                    {daySlots.length === 0 ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 10,
                                textAlign: 'center',
                                borderRadius: universityTheme.borderRadius.xl,
                                border: `2px dashed ${universityTheme.colors.neutral.gray[100]}`,
                                bgcolor: universityTheme.colors.neutral.gray[50],
                                opacity: 0.8
                            }}
                        >
                            <MdCalendarToday size={48} color={universityTheme.colors.neutral.gray[200]} style={{ margin: '0 auto 16px' }} />
                            <Typography sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 800, textTransform: 'uppercase', mb: 1 }}>
                                No Sessions
                            </Typography>
                            <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 600, mb: 3 }}>
                                No lab sessions scheduled for {currentDay}
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<MdAdd />}
                                onClick={() => handleOpenDialog(currentDay)}
                                sx={{ 
                                    fontWeight: 900, 
                                    textTransform: 'none', 
                                    borderRadius: universityTheme.borderRadius.lg,
                                    px: 4
                                }}
                            >
                                Schedule Now
                            </Button>
                        </Paper>
                    ) : (
                        <Stack spacing={2.5}>
                            {daySlots.map((slot) => (
                                <Fade in={true} key={slot.id}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: universityTheme.borderRadius.xl,
                                            border: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                                            display: 'flex',
                                            gap: 3,
                                            position: 'relative',
                                            boxShadow: universityTheme.shadows.sm,
                                            overflow: 'hidden',
                                            bgcolor: '#fff'
                                        }}
                                    >
                                        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: universityTheme.colors.primary.main }} />
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            minWidth: 70,
                                            pr: 2,
                                            borderRight: `1px solid ${universityTheme.colors.neutral.gray[50]}`
                                        }}>
                                            <Typography sx={{ fontWeight: 900, color: universityTheme.colors.primary.main, fontSize: '1.1rem' }}>
                                                {slot.startTime.substring(0, 5)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[300], fontWeight: 800, textTransform: 'uppercase', my: 0.5 }}>TO</Typography>
                                            <Typography sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[600], fontSize: '0.9rem' }}>
                                                {slot.endTime.substring(0, 5)}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], lineHeight: 1.1, fontSize: '1rem' }}>
                                                    {slot.subjectName}
                                                </Typography>
                                                <Stack direction="row" spacing={0.5}>
                                                    <IconButton size="small" onClick={() => handleEditSlot(slot)} sx={{ color: universityTheme.colors.primary.main, bgcolor: `${universityTheme.colors.primary.main}08` }}>
                                                        <MdEdit size={16} />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(slot.id)} sx={{ color: universityTheme.colors.error, bgcolor: `${universityTheme.colors.error}08` }}>
                                                        <MdDelete size={16} />
                                                    </IconButton>
                                                </Stack>
                                            </Box>

                                            <Stack spacing={1.5}>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip label={slot.subjectCode} size="small" sx={{ fontWeight: 900, fontSize: '0.65rem', bgcolor: universityTheme.colors.neutral.gray[50], color: universityTheme.colors.neutral.gray[600], borderRadius: '6px' }} />
                                                    {slot.section && <Chip label={`Sec ${slot.section}`} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: '6px', bgcolor: `${universityTheme.colors.primary.main}10`, color: universityTheme.colors.primary.main }} />}
                                                </Box>
                                                <Stack spacing={0.5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: universityTheme.colors.neutral.gray[500] }}>
                                                        <MdLocationOn size={14} color={universityTheme.colors.primary.light} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                            {slot.labName}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: universityTheme.colors.neutral.gray[500] }}>
                                                        <MdPerson size={14} color={universityTheme.colors.primary.light} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                            {slot.teacherName}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    </Paper>
                                </Fade>
                            ))}
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<MdAdd />}
                                onClick={() => handleOpenDialog(currentDay)}
                                sx={{
                                    py: 2.5,
                                    borderRadius: universityTheme.borderRadius.lg,
                                    borderStyle: 'dashed',
                                    borderWidth: '2px',
                                    fontWeight: 900,
                                    textTransform: 'none',
                                    borderColor: universityTheme.colors.neutral.gray[200],
                                    color: universityTheme.colors.neutral.gray[400],
                                    '&:hover': {
                                        borderColor: universityTheme.colors.primary.main,
                                        color: universityTheme.colors.primary.main,
                                        bgcolor: 'transparent'
                                    }
                                }}
                            >
                                Assign Another Entry
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress thickness={5} size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ pb: { xs: 8, sm: 0 } }}>
            {/* Header Section */}
            <Box sx={{ mb: 6 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ 
                            width: 52, 
                            height: 52, 
                            borderRadius: universityTheme.borderRadius.lg, 
                            bgcolor: `${universityTheme.colors.primary.main}10`, 
                            color: universityTheme.colors.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: universityTheme.shadows.sm
                        }}>
                            <MdCalendarToday size={28} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], letterSpacing: '-0.02em', mb: 0.5 }}>
                                Master Schedule
                            </Typography>
                            <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Semester {semester} • Academic Year 2024-25
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                        <Button
                            fullWidth={isMobile}
                            variant="outlined"
                            startIcon={<MdAutorenew />}
                            onClick={() => setOpenGenerateDialog(true)}
                            sx={{ 
                                borderRadius: universityTheme.borderRadius.lg, 
                                fontWeight: 900, 
                                textTransform: 'none',
                                border: `2.2px solid ${universityTheme.colors.success}`,
                                color: universityTheme.colors.success,
                                px: 3,
                                '&:hover': {
                                    border: `2.2px solid ${universityTheme.colors.success}`,
                                    bgcolor: `${universityTheme.colors.success}05`
                                }
                            }}
                        >
                            Generate
                        </Button>
                        <Button
                            fullWidth={isMobile}
                            variant="contained"
                            startIcon={<MdAdd />}
                            onClick={() => handleOpenDialog()}
                            sx={{ 
                                borderRadius: universityTheme.borderRadius.lg, 
                                fontWeight: 900, 
                                textTransform: 'none', 
                                px: 4,
                                boxShadow: universityTheme.shadows.md
                            }}
                        >
                            Assign
                        </Button>
                    </Box>
                </Stack>
            </Box>

            {isMobile ? renderMobileView() : (
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        border: `1px solid ${universityTheme.colors.neutral.light}`,
                        overflow: 'hidden',
                        bgcolor: 'white'
                    }}
                >
                    <Box sx={{ overflowX: 'auto' }}>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-left font-black text-slate-400 uppercase text-[10px] tracking-widest border-r">Time Slot</th>
                                    {DAYS.map(day => (
                                        <th key={day} className="px-4 py-4 text-center font-black text-slate-800 text-[11px] tracking-wider">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {TIME_SLOTS.map(time => (
                                    <tr key={time} className="border-b border-slate-50 group">
                                        <td className="px-6 py-4 font-black text-slate-500 text-[13px] border-r bg-slate-50/50 group-hover:bg-slate-50">
                                            {time}
                                        </td>
                                        {DAYS.map(day => {
                                            const slot = getSlotForCell(day, time);
                                            if (slot && slot.startTime?.substring(0, 5) === time) {
                                                const startHour = parseInt(time.split(':')[0]);
                                                const endHour = parseInt(slot.endTime?.split(':')[0]);
                                                const rowSpan = Math.max(1, endHour - startHour);
                                                const isForeign = !slot.isTarget;

                                                return (
                                                    <td key={`${day}-${time}`} rowSpan={rowSpan} className="p-1 px-2 align-top transition-all">
                                                        <Paper
                                                            elevation={0}
                                                            onClick={() => !isForeign && handleEditSlot(slot)}
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: '16px',
                                                                bgcolor: isForeign ? '#f1f5f9' : '#eff6ff',
                                                                border: '1px solid',
                                                                borderColor: isForeign ? '#cbd5e1' : '#bfdbfe',
                                                                cursor: isForeign ? 'not-allowed' : 'pointer',
                                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                                height: '100%',
                                                                '&:hover': {
                                                                    transform: isForeign ? 'none' : 'translateY(-2px)',
                                                                    boxShadow: isForeign ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.1)'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                <Typography sx={{ fontWeight: 900, color: isForeign ? 'slate.600' : 'primary.main', fontSize: '0.75rem' }}>
                                                                    {slot.subjectCode}
                                                                </Typography>
                                                                {!isForeign && (
                                                                    <MdDelete
                                                                        className="text-rose-400 hover:text-rose-600 cursor-pointer"
                                                                        onClick={(e) => { e.stopPropagation(); handleDelete(slot.id); }}
                                                                    />
                                                                )}
                                                            </Box>
                                                            <Typography sx={{ fontWeight: 800, color: 'slate.800', lineHeight: 1.2, mb: 0.5, fontSize: '0.8rem' }}>
                                                                {slot.subjectName}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <MdLocationOn size={12} className={isForeign ? 'text-slate-400' : 'text-blue-500'} />
                                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'slate.500' }}>{slot.labCode}</Typography>
                                                            </Box>
                                                        </Paper>
                                                    </td>
                                                );
                                            }
                                            const isCovered = timetableSlots.some(s => {
                                                if (s.dayOfWeek !== day) return false;
                                                const sStart = parseInt(s.startTime?.split(':')[0]);
                                                const sEnd = parseInt(s.endTime?.split(':')[0]);
                                                const currentHour = parseInt(time.split(':')[0]);
                                                return currentHour > sStart && currentHour < sEnd;
                                            });
                                            if (isCovered) return null;
                                            return (
                                                <td key={`${day}-${time}`} className="p-1 px-2 align-top">
                                                    <Box
                                                        onClick={() => handleOpenDialog(day, time)}
                                                        sx={{
                                                            height: 60,
                                                            border: '2px dashed',
                                                            borderColor: 'slate.100',
                                                            borderRadius: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                borderColor: 'primary.light',
                                                                bgcolor: 'primary.50'
                                                            }
                                                        }}
                                                    >
                                                        <MdAdd className="text-slate-200" size={24} />
                                                    </Box>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Paper>
            )}

            {/* Existing Dialogs but with universityTheme styling */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
                <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>{editingSlot ? 'Update Schedule' : 'New Schedule Assignment'}</DialogTitle>
                <DialogContent sx={{ px: 4, pt: 1 }}>
                    {conflicts.length > 0 && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{conflicts[0]}</Alert>}
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField select fullWidth label="Subject" value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} required InputProps={{ sx: { borderRadius: '12px' } }}>
                                {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.subjectCode} - {s.subjectName}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="Lab Venue" value={formData.labId} onChange={(e) => setFormData({ ...formData, labId: e.target.value })} required InputProps={{ sx: { borderRadius: '12px' } }}>
                                {labs.map(l => <MenuItem key={l.id} value={l.id}>{l.labCode} - {l.labName}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="Faculty" value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} required InputProps={{ sx: { borderRadius: '12px' } }}>
                                {teachers.map(t => <MenuItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField select fullWidth label="Day" value={formData.dayOfWeek} onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })} required InputProps={{ sx: { borderRadius: '12px' } }}>
                                {DAYS.map(day => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="time" label="Start" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value, endTime: calculateEndTime(e.target.value) })} required InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: '12px' } }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="time" label="End" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: '12px' } }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 4 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 800 }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: '12px', fontWeight: 900, px: 4 }}>
                        Save Slot
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Generate Dialog */}
            <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
                <DialogTitle sx={{ fontWeight: 900 }}>Generate Sessions</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 3, color: 'slate.500', fontWeight: 500 }}>Create actual session instances from the master template.</Typography>
                    <Stack spacing={3}>
                        <TextField fullWidth type="date" label="Start Date" value={generateDates.startDate} onChange={(e) => setGenerateDates({ ...generateDates, startDate: e.target.value })} InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: '12px' } }} />
                        <TextField fullWidth type="date" label="End Date" value={generateDates.endDate} onChange={(e) => setGenerateDates({ ...generateDates, endDate: e.target.value })} InputLabelProps={{ shrink: true }} InputProps={{ sx: { borderRadius: '12px' } }} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenGenerateDialog(false)}>Cancel</Button>
                    <Button onClick={handleGenerateSessions} variant="contained" color="success" disabled={!generateDates.startDate || !generateDates.endDate} sx={{ borderRadius: '12px', fontWeight: 900 }}>
                        Generate Entries
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Mobile FAB for adding slots */}
            {isMobile && (
                <IconButton
                    onClick={() => handleOpenDialog()}
                    sx={{
                        position: 'fixed',
                        bottom: 90,
                        right: 20,
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.main',
                        color: 'white',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: 'primary.dark' },
                        zIndex: 1000
                    }}
                >
                    <MdAdd size={28} />
                </IconButton>
            )}
        </Box>
    );
};

export default LabTimetable;

