import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Grid,
    MenuItem,
    Divider,
    Fade,
    Chip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { MdCheckCircle } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import UniversityLogo from '../components/UniversityLogo';
import Footer from '../components/Footer';
import universityTheme from '../theme/universityTheme';

const Register = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialRole = queryParams.get('role') || 'STUDENT';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: initialRole,
        department: '',
        phoneNumber: '',
        // Student specific fields
        rollNumber: '',
        registrationNumber: '',
        batch: '',
        section: '',
        courseCode: '',
        courseName: '',
        academicYear: '',
        currentSemester: 1
    });
    const [courses, setCourses] = useState([]);
    const [totalSemesters, setTotalSemesters] = useState(8);
    const [fetchingCourses, setFetchingCourses] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [mounted, setMounted] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setMounted(true);
        const fetchCourses = async () => {
            setFetchingCourses(true);
            try {
                const response = await axiosInstance.get('courses/all');
                setCourses(response.data.content || (Array.isArray(response.data) ? response.data : []));
            } catch (err) {
                console.error('Failed to fetch courses', err);
            } finally {
                setFetchingCourses(false);
            }
        };

        fetchCourses();

        if (queryParams.get('role')) {
            setFormData(prev => ({ ...prev, role: queryParams.get('role') }));
        }
    }, [location.search]);

    const handleCourseChange = (e) => {
        const selectedCourse = courses.find(c => c.id === e.target.value);
        if (selectedCourse) {
            setFormData(prev => ({
                ...prev,
                courseCode: selectedCourse.courseCode,
                courseName: selectedCourse.courseName,
                currentSemester: 1
            }));
            setTotalSemesters(selectedCourse.totalSemesters || 8);
        } else {
            setFormData(prev => ({
                ...prev,
                courseCode: '',
                courseName: '',
                currentSemester: 1
            }));
            setTotalSemesters(8);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        if (formData.password.length < 8) {
            setValidationError('Password must be at least 8 characters long');
            return;
        }

        dispatch(loginStart());

        try {
            const response = await axiosInstance.post('auth/register', formData);
            console.log('Registration successful:', response.data);
            if (formData.role === 'STUDENT') {
                dispatch(loginFailure('Registration successful! Please wait for admin approval before logging in.'));
                setTimeout(() => navigate('/login'), 5000);
            } else {
                navigate('/login');
            }
        } catch (err) {
            console.error('Registration error:', err.response?.data);
            const message = err.response?.data?.message
                || err.response?.data?.error
                || 'Registration failed. Please check your details.';
            dispatch(loginFailure(message));
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box sx={{ flex: 1, bgcolor: universityTheme.colors.neutral.light, py: 6 }}>
                <Container maxWidth="md">
                    <Fade in={mounted} timeout={600}>
                        <Box>
                            {/* Header */}
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <UniversityLogo size="large" />
                                <Typography
                                    sx={{
                                        fontFamily: universityTheme.typography.fontFamily.heading,
                                        fontSize: '2rem',
                                        fontWeight: universityTheme.typography.fontWeight.bold,
                                        color: universityTheme.colors.primary.main,
                                        mt: 3,
                                        mb: 1,
                                    }}
                                >
                                    Join {universityTheme.university.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: universityTheme.colors.neutral.medium,
                                        fontSize: '1rem',
                                    }}
                                >
                                    Lab Management System Registration
                                </Typography>
                                <Chip
                                    label={`${formData.role.charAt(0) + formData.role.slice(1).toLowerCase()} Account`}
                                    sx={{
                                        mt: 2,
                                        bgcolor: universityTheme.colors.accent.main,
                                        color: universityTheme.colors.accent.contrast,
                                        fontWeight: universityTheme.typography.fontWeight.semibold,
                                    }}
                                />
                            </Box>

                            {/* Form */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 3, sm: 5 },
                                    borderRadius: universityTheme.borderRadius['2xl'],
                                    border: `1px solid ${universityTheme.colors.neutral.light}`,
                                    boxShadow: universityTheme.shadows.xl,
                                    bgcolor: universityTheme.colors.neutral.white,
                                }}
                            >
                                {(error || validationError) && (
                                    <Fade in={true}>
                                        <Alert
                                            severity={error?.includes('successful') ? "success" : "error"}
                                            icon={error?.includes('successful') ? <MdCheckCircle /> : undefined}
                                            sx={{
                                                mb: 3,
                                                borderRadius: universityTheme.borderRadius.lg,
                                            }}
                                        >
                                            {validationError || error}
                                        </Alert>
                                    </Fade>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* Personal Information */}
                                    <Typography
                                        sx={{
                                            fontFamily: universityTheme.typography.fontFamily.heading,
                                            fontSize: '1.125rem',
                                            fontWeight: universityTheme.typography.fontWeight.semibold,
                                            color: universityTheme.colors.primary.main,
                                            mb: 2,
                                        }}
                                    >
                                        Personal Information
                                    </Typography>
                                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="First Name"
                                                name="firstName"
                                                required
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: universityTheme.borderRadius.lg,
                                                    },
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                name="lastName"
                                                required
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: universityTheme.borderRadius.lg,
                                                    },
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email Address"
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: universityTheme.borderRadius.lg,
                                                    },
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Password"
                                                name="password"
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                helperText="Minimum 8 characters"
                                                error={formData.password.length > 0 && formData.password.length < 8}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: universityTheme.borderRadius.lg,
                                                    },
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Phone Number"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: universityTheme.borderRadius.lg,
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 3 }} />

                                    {/* Role-specific fields */}
                                    {formData.role === 'STUDENT' ? (
                                        <>
                                            <Typography
                                                sx={{
                                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                                    fontSize: '1.125rem',
                                                    fontWeight: universityTheme.typography.fontWeight.semibold,
                                                    color: universityTheme.colors.primary.main,
                                                    mb: 2,
                                                }}
                                            >
                                                Academic Information
                                            </Typography>
                                            <Grid container spacing={2.5}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        select
                                                        label="Select Course"
                                                        name="courseId"
                                                        required
                                                        value={courses.find(c => c.courseCode === formData.courseCode)?.id || ''}
                                                        onChange={handleCourseChange}
                                                        disabled={fetchingCourses}
                                                        helperText={formData.courseCode ? `Code: ${formData.courseCode} | Name: ${formData.courseName}` : 'Please select your course'}
                                                        SelectProps={{ native: isMobile }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            },
                                                        }}
                                                    >
                                                        {isMobile ? (
                                                            <>
                                                                <option value="">Select Course</option>
                                                                {courses.map((course) => (
                                                                    <option key={course.id} value={course.id}>
                                                                        {course.courseName} ({course.courseCode})
                                                                    </option>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            [
                                                                <MenuItem key="placeholder" value="">
                                                                    <em>Select Course</em>
                                                                </MenuItem>,
                                                                ...courses.map((course) => (
                                                                    <MenuItem key={course.id} value={course.id}>
                                                                        {course.courseName} ({course.courseCode})
                                                                    </MenuItem>
                                                                ))
                                                            ]
                                                        )}
                                                    </TextField>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Roll Number"
                                                        name="rollNumber"
                                                        required
                                                        value={formData.rollNumber}
                                                        onChange={handleChange}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Enrollment Number"
                                                        name="registrationNumber"
                                                        required
                                                        value={formData.registrationNumber}
                                                        onChange={handleChange}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Batch"
                                                        name="batch"
                                                        required
                                                        value={formData.batch}
                                                        onChange={handleChange}
                                                        placeholder="e.g. 2024-2028"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Section"
                                                        name="section"
                                                        required
                                                        value={formData.section}
                                                        onChange={handleChange}
                                                        placeholder="e.g. A"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Academic Year"
                                                        name="academicYear"
                                                        required
                                                        value={formData.academicYear}
                                                        onChange={handleChange}
                                                        placeholder="e.g. 2024-2025"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        select
                                                        label="Current Semester"
                                                        name="currentSemester"
                                                        required
                                                        value={formData.currentSemester}
                                                        onChange={handleChange}
                                                        SelectProps={{ native: isMobile }}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            },
                                                        }}
                                                    >
                                                        {isMobile ? (
                                                            [...Array(totalSemesters)].map((_, i) => (
                                                                <option key={i + 1} value={i + 1}>
                                                                    Semester {i + 1}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            [...Array(totalSemesters)].map((_, i) => (
                                                                <MenuItem key={i + 1} value={i + 1}>
                                                                    Semester {i + 1}
                                                                </MenuItem>
                                                            ))
                                                        )}
                                                    </TextField>
                                                </Grid>
                                            </Grid>
                                        </>
                                    ) : (
                                        <>
                                            <Typography
                                                sx={{
                                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                                    fontSize: '1.125rem',
                                                    fontWeight: universityTheme.typography.fontWeight.semibold,
                                                    color: universityTheme.colors.primary.main,
                                                    mb: 2,
                                                }}
                                            >
                                                Professional Information
                                            </Typography>
                                            <Grid container spacing={2.5}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Department"
                                                        name="department"
                                                        value={formData.department}
                                                        onChange={handleChange}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: universityTheme.borderRadius.lg,
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </>
                                    )}

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        sx={{
                                            mt: 4,
                                            py: 1.5,
                                            bgcolor: universityTheme.colors.primary.main,
                                            borderRadius: universityTheme.borderRadius.lg,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: universityTheme.typography.fontWeight.semibold,
                                            boxShadow: universityTheme.shadows.md,
                                            '&:hover': {
                                                bgcolor: universityTheme.colors.primary.dark,
                                                boxShadow: universityTheme.shadows.lg,
                                            },
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
                                    </Button>
                                </form>

                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium }}>
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
                                            Sign in
                                        </Button>
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default Register;
