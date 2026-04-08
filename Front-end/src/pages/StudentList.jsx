import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    TextField,
    InputAdornment,
    Button,
    IconButton,
    Chip,
    Pagination,
    Skeleton,
    Tooltip,
    Fade,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    MenuItem,
    Container,
    Card,
    CardContent,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, updateStudent } from '../features/students/studentsSlice';
import { fetchCourses } from '../features/courses/coursesSlice';
import axiosInstance from '../api/axiosInstance';
import universityTheme from '../theme/universityTheme';
import {
    MdSearch,
    MdMoreVert,
    MdSchool,
    MdPhone,
    MdEmail,
    MdRefresh,
    MdBadge,
    MdFiberManualRecord,
    MdFilterList,
    MdAdd,
    MdPeople
} from 'react-icons/md';

const StudentList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items, loading, pagination } = useSelector((state) => state.students);
    const { items: courses } = useSelector((state) => state.courses);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('');
    const [mounted, setMounted] = useState(false);

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({
        rollNumber: '',
        registrationNumber: '',
        currentSemester: 1,
        academicYear: '',
        batch: '',
        section: '',
        courseId: ''
    });

    useEffect(() => {
        setMounted(true);
        dispatch(fetchCourses({ page: 0, size: 100 }));
        dispatch(fetchStudents({
            page: 0,
            size: 20,
            courseId: courseFilter || undefined,
            semester: semesterFilter || undefined
        }));
    }, [dispatch, courseFilter, semesterFilter]);

    const handlePromote = async (studentId) => {
        if (window.confirm('Promote student to the next semester?')) {
            try {
                await axiosInstance.post(`/students/${studentId}/promote`);
                dispatch(fetchStudents({
                    page: pagination.number,
                    size: 20,
                    courseId: courseFilter || undefined,
                    semester: semesterFilter || undefined
                }));
                alert('Student promoted successfully!');
            } catch (err) {
                alert('Failed to promote student');
            }
        }
    };

    const handlePageChange = (event, value) => {
        dispatch(fetchStudents({
            page: value - 1,
            size: 20,
            courseId: courseFilter || undefined,
            semester: semesterFilter || undefined,
            keyword: searchTerm || undefined
        }));
    };

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setEditFormData({
            rollNumber: student.rollNumber || '',
            registrationNumber: student.registrationNumber || '',
            currentSemester: student.currentSemester || 1,
            academicYear: student.academicYear || '',
            batch: student.batch || '',
            section: student.section || '',
            courseId: student.course?.id || ''
        });
        setOpenEditDialog(true);
    };

    const handleEditSubmit = async () => {
        // Validation: Academic Year must be YYYY-YYYY
        const academicYearPattern = /^\d{4}-\d{4}$/;
        if (editFormData.academicYear && !academicYearPattern.test(editFormData.academicYear)) {
            alert('Invalid Academic Year format. Please use YYYY-YYYY (e.g., 2024-2025)');
            return;
        }

        try {
            await dispatch(updateStudent({
                id: selectedStudent.id,
                data: editFormData
            })).unwrap();
            setOpenEditDialog(false);
            alert('Student details updated successfully!');
            dispatch(fetchStudents({
                page: pagination.number,
                size: 20,
                courseId: courseFilter || undefined,
                semester: semesterFilter || undefined
            }));
        } catch (err) {
            alert(err || 'Failed to update student details');
        }
    };

    const studentItems = useMemo(() => Array.isArray(items) ? items : [], [items]);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Fade in={mounted} timeout={600}>
                <Box>
                    {/* Header */}
                    {/* Header */}
                    <Box
                        sx={{
                            p: { xs: 4, sm: 6 },
                            mb: 4,
                            borderRadius: universityTheme.borderRadius.xl,
                            background: `linear-gradient(135deg, ${universityTheme.colors.primary.dark} 0%, ${universityTheme.colors.primary.main} 100%)`,
                            color: 'white',
                            boxShadow: universityTheme.shadows.lg,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={3}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 1.5 }}>
                                        <Box sx={{ 
                                            width: 52, 
                                            height: 52, 
                                            borderRadius: universityTheme.borderRadius.lg, 
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                        }}>
                                            <MdPeople size={30} />
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                                            Student Directory
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, maxWidth: 600 }}>
                                        Managing {pagination.totalElements || '...'} academic profiles across campus.
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                    <Button
                                        fullWidth={isMobile}
                                        variant="outlined"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCourseFilter('');
                                            setSemesterFilter('');
                                            dispatch(fetchStudents({ page: 0, size: 20 }));
                                        }}
                                        sx={{
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            color: 'white',
                                            borderRadius: universityTheme.borderRadius.lg,
                                            height: 52,
                                            px: 3,
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' }
                                        }}
                                    >
                                        <MdRefresh size={22} />
                                    </Button>
                                    <Button
                                        fullWidth={isMobile}
                                        variant="contained"
                                        startIcon={<MdAdd />}
                                        onClick={() => navigate('/onboarding')}
                                        sx={{
                                            bgcolor: '#fff',
                                            color: universityTheme.colors.primary.main,
                                            borderRadius: universityTheme.borderRadius.lg,
                                            fontWeight: 900,
                                            height: 52,
                                            px: 4,
                                            '&:hover': { bgcolor: universityTheme.colors.neutral.gray[50] }
                                        }}
                                    >
                                        Enrollment Queue
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
                    </Box>

                    {/* Filters & Search Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 4,
                            borderRadius: universityTheme.borderRadius.xl,
                            border: `1px solid ${universityTheme.colors.neutral.light}`,
                            background: `linear-gradient(135deg, #ffffff 0%, ${universityTheme.colors.neutral.background} 100%)`,
                        }}
                    >
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} lg={5}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by name, roll number, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            dispatch(fetchStudents({
                                                keyword: searchTerm || undefined,
                                                courseId: courseFilter || undefined,
                                                semester: semesterFilter || undefined,
                                                size: 20
                                            }));
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <MdSearch color={universityTheme.colors.primary.main} size={24} />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: universityTheme.borderRadius.lg,
                                            bgcolor: 'white',
                                            '& fieldset': { borderColor: universityTheme.colors.neutral.light }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Academic Course"
                                    value={courseFilter}
                                    onChange={(e) => {
                                        setCourseFilter(e.target.value);
                                        setSemesterFilter('');
                                    }}
                                    SelectProps={{ native: true }}
                                    InputProps={{
                                        sx: {
                                            borderRadius: universityTheme.borderRadius.lg,
                                            bgcolor: 'white',
                                        }
                                    }}
                                >
                                    <option value="">All Programs</option>
                                    {Object.entries(courses.reduce((acc, c) => {
                                        const dept = c.department || 'General';
                                        if (!acc[dept]) acc[dept] = [];
                                        acc[dept].push(c);
                                        return acc;
                                    }, {})).map(([dept, deptCourses]) => (
                                        <optgroup key={dept} label={dept}>
                                            {deptCourses.map(course => (
                                                <option key={course.id} value={course.id}>{course.courseName} ({course.courseCode})</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} lg={2}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Semester"
                                    value={semesterFilter}
                                    onChange={(e) => setSemesterFilter(e.target.value)}
                                    disabled={!courseFilter}
                                    SelectProps={{ native: true }}
                                    InputProps={{
                                        sx: {
                                            borderRadius: universityTheme.borderRadius.lg,
                                            bgcolor: 'white',
                                        }
                                    }}
                                >
                                    <option value="">Current Sem</option>
                                    {courseFilter && Array.from({ length: courses.find(c => c.id === courseFilter)?.totalSemesters || 8 }, (_, i) => i + 1).map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} lg={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => {
                                        dispatch(fetchStudents({
                                            keyword: searchTerm || undefined,
                                            courseId: courseFilter || undefined,
                                            semester: semesterFilter || undefined,
                                            size: 20
                                        }));
                                    }}
                                    sx={{
                                        bgcolor: universityTheme.colors.secondary.main,
                                        color: universityTheme.colors.secondary.contrast,
                                        borderRadius: universityTheme.borderRadius.lg,
                                        fontWeight: 'bold',
                                        height: 56,
                                        boxShadow: universityTheme.shadows.md,
                                        '&:hover': { bgcolor: universityTheme.colors.secondary.dark }
                                    }}
                                >
                                    Apply Filters
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Table Section / Mobile Card View */}
                    {isMobile ? (
                        <Box sx={{ mb: 3 }}>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, idx) => (
                                    <Skeleton key={idx} variant="rectangular" height={220} sx={{ mb: 2, borderRadius: universityTheme.borderRadius.xl }} />
                                ))
                            ) : studentItems.length === 0 ? (
                                <Paper sx={{ p: 10, textAlign: 'center', borderRadius: universityTheme.borderRadius.xl, bgcolor: '#fff', border: `1px solid ${universityTheme.colors.neutral.gray[100]}` }}>
                                    <MdPeople size={48} color={universityTheme.colors.neutral.gray[200]} />
                                    <Typography variant="h6" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 900, mt: 2 }}>No profiles found</Typography>
                                    <Button
                                        onClick={() => { setSearchTerm(''); setCourseFilter(''); setSemesterFilter(''); dispatch(fetchStudents({ page: 0, size: 20 })); }}
                                        sx={{ mt: 2, textTransform: 'none', fontWeight: 800 }}
                                    >
                                        Reset Filters
                                    </Button>
                                </Paper>
                            ) : (
                                <Stack spacing={2.5}>
                                    {studentItems.map((student) => (
                                        <Fade in={true} key={student.id}>
                                            <Card elevation={0} sx={{ 
                                                borderRadius: universityTheme.borderRadius.xl, 
                                                border: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                                                bgcolor: '#fff',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}>
                                                <Box sx={{ 
                                                    position: 'absolute', 
                                                    top: 0, 
                                                    left: 0, 
                                                    width: 6, 
                                                    bottom: 0, 
                                                    bgcolor: student.isActive ? universityTheme.colors.success : universityTheme.colors.neutral.gray[300] 
                                                }} />
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar
                                                                src={student.profilePictureUrl}
                                                                sx={{
                                                                    bgcolor: universityTheme.colors.primary.main,
                                                                    fontWeight: 900,
                                                                    width: 56, height: 56,
                                                                    fontSize: '1.2rem',
                                                                    boxShadow: universityTheme.shadows.sm,
                                                                    border: '2px solid white'
                                                                }}
                                                            >
                                                                {student.firstName?.[0]}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], lineHeight: 1.1, mb: 0.5 }}>
                                                                    {student.fullName || `${student.firstName} ${student.lastName}`}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 700 }}>
                                                                    {student.email}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Chip
                                                            label={student.rollNumber || 'TBD'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: universityTheme.colors.neutral.gray[50],
                                                                color: universityTheme.colors.neutral.gray[800],
                                                                fontWeight: 900,
                                                                borderRadius: '8px',
                                                                fontFamily: 'monospace',
                                                                fontSize: '0.75rem',
                                                                px: 1
                                                            }}
                                                        />
                                                    </Box>

                                                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[300], textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                                                                Program
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[600] }}>
                                                                {student.course?.courseCode || 'PENDING'}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[300], textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                                                                Semester
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[600] }}>
                                                                Phase {student.currentSemester || 1}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>

                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center', 
                                                        pt: 2.5,
                                                        borderTop: `1px solid ${universityTheme.colors.neutral.gray[50]}` 
                                                    }}>
                                                        <Chip
                                                            label={student.isActive ? 'AUTHORIZED' : 'LOCKED'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: student.isActive ? `${universityTheme.colors.success}15` : `${universityTheme.colors.error}15`,
                                                                color: student.isActive ? universityTheme.colors.success : universityTheme.colors.error,
                                                                fontWeight: 900,
                                                                borderRadius: '8px',
                                                                fontSize: '0.65rem',
                                                                letterSpacing: '0.05em'
                                                            }}
                                                        />
                                                        <Stack direction="row" spacing={1.5}>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => handlePromote(student.id)}
                                                                sx={{
                                                                    minWidth: 'auto',
                                                                    fontSize: '0.75rem',
                                                                    textTransform: 'none',
                                                                    color: universityTheme.colors.primary.main,
                                                                    fontWeight: 900,
                                                                    borderRadius: universityTheme.borderRadius.lg,
                                                                    px: 2,
                                                                    py: 1
                                                                }}
                                                            >
                                                                Promote
                                                            </Button>
                                                            <IconButton
                                                                onClick={() => handleEditClick(student)}
                                                                sx={{
                                                                    color: universityTheme.colors.neutral.gray[400],
                                                                    bgcolor: universityTheme.colors.neutral.gray[50],
                                                                    borderRadius: universityTheme.borderRadius.lg,
                                                                    '&:hover': { bgcolor: universityTheme.colors.neutral.gray[100] }
                                                                }}
                                                            >
                                                                <MdMoreVert size={22} />
                                                            </IconButton>
                                                        </Stack>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Fade>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: universityTheme.borderRadius.xl,
                                border: `1px solid ${universityTheme.colors.neutral.light}`,
                                overflow: 'hidden',
                                boxShadow: universityTheme.shadows.sm
                            }}
                        >
                            <TableContainer>
                                <Table sx={{ minWidth: 900 }}>
                                    <TableHead sx={{ bgcolor: universityTheme.colors.neutral.background }}>
                                        <TableRow>
                                            <TableCell sx={{ py: 2, fontWeight: 700, color: universityTheme.colors.neutral.medium, fontSize: '0.75rem', letterSpacing: '0.05em' }}>STUDENT IDENTITY</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.medium, fontSize: '0.75rem', letterSpacing: '0.05em' }}>ROLL NUMBER</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.medium, fontSize: '0.75rem', letterSpacing: '0.05em' }}>ACADEMIC INFO</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.medium, fontSize: '0.75rem', letterSpacing: '0.05em' }}>CONTACT</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.medium, fontSize: '0.75rem', letterSpacing: '0.05em' }}>STATUS</TableCell>
                                            <TableCell align="right" sx={{ pr: 4 }}>ACTIONS</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
                                                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                                    <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                                                    <TableCell align="right"><Skeleton variant="circular" width={32} height={32} /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : studentItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ py: 8, textAlign: 'center' }}>
                                                    <Typography variant="h6" sx={{ color: universityTheme.colors.neutral.medium }}>No students found</Typography>
                                                    <Button
                                                        onClick={() => { setSearchTerm(''); setCourseFilter(''); setSemesterFilter(''); dispatch(fetchStudents({ page: 0, size: 20 })); }}
                                                        sx={{ mt: 1, textTransform: 'none' }}
                                                    >
                                                        Clear filters
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            studentItems.map((student) => (
                                                <TableRow
                                                    key={student.id}
                                                    hover
                                                    sx={{
                                                        transition: 'all 0.2s',
                                                        '&:hover': { bgcolor: `${universityTheme.colors.primary.light}05` }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar
                                                                src={student.profilePictureUrl}
                                                                sx={{
                                                                    bgcolor: universityTheme.colors.primary.main,
                                                                    fontWeight: 'bold',
                                                                    width: 40, height: 40
                                                                }}
                                                            >
                                                                {student.firstName?.charAt(0) || student.fullName?.charAt(0) || '?'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: universityTheme.colors.neutral.dark }}>
                                                                    {student.fullName || `${student.firstName} ${student.lastName}`}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <MdEmail size={12} color={universityTheme.colors.neutral.medium} />
                                                                    <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.medium }}>
                                                                        {student.email}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={student.rollNumber || 'N/A'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: universityTheme.colors.neutral.background,
                                                                color: universityTheme.colors.neutral.dark,
                                                                fontWeight: 700,
                                                                borderRadius: '6px',
                                                                fontFamily: universityTheme.typography.fontFamily.mono
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: universityTheme.colors.neutral.dark, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <MdSchool size={14} color={universityTheme.colors.primary.main} />
                                                                {student.course?.courseCode || 'Unassigned'}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.medium, ml: 2.5 }}>
                                                                Sem {student.currentSemester || 1} • {student.batch || '2024'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <MdPhone size={14} color={universityTheme.colors.neutral.medium} />
                                                                <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.dark, fontWeight: 500 }}>
                                                                    {student.phoneNumber || 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<MdFiberManualRecord size={10} />}
                                                            label={student.isActive ? 'Active' : 'Inactive'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: student.isActive ? '#ecfdf5' : universityTheme.colors.neutral.background,
                                                                color: student.isActive ? '#059669' : universityTheme.colors.neutral.medium,
                                                                fontWeight: 700,
                                                                borderRadius: '6px',
                                                                '& .MuiChip-icon': { color: 'inherit' }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                            <Button
                                                                size="small"
                                                                onClick={() => handlePromote(student.id)}
                                                                sx={{
                                                                    minWidth: 'auto',
                                                                    fontSize: '0.75rem',
                                                                    textTransform: 'none',
                                                                    color: universityTheme.colors.primary.main,
                                                                    borderColor: universityTheme.colors.primary.light,
                                                                    '&:hover': { bgcolor: `${universityTheme.colors.primary.main}10` }
                                                                }}
                                                            >
                                                                Promote
                                                            </Button>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEditClick(student)}
                                                                sx={{ color: universityTheme.colors.neutral.medium }}
                                                            >
                                                                <MdMoreVert />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {/* Desktop Pagination */}
                            <Box sx={{ p: 2, borderTop: `1px solid ${universityTheme.colors.neutral.light}`, display: 'flex', justifyContent: 'flex-end' }}>
                                <Pagination
                                    count={pagination.totalPages || 0}
                                    page={(pagination.number || 0) + 1}
                                    onChange={handlePageChange}
                                    color="primary"
                                    shape="rounded"
                                    size="medium"
                                />
                            </Box>
                        </Paper>
                    )}

                    {/* Mobile Pagination */}
                    {isMobile && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={pagination.totalPages || 0}
                                page={(pagination.number || 0) + 1}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                size="small"
                                siblingCount={0}
                            />
                        </Box>
                    )}
                </Box>
            </Fade>

            {/* Edit Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: universityTheme.borderRadius.xl,
                        p: 2,
                        width: { xs: '90%', sm: 500 },
                        maxWidth: '100%'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: universityTheme.colors.primary.main }}>
                    Edit Student Profile
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium, mb: 3 }}>
                        Assign academic details for {selectedStudent?.fullName || `${selectedStudent?.firstName} ${selectedStudent?.lastName}`}.
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Roll Number"
                                value={editFormData.rollNumber}
                                onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Enrollment Number"
                                value={editFormData.registrationNumber}
                                onChange={(e) => setEditFormData({ ...editFormData, registrationNumber: e.target.value })}
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Course"
                                value={editFormData.courseId}
                                onChange={(e) => setEditFormData({ ...editFormData, courseId: e.target.value })}
                                SelectProps={{ native: true }}
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            >
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.courseName} ({course.courseCode})</option>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Semester"
                                type="number"
                                value={editFormData.currentSemester}
                                onChange={(e) => setEditFormData({ ...editFormData, currentSemester: parseInt(e.target.value) })}
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Section"
                                value={editFormData.section}
                                onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Batch"
                                value={editFormData.batch}
                                onChange={(e) => setEditFormData({ ...editFormData, batch: e.target.value })}
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Academic Year"
                                value={editFormData.academicYear}
                                onChange={(e) => setEditFormData({ ...editFormData, academicYear: e.target.value })}
                                placeholder="YYYY-YYYY"
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenEditDialog(false)} sx={{ color: universityTheme.colors.neutral.medium }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleEditSubmit}
                        sx={{
                            bgcolor: universityTheme.colors.primary.main,
                            borderRadius: universityTheme.borderRadius.lg,
                            px: 3,
                            fontWeight: 'bold'
                        }}
                    >
                        Save Details
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
};

export default StudentList;
