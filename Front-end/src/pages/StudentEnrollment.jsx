import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Autocomplete,
    Chip,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Avatar,
    InputAdornment,
    Fade,
    Zoom,
    Tooltip,
    CircularProgress,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    MdAdd,
    MdDelete,
    MdArrowBack,
    MdSave,
    MdPerson,
    MdSchool,
    MdOutlineAccountCircle,
    MdLibraryBooks,
    MdFormatListNumbered,
    MdCheckCircle,
    MdSearch,
    MdDateRange,
    MdLayers
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { debounce } from 'lodash';
import universityTheme from '../theme/universityTheme';

const StudentEnrollment = () => {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(1);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [enrollments, setEnrollments] = useState([]);

    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [studentsRes, coursesRes, subjectsRes] = await Promise.all([
                axiosInstance.get('/students?size=50'), // Initial small batch
                axiosInstance.get('/courses?size=100'),
                axiosInstance.get('/subjects?size=200')
            ]);

            setStudents(studentsRes.data.content || (Array.isArray(studentsRes.data) ? studentsRes.data : []));
            setCourses(coursesRes.data.content || (Array.isArray(coursesRes.data) ? coursesRes.data : []));
            setSubjects(subjectsRes.data.content || (Array.isArray(subjectsRes.data) ? subjectsRes.data : []));
        } catch (err) {
            setError('System Link Error: Could not synchronize with academic records.');
        } finally {
            setLoading(false);
        }
    };

    // Robust Search Implementation
    const searchStudents = useCallback(
        debounce(async (query) => {
            if (!query) {
                try {
                    const res = await axiosInstance.get('/students?size=50');
                    setStudents(res.data.content || []);
                } catch (err) { console.error(err); }
                return;
            }
            if (query.length < 2) return;
            setSearching(true);
            try {
                // Using unified /students endpoint which now supports keyword
                const res = await axiosInstance.get(`/students?keyword=${query}&size=50`);
                setStudents(res.data.content || []);
            } catch (err) {
                console.error("Student search failed", err);
            } finally {
                setSearching(false);
            }
        }, 400),
        []
    );

    // Filter subjects by selected course and semester for easier picking
    const filteredSubjects = useMemo(() => {
        if (!selectedCourse) return subjects;
        return subjects.filter(s =>
            s.course?.id === selectedCourse.id &&
            s.semesterNumber === selectedSemester
        );
    }, [selectedCourse, selectedSemester, subjects]);

    const handleAddEnrollment = () => {
        if (!selectedStudent) {
            setError('Access Denied: You must identify a student for the enrollment process.');
            return;
        }
        if (!selectedCourse && selectedSubjects.length === 0) {
            setError('Configuration Missing: Define either a course track or specific subject units.');
            return;
        }

        const enrollment = {
            id: Date.now(),
            student: selectedStudent,
            course: selectedCourse,
            semester: selectedSemester,
            subjects: selectedSubjects
        };

        setEnrollments(prev => [...prev, enrollment]);
        setSelectedStudent(null);
        setSelectedCourse(null);
        setSelectedSemester(1);
        setSelectedSubjects([]);
        setError(null);
    };

    const handleRemoveEnrollment = (id) => {
        setEnrollments(prev => prev.filter(e => e.id !== id));
    };

    const handleSubmitAll = async () => {
        if (enrollments.length === 0) {
            setError('Submission Halted: Queue is currently empty.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            for (const enrollment of enrollments) {
                // Enroll in course if selected
                if (enrollment.course) {
                    await axiosInstance.post(`/students/${enrollment.student.id}/enroll-course`, {
                        courseId: enrollment.course.id,
                        semester: enrollment.semester,
                        academicYear: new Date().getFullYear().toString()
                    });
                }

                // Enroll in subjects
                for (const subject of enrollment.subjects) {
                    await axiosInstance.post(`/students/${enrollment.student.id}/enroll-subject`, {
                        subjectId: subject.id,
                        semester: enrollment.semester, // Use selected semester from queue
                        academicYear: new Date().getFullYear().toString(),
                        status: 'ACTIVE'
                    });
                }
            }

            setSuccess(true);
            setEnrollments([]);
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError('Execution Conflict: Some records failed to synchronize. Please verify individual statuses.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{
                maxWidth: '1600px',
                mx: 'auto',
                p: { xs: 2, sm: 4 },
                fontFamily: universityTheme.typography.fontFamily,
                background: universityTheme.colors.background.default,
                minHeight: '100vh'
            }}>
                {/* Unified Header */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 4 },
                        mb: { xs: 3, md: 5 },
                        borderRadius: universityTheme.borderRadius.xl,
                        background: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.secondary.main} 100%)`,
                        color: universityTheme.colors.primary.contrast,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: universityTheme.shadows.lg
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
                        <Box>
                            <Button
                                startIcon={<MdArrowBack />}
                                onClick={() => navigate('/students')}
                                sx={{
                                    color: 'rgba(255,255,255,0.8)',
                                    textTransform: 'none',
                                    mb: 1,
                                    '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                                }}
                            >
                                Return to Records
                            </Button>
                            <Typography variant="h3" sx={{
                                fontWeight: 800,
                                mb: 0.5,
                                fontSize: { xs: '1.75rem', md: '3rem' },
                                letterSpacing: '-0.02em',
                                textShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                Enrollment Desk
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: { xs: '0.875rem', md: '1.25rem' } }}>
                                Course mapping and subject registration
                            </Typography>
                        </Box>

                        <Paper sx={{
                            px: { xs: 3, md: 4 },
                            py: 2,
                            borderRadius: universityTheme.borderRadius.lg,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            width: { xs: '100%', md: 'auto' }
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', md: 'flex-start' }, gap: 2 }}>
                                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
                                        Active Queue
                                    </Typography>
                                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, lineHeight: 1, fontSize: { xs: '2rem', md: '3rem' } }}>
                                        {enrollments.length}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: { xs: 40, md: 50 },
                                    height: { xs: 40, md: 50 },
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff'
                                }}>
                                    <MdLibraryBooks size={24} />
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                    {/* Decorative Background */}
                    <Box sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                    }} />
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: universityTheme.borderRadius.lg, boxShadow: universityTheme.shadows.md }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 4, borderRadius: universityTheme.borderRadius.lg, boxShadow: universityTheme.shadows.md }}>
                        Batch enrollment completed successfully!
                    </Alert>
                )}

                <Grid container spacing={4}>
                    {/* Control Panel */}
                    <Grid item xs={12} xl={4}>
                        <Paper sx={{
                            p: 4,
                            borderRadius: universityTheme.borderRadius.xl,
                            boxShadow: universityTheme.shadows.md,
                            border: `1px solid ${universityTheme.colors.neutral.gray[200]}`,
                            position: 'sticky',
                            top: 100
                        }}>
                            <Typography variant="h6" sx={{
                                fontWeight: 700,
                                color: universityTheme.colors.neutral.gray[900],
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}>
                                <MdLayers color={universityTheme.colors.secondary.main} size={24} />
                                Configuration Panel
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Autocomplete
                                    options={students}
                                    getOptionLabel={(option) => {
                                        if (!option) return '';
                                        const name = option.fullName || `${option.firstName || ''} ${option.lastName || ''}`.trim();
                                        return `${name || 'Unknown Student'} (${option.rollNumber || 'N/A'})`;
                                    }}
                                    value={selectedStudent}
                                    loading={searching}
                                    onInputChange={(e, value) => searchStudents(value)}
                                    onChange={(e, newValue) => setSelectedStudent(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Identify Student"
                                            placeholder="Search by name or roll no..."
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <MdSearch color={universityTheme.colors.primary.main} size={22} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <React.Fragment>
                                                        {searching ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </React.Fragment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: universityTheme.borderRadius.lg,
                                                }
                                            }}
                                        />
                                    )}
                                />

                                <Divider sx={{ my: 1 }}>
                                    <Chip label="Academic Details" size="small" />
                                </Divider>

                                <Autocomplete
                                    options={courses}
                                    getOptionLabel={(option) => `${option.courseName} [${option.courseCode}]`}
                                    value={selectedCourse}
                                    onChange={(e, newValue) => {
                                        setSelectedCourse(newValue);
                                        setSelectedSemester(1);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Program Track"
                                            placeholder="Select course..."
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: universityTheme.borderRadius.lg,
                                                }
                                            }}
                                        />
                                    )}
                                />

                                <TextField
                                    fullWidth
                                    select
                                    label="Target Semester"
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                                    disabled={!selectedCourse}
                                    SelectProps={{ native: true }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: universityTheme.borderRadius.lg,
                                        }
                                    }}
                                >
                                    {selectedCourse ? (
                                        Array.from({ length: selectedCourse.totalSemesters || 8 }, (_, i) => i + 1).map(sem => (
                                            <option key={sem} value={sem}>Semester {sem}</option>
                                        ))
                                    ) : (
                                        <option value={1}>Course selection required</option>
                                    )}
                                </TextField>

                                <Autocomplete
                                    multiple
                                    options={filteredSubjects}
                                    getOptionLabel={(option) => `${option.subjectName} (${option.subjectCode})`}
                                    value={selectedSubjects}
                                    onChange={(e, newValue) => setSelectedSubjects(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Subject Units"
                                            placeholder="Search and select units..."
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: universityTheme.borderRadius.lg,
                                                }
                                            }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                key={option.id}
                                                label={option.subjectCode}
                                                {...getTagProps({ index })}
                                                size="small"
                                                sx={{
                                                    borderRadius: universityTheme.borderRadius.sm,
                                                    bgcolor: universityTheme.colors.primary.light,
                                                    color: universityTheme.colors.primary.main,
                                                    fontWeight: 600
                                                }}
                                            />
                                        ))
                                    }
                                />

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleAddEnrollment}
                                    startIcon={<MdAdd />}
                                    sx={{
                                        borderRadius: universityTheme.borderRadius.lg,
                                        py: 1.5,
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        boxShadow: universityTheme.shadows.md,
                                        background: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.primary.dark} 100%)`,
                                    }}
                                >
                                    Add to Queue
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Content & Queue Viewer */}
                    <Grid item xs={12} xl={8}>
                        {/* Intelligent Profile Overlay */}
                        <Box sx={{ mb: 4 }}>
                            {selectedStudent ? (
                                <Zoom in={true}>
                                    <Paper sx={{
                                        p: 4,
                                        borderRadius: universityTheme.borderRadius.xl,
                                        background: `linear-gradient(135deg, ${universityTheme.colors.neutral.gray[800]} 0%, ${universityTheme.colors.neutral.gray[900]} 100%)`,
                                        color: '#fff',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: universityTheme.shadows.lg
                                    }}>
                                        {/* Decor */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: -50,
                                            right: -50,
                                            width: 200,
                                            height: 200,
                                            borderRadius: '50%',
                                            background: universityTheme.colors.secondary.main,
                                            opacity: 0.2,
                                            filter: 'blur(50px)'
                                        }} />

                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
                                            <Avatar
                                                src={selectedStudent.profilePictureUrl}
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    border: '4px solid rgba(255,255,255,0.2)',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                                    bgcolor: universityTheme.colors.primary.main,
                                                    fontSize: '2.5rem',
                                                    fontWeight: 700
                                                }}
                                            >
                                                {selectedStudent.firstName?.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                                                    {selectedStudent.fullName || `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim() || 'Unidentified Student'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        icon={<MdFormatListNumbered />}
                                                        label={selectedStudent.rollNumber || 'NO-ID'}
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(5px)' }}
                                                    />
                                                    <Chip
                                                        icon={<MdSchool />}
                                                        label={selectedStudent.course?.courseCode || 'Unassigned'}
                                                        sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(5px)' }}
                                                    />
                                                    <Chip
                                                        icon={<MdCheckCircle />}
                                                        label={`Sem ${selectedStudent.currentSemester || 0}`}
                                                        sx={{ bgcolor: universityTheme.colors.success.main, color: '#fff' }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Zoom>
                            ) : (
                                <Paper sx={{
                                    p: 6,
                                    borderRadius: universityTheme.borderRadius.xl,
                                    border: `2px dashed ${universityTheme.colors.neutral.gray[300]}`,
                                    bgcolor: universityTheme.colors.background.paper,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: '50%',
                                        bgcolor: universityTheme.colors.neutral.gray[100],
                                        color: universityTheme.colors.neutral.gray[400]
                                    }}>
                                        <MdOutlineAccountCircle size={48} />
                                    </Box>
                                    <Typography variant="h6" sx={{ color: universityTheme.colors.neutral.gray[600], fontWeight: 600 }}>
                                        No Student Selected
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.gray[500], maxWidth: 400 }}>
                                        Please use the configuration panel on the left to identify a student and begin the enrollment process.
                                    </Typography>
                                </Paper>
                            )}
                        </Box>

                        {/* Processing Queue Table */}
                        <Fade in={enrollments.length > 0}>
                            <Paper sx={{
                                borderRadius: universityTheme.borderRadius.xl,
                                overflow: 'hidden',
                                boxShadow: universityTheme.shadows.lg,
                                border: `1px solid ${universityTheme.colors.neutral.gray[200]}`
                            }}>
                                <Box sx={{
                                    p: { xs: 2.5, md: 3 },
                                    bgcolor: universityTheme.colors.neutral.gray[50],
                                    borderBottom: `1px solid ${universityTheme.colors.neutral.gray[200]}`,
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    alignItems: { xs: 'stretch', sm: 'center' },
                                    gap: 2
                                }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: universityTheme.colors.neutral.gray[900] }}>
                                            Syncing Queue
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[500] }}>
                                            {enrollments.length} records ready for processing
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
                                        <Button
                                            fullWidth={isMobile}
                                            variant="text"
                                            size="small"
                                            onClick={() => setEnrollments([])}
                                            sx={{ color: universityTheme.colors.error.main, fontWeight: 600 }}
                                        >
                                            Clear All
                                        </Button>
                                        <Button
                                            fullWidth={isMobile}
                                            variant="contained"
                                            startIcon={<MdSave />}
                                            onClick={handleSubmitAll}
                                            disabled={loading}
                                            sx={{
                                                bgcolor: universityTheme.colors.success.main,
                                                '&:hover': { bgcolor: universityTheme.colors.success.dark },
                                                fontWeight: 700,
                                                borderRadius: universityTheme.borderRadius.lg,
                                                boxShadow: universityTheme.shadows.md,
                                                px: 3
                                            }}
                                        >
                                            {loading ? 'Processing...' : 'Sync Batch'}
                                        </Button>
                                    </Box>
                                </Box>

                                {useMediaQuery(useTheme().breakpoints.down('md')) ? (
                                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {enrollments.map((enrollment) => (
                                            <Card key={enrollment.id} variant="outlined" sx={{ borderRadius: universityTheme.borderRadius.lg, border: `1px solid ${universityTheme.colors.neutral.gray[200]}` }}>
                                                <CardContent sx={{ p: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ width: 40, height: 40, fontSize: '1rem', bgcolor: universityTheme.colors.primary.light, color: universityTheme.colors.primary.main, fontWeight: 700 }}>
                                                                {enrollment.student.firstName?.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                    {enrollment.student.fullName || `${enrollment.student.firstName} ${enrollment.student.lastName}`}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[500], display: 'block' }}>
                                                                    Roll: {enrollment.student.rollNumber}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <IconButton size="small" onClick={() => handleRemoveEnrollment(enrollment.id)} sx={{ color: universityTheme.colors.error.main }}>
                                                                <MdDelete />
                                                        </IconButton>
                                                    </Box>

                                                    <Divider sx={{ my: 1.5, opacity: 0.5 }} />

                                                    <Grid container spacing={1}>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>Course</Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                                <Chip 
                                                                    label={enrollment.course?.courseCode || 'N/A'} 
                                                                    size="small" 
                                                                    sx={{ borderRadius: universityTheme.borderRadius.sm, height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: universityTheme.colors.accent.light, color: universityTheme.colors.accent.dark }} 
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>Semester</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>Sem {enrollment.semester}</Typography>
                                                        </Grid>
                                                        <Grid item xs={12} sx={{ mt: 1 }}>
                                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', display: 'block', mb: 0.5 }}>Subjects</Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {enrollment.subjects.map(sub => (
                                                                    <Chip 
                                                                        key={sub.id} 
                                                                        label={sub.subjectCode} 
                                                                        size="small" 
                                                                        variant="outlined"
                                                                        sx={{ borderRadius: universityTheme.borderRadius.sm, height: 18, fontSize: '0.6rem' }} 
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableHead sx={{ bgcolor: universityTheme.colors.neutral.gray[50] }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.gray[600] }}>Student</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.gray[600] }}>Course Data</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.gray[600] }}>Subjects</TableCell>
                                                    <TableCell align="right"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {enrollments.map((enrollment) => (
                                                    <TableRow key={enrollment.id} hover>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: universityTheme.colors.primary.light, color: universityTheme.colors.primary.main, fontWeight: 700 }}>
                                                                    {enrollment.student.firstName?.charAt(0)}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                        {enrollment.student.fullName || `${enrollment.student.firstName} ${enrollment.student.lastName}`}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[500] }}>
                                                                        {enrollment.student.rollNumber}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {enrollment.course ? (
                                                                <Box>
                                                                    <Chip
                                                                        label={enrollment.course.courseCode}
                                                                        size="small"
                                                                        sx={{
                                                                            borderRadius: universityTheme.borderRadius.sm,
                                                                            fontWeight: 700,
                                                                            mb: 0.5,
                                                                            bgcolor: universityTheme.colors.accent.light,
                                                                            color: universityTheme.colors.accent.dark
                                                                        }}
                                                                    />
                                                                    <Typography variant="caption" display="block" sx={{ color: universityTheme.colors.neutral.gray[500] }}>
                                                                        Semester {enrollment.semester}
                                                                    </Typography>
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="caption" sx={{ fontStyle: 'italic', color: universityTheme.colors.neutral.gray[400] }}>Unmapped</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {enrollment.subjects.length > 0 ? (
                                                                    enrollment.subjects.map((sub) => (
                                                                        <Tooltip key={sub.id} title={sub.subjectName}>
                                                                            <Chip
                                                                                label={sub.subjectCode}
                                                                                size="small"
                                                                                sx={{
                                                                                    height: 20,
                                                                                    fontSize: '0.65rem',
                                                                                    bgcolor: universityTheme.colors.neutral.gray[100],
                                                                                    color: universityTheme.colors.neutral.gray[700]
                                                                                }}
                                                                            />
                                                                        </Tooltip>
                                                                    ))
                                                                ) : (
                                                                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: universityTheme.colors.neutral.gray[400] }}>None</Typography>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRemoveEnrollment(enrollment.id)}
                                                                sx={{ color: universityTheme.colors.neutral.gray[400], '&:hover': { color: universityTheme.colors.error.main } }}
                                                            >
                                                                <MdDelete />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Paper>
                        </Fade>
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
};

export default StudentEnrollment;
