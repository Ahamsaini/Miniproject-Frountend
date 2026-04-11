import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Avatar,
    Fade,
    Zoom,
    Tab,
    Tabs,
    Stack,
    Divider
} from '@mui/material';
import {
    MdVisibility,
    MdEdit,
    MdCheckCircle,
    MdCancel,
    MdPerson,
    MdSchool,
    MdSearch,
    MdFilterList,
    MdVerifiedUser,
    MdAdminPanelSettings
} from 'react-icons/md';
import axiosInstance from '../api/axiosInstance';
import universityTheme from '../theme/universityTheme';

const AdminOnboarding = () => {
    const [tabValue, setTabValue] = useState(0); // 0 for Students, 1 for Teachers
    const [pendingData, setPendingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    // Student Form Data
    const [studentEditFormData, setStudentEditFormData] = useState({
        rollNumber: '',
        registrationNumber: '',
        courseId: '',
        currentSemester: 1,
        academicYear: '',
        batch: '',
        section: ''
    });

    // Teacher Form Data (if needed in future)
    const [teacherEditFormData, setTeacherEditFormData] = useState({
        employeeId: '',
        department: '',
        designation: '',
        specialization: ''
    });

    const [keyword, setKeyword] = useState('');
    const [department, setDepartment] = useState('');
    const [courseId, setCourseId] = useState('');
    const [semester, setSemester] = useState('');
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = tabValue === 0 ? '/students/pending' : '/teachers/pending';
            
            // Construct params dynamically to avoid sending empty parameters
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', rowsPerPage);
            
            if (keyword) params.append('keyword', keyword);
            
            if (tabValue === 0) {
                if (courseId) params.append('courseId', courseId);
                if (semester) params.append('semester', semester);
            } else {
                if (department) params.append('department', department);
            }

            const response = await axiosInstance.get(`${endpoint}?${params.toString()}`);
            setPendingData(response.data.content || []);
            setTotalElements(response.data.totalElements || 0);
            setError('');
        } catch (err) {
            setError(`Failed to fetch pending ${tabValue === 0 ? 'student' : 'teacher'} registrations`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axiosInstance.get('/courses/all');
            setCourses(response.data);
            const depts = [...new Set(response.data.map(c => c.department).filter(Boolean))];
            setDepartments(depts);
        } catch (err) {
            console.error('Failed to fetch courses', err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [page, rowsPerPage, keyword, courseId, semester, department, tabValue]);

    const handleApprove = async (id) => {
        try {
            const endpoint = tabValue === 0 ? `/students/${id}/approve` : `/teachers/${id}/approve`;
            await axiosInstance.post(endpoint);
            fetchData();
            if (selectedItem?.id === id) setDetailsOpen(false);
        } catch (err) {
            setError(`Failed to approve ${tabValue === 0 ? 'student' : 'teacher'}`);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this registration?')) return;
        try {
            const endpoint = tabValue === 0 ? `/students/${id}/reject` : `/teachers/${id}/reject`;
            await axiosInstance.post(endpoint);
            fetchData();
            if (selectedItem?.id === id) setDetailsOpen(false);
        } catch (err) {
            setError(`Failed to reject ${tabValue === 0 ? 'student' : 'teacher'}`);
        }
    };

    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setDetailsOpen(true);
    };

    const handleEditClick = (item) => {
        setSelectedItem(item);
        if (tabValue === 0) {
            setStudentEditFormData({
                rollNumber: item.rollNumber || '',
                registrationNumber: item.registrationNumber || '',
                courseId: item.courseId || '',
                currentSemester: item.currentSemester || 1,
                academicYear: item.academicYear || '',
                batch: item.batch || '',
                section: item.section || ''
            });
        } else {
            setTeacherEditFormData({
                employeeId: item.employeeId || '',
                department: item.department || '',
                designation: item.designation || '',
                specialization: item.specialization || ''
            });
        }
        setEditOpen(true);
    };

    const handleEditSubmit = async () => {
        if (tabValue === 0) {
            // ... Student validation and cleanup
            const academicYearPattern = /^\d{4}-\d{4}$/;
            if (studentEditFormData.academicYear && !academicYearPattern.test(studentEditFormData.academicYear)) {
                setError('Invalid Academic Year format. Please use YYYY-YYYY (e.g., 2024-2025)');
                return;
            }

            const payload = Object.keys(studentEditFormData).reduce((acc, key) => {
                const value = studentEditFormData[key];
                acc[key] = (value === '' || value === undefined) ? null : value;
                return acc;
            }, {});

            try {
                await axiosInstance.put(`/students/${selectedItem.id}`, payload);
                fetchData();
                setEditOpen(false);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update student information');
            }
        } else {
            // Teacher Update Logic
            try {
                await axiosInstance.put(`/teachers/${selectedItem.id}`, teacherEditFormData);
                // Automatically approve teacher after updating their onboarding details
                try {
                    await axiosInstance.post(`/teachers/${selectedItem.id}/approve`);
                } catch (approveErr) {
                    console.error('Auto-approval failed:', approveErr);
                }
                fetchData();
                setEditOpen(false);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update teacher information');
            }
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{
            maxWidth: '1600px',
            mx: 'auto',
            pb: { xs: 10, sm: 4 },
            px: { xs: 0, sm: 4 },
            minHeight: '100vh',
            bgcolor: 'transparent'
        }}>
            <Fade in={true} timeout={800}>
                <Box>
                    {/* Header Section */}
                    <Box
                        sx={{
                            p: { xs: 4, sm: 6 },
                            mb: { xs: 0, sm: 4 },
                            borderRadius: { xs: 0, sm: universityTheme.borderRadius.xl },
                            background: `linear-gradient(135deg, ${universityTheme.colors.primary.dark} 0%, ${universityTheme.colors.primary.main} 100%)`,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: universityTheme.shadows.lg
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Grid container justifyContent="space-between" alignItems="center" spacing={3}>
                                <Grid item xs={12} md={8}>
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
                                            <MdAdminPanelSettings size={30} />
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                                            Campus Gatekeeper
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, maxWidth: 600 }}>
                                        Verify academic credentials and activate new accounts for the {tabValue === 0 ? 'student body' : 'academic faculty'}.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: universityTheme.borderRadius.lg,
                                            bgcolor: 'rgba(255,255,255,0.12)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                Pending Verification
                                            </Typography>
                                            <Typography variant="h3" sx={{ fontWeight: 900 }}>{totalElements}</Typography>
                                        </Box>
                                        <MdVerifiedUser size={40} style={{ opacity: 0.5 }} />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                        {/* Decorative Background Elements */}
                        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
                        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                    </Box>

                    {error && <Alert severity="error" variant="filled" sx={{ m: 2, borderRadius: '16px' }}>{error}</Alert>}

                    {/* Main Content Area */}
                    <Box sx={{ p: { xs: 2, sm: 0 } }}>
                        <Paper elevation={0} sx={{
                            borderRadius: universityTheme.borderRadius.xl,
                            border: `1px solid ${universityTheme.colors.neutral.light}`,
                            overflow: 'hidden',
                            bgcolor: 'white'
                        }}>
                            <Tabs
                                value={tabValue}
                                onChange={(e, v) => { setTabValue(v); setPage(0); }}
                                variant="fullWidth"
                                sx={{
                                    borderBottom: 1,
                                    borderColor: universityTheme.colors.neutral.gray[100],
                                    '& .MuiTab-root': {
                                        py: 3.5,
                                        fontWeight: 900,
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        color: universityTheme.colors.neutral.gray[400],
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&.Mui-selected': { 
                                            color: universityTheme.colors.primary.main,
                                            bgcolor: `${universityTheme.colors.primary.main}05`
                                        }
                                    },
                                    '& .MuiTabs-indicator': { 
                                        height: 4, 
                                        borderRadius: '4px 4px 0 0',
                                        bgcolor: universityTheme.colors.primary.main
                                    }
                                }}
                            >
                                <Tab icon={<MdPerson size={22} />} iconPosition="start" label="Student Applications" />
                                <Tab icon={<MdSchool size={22} />} iconPosition="start" label="Faculty Verification" />
                            </Tabs>

                            {/* Filters Bar */}
                            <Box sx={{ p: { xs: 3, sm: 5 }, bgcolor: universityTheme.colors.neutral.gray[50] }}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid item xs={12} md={5}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search name, email, or temporary ID..."
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            InputProps={{
                                                startAdornment: <MdSearch size={22} style={{ marginRight: 12, color: universityTheme.colors.neutral.gray[400] }} />,
                                                sx: { 
                                                    borderRadius: universityTheme.borderRadius.lg, 
                                                    bgcolor: 'white',
                                                    '& fieldset': { borderColor: `${universityTheme.colors.neutral.gray[200]} !important` }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={7}>
                                        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', p: 0.5 }}>
                                            <Chip
                                                label="Global Queue"
                                                onClick={() => setDepartment('')}
                                                sx={{ 
                                                    fontWeight: 900, 
                                                    borderRadius: '10px',
                                                    bgcolor: department === '' ? universityTheme.colors.primary.main : 'white',
                                                    color: department === '' ? 'white' : universityTheme.colors.neutral.gray[700],
                                                    border: `1px solid ${department === '' ? universityTheme.colors.primary.main : universityTheme.colors.neutral.gray[200]}`,
                                                    px: 1,
                                                    height: 44,
                                                    '&:hover': { bgcolor: department === '' ? universityTheme.colors.primary.dark : universityTheme.colors.neutral.gray[50] }
                                                }}
                                            />
                                            {departments.slice(0, 5).map(dept => (
                                                <Chip
                                                    key={dept}
                                                    label={dept}
                                                    onClick={() => setDepartment(dept)}
                                                    sx={{ 
                                                        fontWeight: 900, 
                                                        borderRadius: '10px',
                                                        bgcolor: department === dept ? universityTheme.colors.primary.main : 'white',
                                                        color: department === dept ? 'white' : universityTheme.colors.neutral.gray[700],
                                                        border: `1px solid ${department === dept ? universityTheme.colors.primary.main : universityTheme.colors.neutral.gray[200]}`,
                                                        height: 44,
                                                        px: 1,
                                                        '&:hover': { bgcolor: department === dept ? universityTheme.colors.primary.dark : universityTheme.colors.neutral.gray[50] }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Data Rendering */}
                            {loading && pendingData.length === 0 ? (
                                <Box sx={{ py: 10, textAlign: 'center' }}>
                                    <CircularProgress thickness={5} size={60} />
                                    <Typography sx={{ mt: 2, fontWeight: 700, color: 'slate.400' }}>Loading Applications...</Typography>
                                </Box>
                            ) : pendingData.length === 0 ? (
                                <Box sx={{ py: 15, textAlign: 'center', bgcolor: 'white' }}>
                                    <Avatar sx={{ width: 100, height: 100, bgcolor: 'slate.50', mx: 'auto', mb: 3 }}>
                                        <MdVerifiedUser size={50} className="text-slate-200" />
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'slate.800' }}>Queue is Clear!</Typography>
                                    <Typography sx={{ color: 'slate.500' }}>No pending {tabValue === 0 ? 'student' : 'teacher'} registrations found.</Typography>
                                </Box>
                            ) : (
                                <Box>
                                    {/* Desktop Table View */}
                                    <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
                                        <Table sx={{ minWidth: 1000 }}>
                                            <TableHead sx={{ bgcolor: 'slate.50' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 800, color: 'slate.500', textTransform: 'uppercase', py: 3 }}>Applicant Profile</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: 'slate.500', textTransform: 'uppercase' }}>Academic Identity</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: 'slate.500', textTransform: 'uppercase' }}>Affiliation</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: 'slate.500', textTransform: 'uppercase' }}>Program / Role</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 800, color: 'slate.500', textTransform: 'uppercase' }}>Action Center</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pendingData.map((item) => (
                                                    <TableRow key={item.id} hover sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: 'blue.50/30' } }}>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 900, width: 44, height: 44, boxShadow: 2 }}>
                                                                    {item.firstName?.[0]}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 800, color: 'slate.800', lineHeight: 1.2 }}>
                                                                        {item.firstName} {item.lastName}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: 'slate.500', fontWeight: 500 }}>{item.email}</Typography>
                                                                </Box>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={tabValue === 0 ? (item.rollNumber || 'NO ROLL') : (item.employeeId || 'NO ID')}
                                                                size="small"
                                                                sx={{ fontWeight: 900, borderRadius: '8px', bgcolor: 'slate.100', color: 'slate.700', fontFamily: 'monospace' }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontWeight: 700, color: 'slate.600' }}>
                                                                {tabValue === 0 ? `Batch ${item.batch || 'N/A'}` : item.department}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                                {tabValue === 0 ? (item.courseCode || 'Awaiting Assign') : item.designation}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    onClick={() => handleApprove(item.id)}
                                                                    sx={{ bgcolor: 'success.main', fontWeight: 900, borderRadius: '10px' }}
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <IconButton onClick={() => handleViewDetails(item)} sx={{ bgcolor: 'slate.50', color: 'slate.600' }}>
                                                                    <MdVisibility size={20} />
                                                                </IconButton>
                                                                <IconButton onClick={() => handleEditClick(item)} sx={{ bgcolor: 'slate.50', color: 'primary.main' }}>
                                                                    <MdEdit size={18} />
                                                                </IconButton>
                                                                <IconButton onClick={() => handleReject(item.id)} sx={{ bgcolor: 'rose.50', color: 'rose.600' }}>
                                                                    <MdCancel size={20} />
                                                                </IconButton>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {/* Mobile Card View */}
                                    <Box sx={{ display: { xs: 'block', md: 'none' }, p: 3 }}>
                                        <Stack spacing={3}>
                                            {pendingData.map((item) => (
                                                <Fade in={true} key={item.id}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: universityTheme.borderRadius.xl,
                                                            border: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            bgcolor: 'white'
                                                        }}
                                                    >
                                                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 6, bottom: 0, bgcolor: universityTheme.colors.primary.main }} />
                                                        
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                <Avatar sx={{ 
                                                                    bgcolor: universityTheme.colors.primary.main, 
                                                                    fontWeight: 900,
                                                                    width: 50, height: 50,
                                                                    boxShadow: universityTheme.shadows.sm,
                                                                    border: '2px solid white'
                                                                }}>
                                                                    {item.firstName?.[0]}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], lineHeight: 1.1, mb: 0.5 }}>
                                                                        {item.firstName} {item.lastName}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 700 }}>
                                                                        {item.email}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                            <Chip
                                                                label={tabValue === 0 ? (item.rollNumber || 'NEW') : (item.employeeId || 'NEW')}
                                                                size="small"
                                                                sx={{ 
                                                                    fontWeight: 900, 
                                                                    borderRadius: '8px', 
                                                                    bgcolor: universityTheme.colors.neutral.gray[50],
                                                                    fontSize: '0.7rem',
                                                                    fontFamily: 'monospace'
                                                                }}
                                                            />
                                                        </Box>

                                                        <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                                                        <Grid container spacing={2} sx={{ mb: 4 }}>
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[300], fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                                                                    {tabValue === 0 ? 'Current Batch' : 'Department'}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[700] }}>
                                                                    {tabValue === 0 ? (item.batch || 'N/A') : (item.department || 'N/A')}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[300], fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                                                                    Program / Role
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 800, color: universityTheme.colors.primary.main }}>
                                                                    {tabValue === 0 ? (item.courseCode || 'PENDING') : (item.designation || 'STAFF')}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>

                                                        <Stack direction="row" spacing={1.5}>
                                                            <Button
                                                                fullWidth
                                                                variant="contained"
                                                                onClick={() => handleApprove(item.id)}
                                                                sx={{ 
                                                                    borderRadius: universityTheme.borderRadius.lg, 
                                                                    fontWeight: 900, 
                                                                    py: 1.5,
                                                                    bgcolor: universityTheme.colors.success,
                                                                    '&:hover': { bgcolor: '#059669' }
                                                                }}
                                                            >
                                                                Quick Approve
                                                            </Button>
                                                            <IconButton 
                                                                onClick={() => handleViewDetails(item)}
                                                                sx={{ 
                                                                    borderRadius: universityTheme.borderRadius.lg, 
                                                                    bgcolor: universityTheme.colors.neutral.gray[50],
                                                                    color: universityTheme.colors.neutral.gray[600],
                                                                    width: 48
                                                                }}
                                                            >
                                                                <MdVisibility size={22} />
                                                            </IconButton>
                                                            <IconButton 
                                                                onClick={() => handleEditClick(item)}
                                                                sx={{ 
                                                                    borderRadius: universityTheme.borderRadius.lg, 
                                                                    bgcolor: `${universityTheme.colors.primary.main}10`,
                                                                    color: universityTheme.colors.primary.main,
                                                                    width: 48
                                                                }}
                                                            >
                                                                <MdEdit size={20} />
                                                            </IconButton>
                                                        </Stack>
                                                    </Paper>
                                                </Fade>
                                            ))}
                                        </Stack>
                                    </Box>

                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        component="div"
                                        count={totalElements}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        sx={{ borderTop: 1, borderColor: 'divider' }}
                                    />
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Fade>

            {/* Re-using styled dialogs from original but slightly improved */}
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', color: 'slate.900' }}>Review Profile</DialogTitle>
                <DialogContent>
                    {selectedItem && (
                        <Box sx={{ py: 2 }}>
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4, p: 2, bgcolor: 'slate.50', borderRadius: '16px' }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 900 }}>{selectedItem.firstName[0]}</Avatar>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedItem.firstName} {selectedItem.lastName}</Typography>
                                    <Typography sx={{ color: 'slate.500', fontWeight: 500 }}>{selectedItem.email}</Typography>
                                    <Chip label={tabValue === 0 ? 'Student Applicant' : 'Faculty Applicant'} size="small" color="primary" sx={{ mt: 1, fontWeight: 800 }} />
                                </Box>
                            </Stack>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase' }}>Academic ID</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{tabValue === 0 ? (selectedItem.rollNumber || 'N/A') : (selectedItem.employeeId || 'N/A')}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase' }}>{tabValue === 0 ? 'Batch/Cohort' : 'Department'}</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{tabValue === 0 ? (selectedItem.batch || 'N/A') : (selectedItem.department || 'N/A')}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" sx={{ color: 'slate.400', fontWeight: 800, textTransform: 'uppercase' }}>Program / Program Code</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{tabValue === 0 ? (selectedItem.courseName || 'Unassigned') : (selectedItem.designation || 'Staff')}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button fullWidth variant="outlined" color="error" onClick={() => handleReject(selectedItem.id)} sx={{ py: 1.5, borderRadius: '12px', fontWeight: 900 }}>Reject</Button>
                    <Button fullWidth variant="contained" color="success" onClick={() => handleApprove(selectedItem.id)} sx={{ py: 1.5, borderRadius: '12px', fontWeight: 900 }}>Approve Entry</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog Logic with updated aesthetics */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 900, color: 'slate.900' }}>Modify Registration Info</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            {tabValue === 0 ? (
                                <>
                                    <Grid item xs={6}>
                                        <TextField fullWidth label="Roll Number" value={studentEditFormData.rollNumber} onChange={(e) => setStudentEditFormData({ ...studentEditFormData, rollNumber: e.target.value })} InputProps={{ sx: { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth label="Enrollment No" value={studentEditFormData.registrationNumber} onChange={(e) => setStudentEditFormData({ ...studentEditFormData, registrationNumber: e.target.value })} InputProps={{ sx: { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField select fullWidth label="Assign Course" value={studentEditFormData.courseId} onChange={(e) => setStudentEditFormData({ ...studentEditFormData, courseId: e.target.value })} SelectProps={{ native: true }} InputProps={{ sx: { borderRadius: '12px' } }}>
                                            <option value="">Select Course</option>
                                            {courses.map(course => <option key={course.id} value={course.id}>{course.courseName} ({course.courseCode})</option>)}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth label="Semester" type="number" value={studentEditFormData.currentSemester} onChange={(e) => setStudentEditFormData({ ...studentEditFormData, currentSemester: parseInt(e.target.value) })} InputProps={{ sx: { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth label="Batch Year" value={studentEditFormData.batch} onChange={(e) => setStudentEditFormData({ ...studentEditFormData, batch: e.target.value })} InputProps={{ sx: { borderRadius: '12px' } }} />
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Employee ID" value={teacherEditFormData.employeeId} onChange={(e) => setTeacherEditFormData({ ...teacherEditFormData, employeeId: e.target.value })} InputProps={{ sx: { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Department" value={teacherEditFormData.department} onChange={(e) => setTeacherEditFormData({ ...teacherEditFormData, department: e.target.value })} InputProps={{ sx: { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Designation" value={teacherEditFormData.designation} onChange={(e) => setTeacherEditFormData({ ...teacherEditFormData, designation: e.target.value })} InputProps={{ sx: { borderRadius: '12px' } }} />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSubmit} sx={{ borderRadius: '12px', fontWeight: 900, px: 4 }}>Save & Sync</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );

};

export default AdminOnboarding;
