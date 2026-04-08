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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Container,
    Card,
    CardContent,
    Divider,
    Stack,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    MdSearch,
    MdEdit,
    MdDelete,
    MdEmail,
    MdPersonAdd,
    MdRefresh,
    MdFiberManualRecord,
    MdWork,
    MdSchool,
    MdBadge
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeachers, updateTeacher, fetchUnassignedTeachers, fetchTeacherSessions, reassignAndDeleteTeacher } from '../features/teachers/teachersSlice';
import ReassignmentDialog from '../components/ReassignmentDialog';
import universityTheme from '../theme/universityTheme';

const TeacherList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items, unassignedItems, loading, pagination } = useSelector((state) => state.teachers);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchTerm, setSearchTerm] = useState('');
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openUnassignedDialog, setOpenUnassignedDialog] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [editFormData, setEditFormData] = useState({
        employeeId: '',
        designation: '',
        qualification: '',
        department: ''
    });

    // Reassignment State
    const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
    const [sessionsToReassign, setSessionsToReassign] = useState([]);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [reassignLoading, setReassignLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        dispatch(fetchTeachers({ page: 0, size: 20 }));
    }, [dispatch]);

    const handlePageChange = (event, value) => {
        dispatch(fetchTeachers({
            page: value - 1,
            size: 20,
            keyword: searchTerm || undefined
        }));
    };

    const handleDelete = async (teacher) => {
        setTeacherToDelete(teacher);
        try {
            const sessions = await dispatch(fetchTeacherSessions(teacher.id)).unwrap();
            setSessionsToReassign(sessions);
            setReassignDialogOpen(true);
        } catch (err) {
            alert(err || 'Failed to fetch teacher sessions');
        }
    };

    const handleReassignConfirm = async (reassignments) => {
        setReassignLoading(true);
        try {
            await dispatch(reassignAndDeleteTeacher({
                teacherId: teacherToDelete.id,
                reassignments
            })).unwrap();
            setReassignDialogOpen(false);
            alert('Teacher sessions reassigned and teacher deactivated successfully!');
            dispatch(fetchTeachers({ page: pagination.number, size: 20 }));
        } catch (err) {
            alert(err || 'Failed to reassign sessions and delete teacher');
        } finally {
            setReassignLoading(false);
        }
    };

    const handleEditClick = (teacher) => {
        setSelectedTeacher(teacher);
        setEditFormData({
            employeeId: teacher.employeeId || '',
            designation: teacher.designation || '',
            qualification: teacher.qualification || '',
            department: teacher.department || ''
        });
        setOpenEditDialog(true);
    };

    const handleUnassignedClick = () => {
        dispatch(fetchUnassignedTeachers());
        setOpenUnassignedDialog(true);
    };

    const handleSelectUnassigned = (teacher) => {
        setOpenUnassignedDialog(false);
        handleEditClick(teacher);
    };

    const handleEditSubmit = async () => {
        try {
            await dispatch(updateTeacher({
                id: selectedTeacher.id,
                data: editFormData
            })).unwrap();
            setOpenEditDialog(false);
            alert('Teacher updated successfully!');
            // Refresh main list
            dispatch(fetchTeachers({ page: pagination.number, size: 20 }));
        } catch (err) {
            alert(err || 'Failed to update teacher');
        }
    };

    const teacherItems = useMemo(() => Array.isArray(items) ? items : [], [items]);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Fade in={mounted} timeout={600}>
                <Box>
                    {/* Header Section */}
                    <Box
                        sx={{
                            p: { xs: 4, sm: 6 },
                            mb: 4,
                            borderRadius: universityTheme.borderRadius.xl,
                            background: `linear-gradient(135deg, ${universityTheme.colors.secondary.dark} 0%, ${universityTheme.colors.secondary.main} 100%)`,
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
                                            <MdSchool size={30} />
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                                            Faculty Directory
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, maxWidth: 600 }}>
                                        Registered academic staff and department personnel overseeing lab operations.
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                    <Button
                                        fullWidth={isMobile}
                                        variant="outlined"
                                        onClick={() => dispatch(fetchTeachers({ page: 0, size: 20 }))}
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
                                        startIcon={<MdBadge />}
                                        onClick={handleUnassignedClick}
                                        sx={{
                                            bgcolor: '#fff',
                                            color: universityTheme.colors.secondary.main,
                                            borderRadius: universityTheme.borderRadius.lg,
                                            fontWeight: 900,
                                            height: 52,
                                            px: 4,
                                            '&:hover': { bgcolor: universityTheme.colors.neutral.gray[50] }
                                        }}
                                    >
                                        Verify Faculty
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
                            background: `linear-gradient(135deg, ${universityTheme.colors.neutral.background} 0%, #ffffff 100%)`,
                        }}
                    >
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by name, employee ID, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            dispatch(fetchTeachers({
                                                keyword: searchTerm || undefined,
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
                            <Grid item xs={12} md={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => {
                                        dispatch(fetchTeachers({
                                            keyword: searchTerm || undefined,
                                            size: 20
                                        }));
                                    }}
                                    sx={{
                                        bgcolor: universityTheme.colors.primary.main,
                                        borderRadius: universityTheme.borderRadius.lg,
                                        fontWeight: 'bold',
                                        height: 56,
                                        boxShadow: universityTheme.shadows.md
                                    }}
                                >
                                    Search Faculty
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
                            ) : teacherItems.length === 0 ? (
                                <Paper sx={{ p: 10, textAlign: 'center', borderRadius: universityTheme.borderRadius.xl, bgcolor: '#fff', border: `1px solid ${universityTheme.colors.neutral.gray[100]}` }}>
                                    <MdSchool size={48} color={universityTheme.colors.neutral.gray[200]} />
                                    <Typography variant="h6" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 900, mt: 2 }}>No faculty profiles</Typography>
                                    <Button
                                        onClick={() => { setSearchTerm(''); dispatch(fetchTeachers({ page: 0, size: 20 })); }}
                                        sx={{ mt: 2, textTransform: 'none', fontWeight: 800 }}
                                    >
                                        Reset View
                                    </Button>
                                </Paper>
                            ) : (
                                <Stack spacing={2.5}>
                                    {teacherItems.map((teacher) => (
                                        <Fade in={true} key={teacher.id}>
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
                                                    bgcolor: teacher.isActive ? universityTheme.colors.secondary.main : universityTheme.colors.neutral.gray[300] 
                                                }} />
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: universityTheme.colors.secondary.main,
                                                                    fontWeight: 900,
                                                                    width: 56, height: 56,
                                                                    fontSize: '1.2rem',
                                                                    boxShadow: universityTheme.shadows.sm,
                                                                    border: '2px solid white'
                                                                }}
                                                            >
                                                                {teacher.firstName?.[0]}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], lineHeight: 1.1, mb: 0.5 }}>
                                                                    {teacher.fullName}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 700 }}>
                                                                    {teacher.email}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Chip
                                                            label={teacher.employeeId || 'TBD'}
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
                                                                Department
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[600] }}>
                                                                {teacher.department || 'GENERAL'}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[300], textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                                                                Role
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[600] }}>
                                                                {teacher.designation || 'STAFF'}
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
                                                            label={teacher.isActive ? 'AUTHORIZED' : 'LOCKED'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: teacher.isActive ? `${universityTheme.colors.success}15` : `${universityTheme.colors.error}15`,
                                                                color: teacher.isActive ? universityTheme.colors.success : universityTheme.colors.error,
                                                                fontWeight: 900,
                                                                borderRadius: '8px',
                                                                fontSize: '0.65rem',
                                                                letterSpacing: '0.05em'
                                                            }}
                                                        />
                                                        <Stack direction="row" spacing={1.5}>
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => handleEditClick(teacher)}
                                                                sx={{
                                                                    minWidth: 'auto',
                                                                    fontSize: '0.75rem',
                                                                    textTransform: 'none',
                                                                    color: universityTheme.colors.primary.main,
                                                                    fontWeight: 900,
                                                                    borderRadius: universityTheme.borderRadius.lg,
                                                                    px: 2.5,
                                                                    py: 1
                                                                }}
                                                            >
                                                                Edit Details
                                                            </Button>
                                                            <IconButton
                                                                onClick={() => handleDelete(teacher)}
                                                                sx={{
                                                                    color: universityTheme.colors.error,
                                                                    bgcolor: `${universityTheme.colors.error}10`,
                                                                    borderRadius: universityTheme.borderRadius.lg,
                                                                    '&:hover': { bgcolor: `${universityTheme.colors.error}20` }
                                                                }}
                                                            >
                                                                <MdDelete size={20} />
                                                            </IconButton>
                                                        </Stack>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Fade>
                                    ))}
                                </Stack>
                            )}

                            {/* Mobile Pagination */}
                            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
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
                                            <TableCell sx={{ py: 2, fontWeight: 700, color: universityTheme.colors.neutral.medium, fontSize: '0.75rem', letterSpacing: '0.05em' }}>TEACHER IDENTITY</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.medium, fontSize: '0.75rem', letterSpacing: '0.05em' }}>EMPLOYEE ID</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.medium, fontSize: '0.75rem', letterSpacing: '0.05em' }}>PROFESSIONAL INFO</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: universityTheme.colors.neutral.medium, fontSize: '0.75rem', letterSpacing: '0.05em' }}>DEPARTMENT</TableCell>
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
                                        ) : teacherItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ py: 8, textAlign: 'center' }}>
                                                    <Typography variant="h6" sx={{ color: universityTheme.colors.neutral.medium }}>No faculty found</Typography>
                                                    <Button
                                                        onClick={() => { setSearchTerm(''); dispatch(fetchTeachers({ page: 0, size: 20 })); }}
                                                        sx={{ mt: 1, textTransform: 'none' }}
                                                    >
                                                        Clear filters
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            teacherItems.map((teacher) => (
                                                <TableRow
                                                    key={teacher.id}
                                                    hover
                                                    sx={{
                                                        transition: 'all 0.2s',
                                                        '&:hover': { bgcolor: `${universityTheme.colors.primary.light}05` }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: universityTheme.colors.secondary.main,
                                                                    color: universityTheme.colors.secondary.contrast,
                                                                    fontWeight: 'bold',
                                                                    width: 40, height: 40
                                                                }}
                                                            >
                                                                {teacher.firstName?.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: universityTheme.colors.neutral.dark }}>
                                                                    {teacher.fullName}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <MdEmail size={12} color={universityTheme.colors.neutral.medium} />
                                                                    <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.medium }}>
                                                                        {teacher.email}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={teacher.employeeId || 'NOT ASSIGNED'}
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
                                                                <MdWork size={14} color={universityTheme.colors.primary.main} />
                                                                {teacher.designation || 'Staff'}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.medium, ml: 2.5 }}>
                                                                {teacher.qualification || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<MdSchool size={12} />}
                                                            label={teacher.department || 'General'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: universityTheme.colors.neutral.background,
                                                                borderRadius: '6px'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<MdFiberManualRecord size={10} />}
                                                            label={teacher.isActive ? 'Active' : 'Inactive'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: teacher.isActive ? '#ecfdf5' : universityTheme.colors.neutral.background,
                                                                color: teacher.isActive ? '#059669' : universityTheme.colors.neutral.medium,
                                                                fontWeight: 700,
                                                                borderRadius: '6px',
                                                                '& .MuiChip-icon': { color: 'inherit' }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                            <Tooltip title="Edit Profile">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditClick(teacher)}
                                                                    sx={{ color: universityTheme.colors.primary.main }}
                                                                >
                                                                    <MdEdit />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Deactivate">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(teacher)}
                                                                    sx={{ color: '#be123c' }}
                                                                >
                                                                    <MdDelete />
                                                                </IconButton>
                                                            </Tooltip>
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
                </Box>
            </Fade>

            {/* Unassigned Teachers Dialog */}
            <Dialog
                open={openUnassignedDialog}
                onClose={() => setOpenUnassignedDialog(false)}
                PaperProps={{ sx: { borderRadius: universityTheme.borderRadius.xl, width: 600, maxWidth: '90%' } }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: universityTheme.colors.neutral.dark }}>
                    Onboard New Faculty
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium, mb: 2 }}>
                        Select a registered teacher to assign their professional details.
                    </Typography>
                    {loading && unassignedItems.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={60} />)}
                        </Box>
                    ) : unassignedItems.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center', bgcolor: universityTheme.colors.neutral.background, borderRadius: universityTheme.borderRadius.lg, border: `1px dashed ${universityTheme.colors.neutral.light}` }}>
                            <Typography sx={{ fontWeight: 600, color: universityTheme.colors.neutral.medium }}>All registered teachers are assigned!</Typography>
                        </Box>
                    ) : (
                        <List>
                            {unassignedItems.map((teacher) => (
                                <ListItem key={teacher.id} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        onClick={() => handleSelectUnassigned(teacher)}
                                        sx={{
                                            borderRadius: universityTheme.borderRadius.lg,
                                            border: `1px solid ${universityTheme.colors.neutral.light}`,
                                            '&:hover': { bgcolor: `${universityTheme.colors.primary.main}10`, borderColor: universityTheme.colors.primary.main }
                                        }}
                                    >
                                        <Avatar sx={{ bgcolor: universityTheme.colors.primary.main, mr: 2 }}>
                                            {teacher.firstName?.charAt(0)}
                                        </Avatar>
                                        <ListItemText
                                            primary={<Typography sx={{ fontWeight: 700 }}>{teacher.fullName}</Typography>}
                                            secondary={teacher.email}
                                        />
                                        <Button size="small" variant="outlined" sx={{ borderRadius: universityTheme.borderRadius.lg }}>
                                            Select
                                        </Button>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenUnassignedDialog(false)} sx={{ color: universityTheme.colors.neutral.medium }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                PaperProps={{ sx: { borderRadius: universityTheme.borderRadius.xl, width: 500, maxWidth: '90%' } }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: universityTheme.colors.primary.main }}>
                    {selectedTeacher?.employeeId ? 'Edit Teacher Profile' : 'Complete Onboarding'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.medium, mb: 3 }}>
                        Update professional details for {selectedTeacher?.fullName}.
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Employee ID"
                                value={editFormData.employeeId}
                                onChange={(e) => setEditFormData({ ...editFormData, employeeId: e.target.value })}
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Department"
                                value={editFormData.department}
                                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Designation"
                                value={editFormData.designation}
                                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                                InputProps={{ sx: { borderRadius: universityTheme.borderRadius.lg } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Qualification"
                                value={editFormData.qualification}
                                onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
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

            {/* Reassignment Dialog */}
            <ReassignmentDialog
                open={reassignDialogOpen}
                onClose={() => setReassignDialogOpen(false)}
                teacher={teacherToDelete}
                sessions={sessionsToReassign}
                availableTeachers={teacherItems.filter(t =>
                    t.id !== teacherToDelete?.id &&
                    t.isActive === true &&
                    t.isApproved === true
                )}
                onConfirm={handleReassignConfirm}
                loading={reassignLoading}
            />
        </Container>
    );
};

export default TeacherList;
