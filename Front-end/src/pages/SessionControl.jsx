import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    MdQrCode,
    MdPlayArrow,
    MdStop,
    MdAdd,
    MdDelete,
    MdCheckCircle,
    MdArrowBack,
    MdRefresh
} from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { generateCode, fetchSessionStudents, finalizeAttendance, manualEntry, deleteAttendanceRecord, fetchLabSessionById } from '../features/labs/labsSlice';

const SessionControl = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentSessionStudents, activeCodes, currentSession, loading } = useSelector((state) => state.labs);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [openAdd, setOpenAdd] = useState(false);
    const [newStudentRoll, setNewStudentRoll] = useState('');

    useEffect(() => {
        dispatch(fetchLabSessionById(sessionId));
        dispatch(fetchSessionStudents(sessionId));

        // Auto-refresh student list every 10 seconds for real-time updates
        const intervalId = setInterval(() => {
            dispatch(fetchSessionStudents(sessionId));
        }, 10000);

        return () => clearInterval(intervalId);
    }, [sessionId, dispatch]);

    const handleGenerateCode = (type) => {
        dispatch(generateCode({ sessionId, type }));
    };

    const handleFinalize = () => {
        if (window.confirm('Are you sure you want to finalize this session? No more entries will be allowed.')) {
            dispatch(finalizeAttendance(sessionId));
            navigate('/labs');
        }
    };

    const handleManualSubmit = async () => {
        if (!newStudentRoll) return;
        const result = await dispatch(manualEntry({ sessionId, rollNumber: newStudentRoll }));
        if (!result.error) {
            setOpenAdd(false);
            setNewStudentRoll('');
            dispatch(fetchSessionStudents(sessionId));
        } else {
            alert(result.payload || 'Failed to add student');
        }
    };

    const handleDeleteRecord = (id) => {
        if (window.confirm('Are you sure you want to remove this record?')) {
            dispatch(deleteAttendanceRecord(id));
        }
    };

    const currentCodes = activeCodes[sessionId] || {};

    return (
        <Box className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <Button
                startIcon={<MdArrowBack />}
                onClick={() => navigate('/labs')}
                className="text-slate-600 hover:bg-slate-100 rounded-xl"
            >
                All Sessions
            </Button>

            {/* Control Panel */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper className="p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-slate-200 shadow-sm bg-white">
                        <Box className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 gap-4">
                            <Box>
                                <Typography variant="h5" className="font-extrabold text-slate-900 text-xl md:text-2xl">
                                    {currentSession?.subject?.subjectName || 'Lab'} Control Center
                                </Typography>
                                <Typography variant="body2" className="text-slate-500 font-medium text-xs md:text-sm">
                                    {currentSession?.lab?.labName} • {currentSession?.experimentName || 'In Progress'}
                                </Typography>
                            </Box>
                            <Chip label={currentSession?.status || 'Scheduled'} color={currentSession?.status === 'ONGOING' ? 'success' : 'primary'} className="font-bold px-2" variant="outlined" size={isMobile ? "small" : "medium"} />
                        </Box>

                        {currentSession?.status === 'SCHEDULED' && (
                            <Alert severity="info" className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/30">
                                This lab is scheduled for now. Click <strong>Generate Entry Code</strong> below to officially start the session and allow students to check in.
                            </Alert>
                        )}

                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={6}>
                                <Box className="p-4 md:p-6 bg-blue-50/50 rounded-2xl md:rounded-3xl border border-blue-100 flex flex-col items-center text-center">
                                    <Typography variant="overline" className="text-blue-600 font-black tracking-widest mb-3 md:mb-4 text-[10px] md:text-xs">Entry Protocol</Typography>
                                    <Box className="h-20 md:h-24 flex items-center justify-center">
                                        {currentCodes.entry ? (
                                            <Typography variant="h2" className="font-black text-primary tracking-tighter text-4xl md:text-5xl">{currentCodes.entry}</Typography>
                                        ) : (
                                            <MdQrCode size={isMobile ? 48 : 64} className="text-blue-200" />
                                        )}
                                    </Box>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<MdPlayArrow />}
                                        onClick={() => handleGenerateCode('entry')}
                                        className="mt-4 md:mt-6 bg-primary shadow-lg shadow-blue-200 rounded-2xl py-2.5 md:py-3 font-bold text-sm md:text-base"
                                    >
                                        Generate Entry Code
                                    </Button>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box className="p-4 md:p-6 bg-rose-50/50 rounded-2xl md:rounded-3xl border border-rose-100 flex flex-col items-center text-center">
                                    <Typography variant="overline" className="text-rose-600 font-black tracking-widest mb-3 md:mb-4 text-[10px] md:text-xs">Exit Protocol</Typography>
                                    <Box className="h-20 md:h-24 flex items-center justify-center">
                                        {currentCodes.exit ? (
                                            <Typography variant="h2" className="font-black text-rose-600 tracking-tighter text-4xl md:text-5xl">{currentCodes.exit}</Typography>
                                        ) : (
                                            <MdQrCode size={isMobile ? 48 : 64} className="text-rose-200" />
                                        )}
                                    </Box>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<MdStop />}
                                        onClick={() => handleGenerateCode('exit')}
                                        className="mt-4 md:mt-6 bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 rounded-2xl py-2.5 md:py-3 font-bold text-sm md:text-base"
                                    >
                                        Generate Exit Code
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper className="p-6 md:p-8 rounded-3xl md:rounded-[2rem] border border-slate-200 shadow-sm bg-slate-900 text-white h-full">
                        <Typography variant="h6" className="font-bold mb-4 text-lg md:text-xl">Session Summary</Typography>
                        <Divider className="bg-slate-800 mb-6" />
                        <Box className="space-y-4 md:space-y-6">
                            <Box className="flex justify-between">
                                <Typography className="text-slate-400 text-sm md:text-base">Validated Entries</Typography>
                                <Typography className="font-black text-sm md:text-base">{currentSessionStudents.filter(s => s.status === 'PRESENT').length}</Typography>
                            </Box>
                            <Box className="flex justify-between">
                                <Typography className="text-slate-400 text-sm md:text-base">Pending Exits</Typography>
                                <Typography className="font-black text-sm md:text-base">{currentSessionStudents.filter(s => !s.exitTime).length}</Typography>
                            </Box>
                            <Divider className="bg-slate-800" />
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<MdCheckCircle />}
                                onClick={handleFinalize}
                                className="bg-green-500 hover:bg-green-600 rounded-2xl py-3 md:py-4 font-black shadow-xl shadow-green-900/20 text-sm md:text-base"
                            >
                                Finalize & Close Lab
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Student List Management */}
            <Paper className="p-5 md:p-8 rounded-3xl md:rounded-[2rem] border border-slate-200 shadow-sm bg-white overflow-hidden">
                <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                    <Typography variant="h6" className="font-bold text-slate-900">Validated Student List</Typography>
                    <Box className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                        <IconButton onClick={() => dispatch(fetchSessionStudents(sessionId))} size="small" className="bg-slate-50 border border-slate-100"><MdRefresh /></IconButton>
                        <Button
                            variant="outlined"
                            startIcon={<MdAdd />}
                            onClick={() => setOpenAdd(true)}
                            fullWidth={isMobile}
                            className="rounded-xl border-slate-200 text-slate-700 font-bold px-4 md:px-6 whitespace-nowrap text-sm"
                        >
                            Manual Entry
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead className="bg-slate-50">
                            <TableRow>
                                <TableCell className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Student</TableCell>
                                <TableCell className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Roll Number</TableCell>
                                <TableCell className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Machine Number</TableCell>
                                <TableCell className="font-black text-slate-500 uppercase text-[10px] tracking-widest">In Time</TableCell>
                                <TableCell className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Out Time</TableCell>
                                <TableCell className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Status</TableCell>
                                <TableCell align="right" className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentSessionStudents.map((attendance) => (
                                <TableRow key={attendance.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <Box className="flex items-center gap-3">
                                            <Avatar src={attendance.student?.profilePictureUrl} className="w-8 h-8 rounded-lg bg-blue-100 text-primary font-black text-xs">
                                                {attendance.student?.firstName?.charAt(0) || attendance.student?.fullName?.charAt(0) || '?'}
                                            </Avatar>
                                            <Typography variant="body2" className="font-bold text-slate-800">{attendance.student.fullName}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{attendance.student.rollNumber}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={attendance.pcNumber || 'N/A'}
                                            size="small"
                                            className="font-bold bg-slate-100 text-slate-700 rounded-lg"
                                        />
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-slate-600">{attendance.entryTime ? new Date(attendance.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</TableCell>
                                    <TableCell className="text-sm font-medium text-slate-600">{attendance.exitTime ? new Date(attendance.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={attendance.status}
                                            size="small"
                                            className={`${attendance.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'} font-black text-[10px]`}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            className="text-rose-500 hover:bg-rose-50"
                                            onClick={() => handleDeleteRecord(attendance.id)}
                                        >
                                            <MdDelete size={20} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Manual Entry Dialog */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} PaperProps={{ className: "rounded-3xl p-4" }}>
                <DialogTitle className="font-black text-slate-900">Manual Student Entry</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" className="text-slate-500 mb-6">Enter the roll number to manually add a student to this session.</Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Roll Number"
                        variant="outlined"
                        value={newStudentRoll}
                        onChange={(e) => setNewStudentRoll(e.target.value)}
                    />
                </DialogContent>
                <DialogActions className="px-6 pb-6 mt-4">
                    <Button onClick={() => setOpenAdd(false)} className="text-slate-500 font-bold px-6">Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleManualSubmit}
                        disabled={!newStudentRoll}
                        className="bg-primary rounded-xl px-8 font-bold"
                    >
                        Add Student
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SessionControl;
