import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Pagination,
    Skeleton,
    Tooltip,
    Fade,
    Avatar,
    Grid,
    useTheme,
    useMediaQuery,
    Stack,
    Card,
    CardContent,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    MdSearch,
    MdAdd,
    MdEdit,
    MdDelete,
    MdVisibility,
    MdFilterList,
    MdSchool,
    MdCategory,
    MdAccessTime,
    MdLayers
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, deleteCourse } from '../features/courses/coursesSlice';
import { useNavigate } from 'react-router-dom';
import universityTheme from '../theme/universityTheme';

const CourseList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { items, loading, pagination } = useSelector((state) => state.courses);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchCourses({ page: 0, size: 10 }));
    }, [dispatch]);

    const handlePageChange = (event, value) => {
        dispatch(fetchCourses({ page: value - 1, size: 10, keyword: searchTerm }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(fetchCourses({ page: 0, size: 10, keyword: searchTerm }));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            dispatch(deleteCourse(id));
        }
    };

    const courseItems = useMemo(() => Array.isArray(items) ? items : [], [items]);

    const getStatusChip = (status) => {
        const config = {
            ACTIVE: { label: 'Active', color: 'success' },
            INACTIVE: { label: 'Inactive', color: 'default' },
            DRAFT: { label: 'Draft', color: 'warning' }
        };
        const s = config[status] || config.INACTIVE;
        return (
            <Chip
                label={s.label}
                size="small"
                color={s.color}
                sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: '6px' }}
            />
        );
    };

    const renderMobileView = () => (
        <Stack spacing={2.5}>
            {courseItems.map((course) => (
                <Fade in={true} key={course.id}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: universityTheme.borderRadius.xl,
                            border: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                            overflow: 'hidden',
                            bgcolor: 'white',
                            position: 'relative'
                        }}
                    >
                        <Box sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: 6, 
                            bottom: 0, 
                            bgcolor: course.status === 'ACTIVE' ? universityTheme.colors.success : universityTheme.colors.neutral.gray[300] 
                        }} />
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 900,
                                    color: universityTheme.colors.primary.main,
                                    bgcolor: `${universityTheme.colors.primary.main}10`,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '8px',
                                    fontSize: '0.8rem'
                                }}>
                                    {course.courseCode}
                                </Typography>
                                {getStatusChip(course.status)}
                            </Box>
                            
                            <Typography variant="h6" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], mb: 2, lineHeight: 1.2 }}>
                                {course.courseName}
                            </Typography>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                        Department
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[600], display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MdSchool size={16} />
                                        {course.department}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                        Duration
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[600], display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MdAccessTime size={16} />
                                        {course.totalSemesters} Sems
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                                <IconButton 
                                    size="small"
                                    onClick={() => navigate(`/courses/${course.id}`)} 
                                    sx={{ color: universityTheme.colors.primary.main, bgcolor: `${universityTheme.colors.primary.main}10`, borderRadius: universityTheme.borderRadius.lg }}
                                >
                                    <MdVisibility size={20} />
                                </IconButton>
                                <IconButton 
                                    size="small"
                                    onClick={() => navigate(`/courses/edit/${course.id}`)} 
                                    sx={{ color: '#d97706', bgcolor: '#fef3c7', borderRadius: universityTheme.borderRadius.lg }}
                                >
                                    <MdEdit size={20} />
                                </IconButton>
                                <IconButton 
                                    size="small"
                                    onClick={() => handleDelete(course.id)} 
                                    sx={{ color: universityTheme.colors.error, bgcolor: `${universityTheme.colors.error}10`, borderRadius: universityTheme.borderRadius.lg }}
                                >
                                    <MdDelete size={20} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                </Fade>
            ))}
        </Stack>
    );

    return (
        <Fade in={true}>
            <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
                    {/* Header Section */}
                    <Box
                        sx={{
                            p: { xs: 4, sm: 6 },
                            mb: 4,
                            borderRadius: universityTheme.borderRadius.xl,
                            background: `linear-gradient(135deg, ${universityTheme.colors.primary.dark} 0%, ${universityTheme.colors.primary.main} 100%)`,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: universityTheme.shadows.lg
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
                                            <MdLayers size={30} />
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                                            Academic Programs
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, maxWidth: 600 }}>
                                        Structured curriculum paths and organized degree programs managed by the university.
                                    </Typography>
                                </Box>
                                <Button
                                    fullWidth={isMobile}
                                    variant="contained"
                                    startIcon={<MdAdd />}
                                    onClick={() => navigate('/courses/new')}
                                    sx={{
                                        bgcolor: 'white',
                                        color: universityTheme.colors.primary.main,
                                        borderRadius: universityTheme.borderRadius.lg,
                                        fontWeight: 900,
                                        height: 52,
                                        px: 4,
                                        '&:hover': { bgcolor: universityTheme.colors.neutral.gray[50] }
                                    }}
                                >
                                    Define New Program
                                </Button>
                            </Stack>
                        </Box>
                        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
                    </Box>

                {/* Filter Strip */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 4,
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: 'slate.200',
                        bgcolor: 'white'
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={9}>
                            <form onSubmit={handleSearch}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by name, code or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><MdSearch size={24} className="text-slate-300" /></InputAdornment>),
                                        sx: { borderRadius: '16px', bgcolor: 'slate.50/50' }
                                    }}
                                />
                            </form>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<MdFilterList />}
                                sx={{ height: '56px', borderRadius: '16px', fontWeight: 800, textTransform: 'none', color: 'slate.600', borderColor: 'slate.200' }}
                            >
                                Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Main Content */}
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>
                ) : isMobile ? renderMobileView() : (
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '24px',
                            border: '1px solid',
                            borderColor: 'slate.200',
                            overflow: 'hidden',
                            bgcolor: 'white'
                        }}
                    >
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: 'slate.50/80' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 900, color: 'slate.400', py: 3, pl: 4 }}>CODE</TableCell>
                                        <TableCell sx={{ fontWeight: 900, color: 'slate.400' }}>PROGRAM NAME</TableCell>
                                        <TableCell sx={{ fontWeight: 900, color: 'slate.400' }}>DEPARTMENT</TableCell>
                                        <TableCell sx={{ fontWeight: 900, color: 'slate.400' }}>DURATION</TableCell>
                                        <TableCell sx={{ fontWeight: 900, color: 'slate.400' }}>STATUS</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 900, color: 'slate.400', pr: 4 }}>ACTIONS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {courseItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ textAlign: 'center', py: 10 }}>
                                                <Typography sx={{ color: 'slate.400', fontWeight: 700 }}>No academic programs found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        courseItems.map((course) => (
                                            <TableRow key={course.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                                <TableCell sx={{ pl: 4 }}>
                                                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, color: 'primary.main', bgcolor: 'primary.50', px: 1.5, py: 0.5, borderRadius: '8px', display: 'inline-block' }}>
                                                        {course.courseCode}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 800, color: 'slate.900' }}>{course.courseName}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'slate.400' }}>{course.description || 'Professional Program'}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 700, color: 'slate.600' }}>{course.department}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography sx={{ fontWeight: 700, color: 'slate.600' }}>{course.durationYears} Years</Typography>
                                                    <Typography variant="caption" sx={{ color: 'slate.400' }}>{course.totalSemesters} Semesters</Typography>
                                                </TableCell>
                                                <TableCell>{getStatusChip(course.status)}</TableCell>
                                                <TableCell align="right" sx={{ pr: 4 }}>
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title="View">
                                                            <IconButton size="small" onClick={() => navigate(`/courses/${course.id}`)} sx={{ color: 'primary.main' }}><MdVisibility /></IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit">
                                                            <IconButton size="small" onClick={() => navigate(`/courses/edit/${course.id}`)} sx={{ color: 'amber.600' }}><MdEdit /></IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton size="small" onClick={() => handleDelete(course.id)} sx={{ color: 'rose.600' }}><MdDelete /></IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination Area */}
                        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'slate.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'slate.400' }}>
                                Showing {courseItems.length} of {pagination.totalElements} records
                            </Typography>
                            <Pagination
                                count={pagination.totalPages || 0}
                                page={(pagination.number || 0) + 1}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                sx={{ '& .MuiPaginationItem-root': { fontWeight: 900, borderRadius: '12px' } }}
                            />
                        </Box>
                    </Paper>
                )}
            </Box>
        </Fade>
    );
};

export default CourseList;

