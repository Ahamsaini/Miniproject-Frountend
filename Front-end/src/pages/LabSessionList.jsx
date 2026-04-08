import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Chip,
    Button,
    IconButton,
    Avatar,
    Tooltip,
    Divider,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    MdAccessTime,
    MdPerson,
    MdRoom,
    MdAssignmentTurnedIn,
    MdQrCode,
    MdMoreVert,
    MdPlayArrow,
    MdSearch
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLabSessions } from '../features/labs/labsSlice';
import { fetchCourses } from '../features/courses/coursesSlice';
import axiosInstance from '../api/axiosInstance';
import { TextField, InputAdornment } from '@mui/material';
import universityTheme from '../theme/universityTheme';

const LabSessionList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { sessions, loading } = useSelector((state) => state.labs);
    const { items: courses } = useSelector((state) => state.courses);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [statusFilter, setStatusFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchCourses({ page: 0, size: 100 }));
        dispatch(fetchLabSessions({
            status: statusFilter || undefined,
            courseId: courseFilter || undefined,
            semester: semesterFilter || undefined,
            keyword: searchTerm || undefined
        }));
    }, [dispatch, statusFilter, courseFilter, semesterFilter, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ONGOING': return 'bg-green-500';
            case 'UPCOMING': return 'bg-blue-500';
            case 'COMPLETED': return 'bg-slate-400';
            case 'CANCELLED': return 'bg-red-500';
            default: return 'bg-slate-300';
        }
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, background: universityTheme.colors.background.default, minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3, mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[900], letterSpacing: '-0.02em', mb: 0.5 }}>
                        Lab Sessions
                    </Typography>
                    <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 500 }}>
                        University laboratory activities and real-time session tracking
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                    <Button
                        variant="outlined"
                        fullWidth={isMobile}
                        onClick={() => navigate('/labs/new-lab')}
                        sx={{ 
                            borderRadius: universityTheme.borderRadius.lg, 
                            border: `1.5px solid ${universityTheme.colors.neutral.gray[200]}`,
                            color: universityTheme.colors.neutral.gray[700],
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 3,
                            '&:hover': { border: `1.5px solid ${universityTheme.colors.primary.main}`, bgcolor: 'transparent' }
                        }}
                    >
                        Create Lab
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth={isMobile}
                        startIcon={<MdPlayArrow />}
                        onClick={() => navigate('/labs/new')}
                        sx={{ 
                            bgcolor: universityTheme.colors.primary.main,
                            borderRadius: universityTheme.borderRadius.lg,
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 3,
                            boxShadow: `0 8px 16px ${universityTheme.colors.primary.light}40`,
                            '&:hover': { bgcolor: universityTheme.colors.primary.dark }
                        }}
                    >
                        Schedule
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ 
                p: 2.5, 
                borderRadius: universityTheme.borderRadius.xl, 
                border: `1px solid ${universityTheme.colors.neutral.gray[200]}`,
                boxShadow: universityTheme.shadows.sm,
                bgcolor: '#fff',
                mb: 4
            }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Course Track"
                            value={courseFilter}
                            onChange={(e) => {
                                setCourseFilter(e.target.value);
                                setSemesterFilter('');
                            }}
                            SelectProps={{ native: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: universityTheme.borderRadius.lg } }}
                        >
                            <option value="">All Programs</option>
                            {Object.entries(courses.reduce((acc, c) => {
                                const dept = c.department || 'Other';
                                if (!acc[dept]) acc[dept] = [];
                                acc[dept].push(c);
                                return acc;
                            }, {})).map(([dept, deptCourses]) => (
                                <optgroup key={dept} label={dept}>
                                    {deptCourses.map(course => (
                                        <option key={course.id} value={course.id}>{course.courseName}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Semester"
                            value={semesterFilter}
                            onChange={(e) => setSemesterFilter(e.target.value)}
                            disabled={!courseFilter}
                            SelectProps={{ native: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: universityTheme.borderRadius.lg } }}
                        >
                            <option value="">All Sems</option>
                            {courseFilter && Array.from({ length: courses.find(c => c.id === courseFilter)?.totalSemesters || 8 }, (_, i) => i + 1).map(sem => (
                                <option key={sem} value={sem}>Sem {sem}</option>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            SelectProps={{ native: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: universityTheme.borderRadius.lg } }}
                        >
                            <option value="">All Status</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by teacher, subject, or lab..."
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MdSearch color={universityTheme.colors.neutral.gray[400]} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: universityTheme.borderRadius.lg } }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: universityTheme.colors.primary.main }} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {sessions.map((session) => (
                        <Grid item xs={12} lg={6} key={session.id}>
                            <Card sx={{ 
                                borderRadius: universityTheme.borderRadius.xl, 
                                border: `1px solid ${universityTheme.colors.neutral.gray[200]}`,
                                boxShadow: universityTheme.shadows.md,
                                overflow: 'hidden',
                                position: 'relative',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: universityTheme.shadows.lg }
                            }}>
                                <Box sx={{ 
                                    position: 'absolute', 
                                    left: 0, 
                                    top: 0, 
                                    bottom: 0, 
                                    width: 5, 
                                    bgcolor: session.status === 'ONGOING' ? universityTheme.colors.success : 
                                             session.status === 'UPCOMING' || session.status === 'SCHEDULED' ? universityTheme.colors.primary.main :
                                             session.status === 'COMPLETED' ? universityTheme.colors.neutral.gray[400] :
                                             universityTheme.colors.error
                                }} />

                                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Chip
                                                label={session.status}
                                                size="small"
                                                sx={{ 
                                                    bgcolor: session.status === 'ONGOING' ? `${universityTheme.colors.success}15` : 
                                                            session.status === 'UPCOMING' || session.status === 'SCHEDULED' ? `${universityTheme.colors.primary.main}15` :
                                                            `${universityTheme.colors.neutral.gray[400]}15`,
                                                    color: session.status === 'ONGOING' ? universityTheme.colors.success : 
                                                           session.status === 'UPCOMING' || session.status === 'SCHEDULED' ? universityTheme.colors.primary.main :
                                                           universityTheme.colors.neutral.gray[700],
                                                    fontWeight: 800,
                                                    fontSize: '0.65rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    border: 'none'
                                                }}
                                            />
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: universityTheme.colors.neutral.gray[500], gap: 0.75 }}>
                                                <MdAccessTime size={16} />
                                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                                                    {session.startTime} — {session.endTime}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <IconButton size="small" sx={{ color: universityTheme.colors.neutral.gray[300] }}><MdMoreVert /></IconButton>
                                    </Box>

                                    <Typography variant="h5" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[900], mb: 0.5, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                        {session.subject?.subjectName || 'Laboratory Experiment'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: universityTheme.colors.primary.main, fontWeight: 700 }}>
                                        {session.subject?.subjectCode} • {session.subject?.course?.courseCode}
                                    </Typography>

                                    <Grid container spacing={3} sx={{ mt: 2 }}>
                                        <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: universityTheme.colors.neutral.gray[50], color: universityTheme.colors.neutral.gray[600], border: `1px solid ${universityTheme.colors.neutral.gray[100]}` }}>
                                                    <MdPerson size={20} />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[400], display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 700 }}>Instructor</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: universityTheme.colors.neutral.gray[700], fontSize: '0.85rem' }}>
                                                        {session.teacher.firstName} {session.teacher.lastName}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: universityTheme.colors.neutral.gray[50], color: universityTheme.colors.neutral.gray[600], border: `1px solid ${universityTheme.colors.neutral.gray[100]}` }}>
                                                    <MdRoom size={20} />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[400], display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 700 }}>Laboratory</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: universityTheme.colors.neutral.gray[700], fontSize: '0.85rem' }}>
                                                        {session.lab.labName}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 3, opacity: 0.4 }} />

                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 2.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: universityTheme.colors.neutral.gray[50], p: 1, px: 2, borderRadius: universityTheme.borderRadius.lg }}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 700, textTransform: 'uppercase', fontSize: '9px', display: 'block' }}>Attendance</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: universityTheme.colors.primary.main, fontSize: '1.25rem' }}>
                                                        {session.presentCount}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 700 }}>
                                                        / {session.totalStudents}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {session.status === 'ONGOING' && (
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {[1, 2, 3].map(i => (
                                                        <Box key={i} sx={{ 
                                                            width: 3, 
                                                            height: 12, 
                                                            bgcolor: universityTheme.colors.success, 
                                                            borderRadius: 1,
                                                            animation: 'pulse 1s infinite ease-in-out',
                                                            animationDelay: `${i * 0.2}s`,
                                                            '@keyframes pulse': {
                                                                '0%, 100%': { height: 8 },
                                                                '50%': { height: 16 }
                                                            }
                                                        }} />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                                            <Button
                                                variant="text"
                                                size="small"
                                                fullWidth={isMobile}
                                                onClick={() => navigate(`/labs/reschedule/${session.id}`)}
                                                sx={{ 
                                                    color: universityTheme.colors.neutral.gray[600], 
                                                    fontWeight: 700, 
                                                    textTransform: 'none',
                                                    fontSize: '0.8rem',
                                                    '&:hover': { bgcolor: universityTheme.colors.neutral.gray[100] }
                                                }}
                                            >
                                                Reschedule
                                            </Button>
                                            <Button
                                                variant="contained"
                                                fullWidth={isMobile}
                                                startIcon={<MdAssignmentTurnedIn />}
                                                onClick={() => navigate(`/labs/session/${session.id}`)}
                                                sx={{ 
                                                    bgcolor: universityTheme.colors.neutral.dark,
                                                    borderRadius: universityTheme.borderRadius.lg,
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    fontSize: '0.8rem',
                                                    px: 2.5,
                                                    '&:hover': { bgcolor: '#000' }
                                                }}
                                            >
                                                {isMobile ? 'View Session' : 'Control Center'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default LabSessionList;
