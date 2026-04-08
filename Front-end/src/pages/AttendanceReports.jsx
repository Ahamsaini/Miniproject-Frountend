import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Button,
    LinearProgress,
    Stack,
    Chip,
    Avatar,
    Tabs,
    Tab,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    MdAssessment,
    MdPeople,
    MdSchool,
    MdWarning,
    MdCheckCircle,
    MdHistory,
    MdPerson,
    MdDownload
} from 'react-icons/md';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import universityTheme from '../theme/universityTheme';

const AttendanceReports = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useSelector((state) => state.auth);
    const [expertise, setExpertise] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Admin specific state
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchTeachers();
        } else if (user?.id) {
            setSelectedTeacherId(user.id);
            fetchExpertise(user.id);
        }
    }, [user]);

    const fetchTeachers = async () => {
        try {
            const res = await axiosInstance.get('/teachers?size=100');
            setTeachers(res.data.content || []);
        } catch (err) {
            console.error("Failed to fetch teachers", err);
        }
    };

    const fetchExpertise = async (teacherId) => {
        try {
            const res = await axiosInstance.get(`/teachers/${teacherId}/expertise`);
            setExpertise(res.data);
            if (res.data.length > 0) {
                setSelectedSubject(res.data[0].subjectId);
                fetchReport(teacherId, res.data[0].subjectId);
            } else {
                setSelectedSubject('');
                setReportData(null);
            }
        } catch (err) {
            console.error("Failed to fetch expertise", err);
        }
    };

    const fetchReport = async (teacherId, subjectId) => {
        if (!teacherId || !subjectId) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/teachers/${teacherId}/subjects/${subjectId}/detailed-report`);
            setReportData(res.data);
        } catch (err) {
            console.error("Failed to fetch report", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherChange = (e) => {
        const tId = e.target.value;
        setSelectedTeacherId(tId);
        fetchExpertise(tId);
    };

    const handleSubjectChange = (e) => {
        const sId = e.target.value;
        setSelectedSubject(sId);
        fetchReport(selectedTeacherId, sId);
    };

    const handleExport = async () => {
        if (!selectedTeacherId || !selectedSubject) return;
        setExporting(true);
        try {
            const response = await axiosInstance.get(`/teachers/${selectedTeacherId}/subjects/${selectedSubject}/attendance-report/export`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${selectedSubject}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
        } finally {
            setExporting(false);
        }
    };

    if (!user) return null;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                                    <MdAssessment size={30} />
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                                    Session Intelligence
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, maxWidth: 600 }}>
                                Deep analytics and attendance patterns for academic performance tracking.
                            </Typography>
                        </Box>
                        {reportData && (
                            <Button
                                fullWidth={isMobile}
                                variant="contained"
                                startIcon={<MdDownload />}
                                onClick={handleExport}
                                disabled={exporting}
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
                                {exporting ? 'Generating...' : 'Export Dataset'}
                            </Button>
                        )}
                    </Stack>
                </Box>
                <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
            </Box>

            <Paper 
                elevation={0}
                sx={{ 
                    p: 6, 
                    borderRadius: universityTheme.borderRadius.xl, 
                    border: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                    bgcolor: 'white'
                }}
            >
                <Grid container spacing={4} alignItems="center">
                    {user.role === 'ADMIN' && (
                        <Grid item xs={12} md={5}>
                            <FormControl fullWidth>
                                <InputLabel>Select Teacher</InputLabel>
                                <Select
                                    value={selectedTeacherId}
                                    label="Select Teacher"
                                    onChange={handleTeacherChange}
                                    className="rounded-2xl"
                                    startAdornment={<MdPerson className="text-slate-400 mr-2" size={20} />}
                                >
                                    {teachers.map(t => (
                                        <MenuItem key={t.id} value={t.id}>
                                            {t.firstName} {t.lastName} ({t.employeeId})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid item xs={12} md={user.role === 'ADMIN' ? 5 : 10}>
                        <FormControl fullWidth disabled={!selectedTeacherId}>
                            <InputLabel>Select Subject</InputLabel>
                            <Select
                                value={selectedSubject}
                                label="Select Subject"
                                onChange={handleSubjectChange}
                                className="rounded-2xl"
                                startAdornment={<MdSchool className="text-slate-400 mr-2" size={20} />}
                            >
                                {expertise.length > 0 ? (
                                    expertise.map(e => (
                                        <MenuItem key={e.subjectId} value={e.subjectId}>
                                            {e.subjectName} ({e.subjectCode})
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled value="">
                                        <em>No subjects assigned</em>
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {loading && <LinearProgress sx={{ borderRadius: '10px', height: 6, bgcolor: `${universityTheme.colors.primary.main}10` }} color="primary" />}

            {reportData ? (
                <Stack spacing={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: universityTheme.borderRadius.xl,
                                    background: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.primary.dark} 100%)`,
                                    color: 'white',
                                    textAlign: 'center'
                                }}
                            >
                                <MdHistory size={36} style={{ marginBottom: 8, opacity: 0.7 }} />
                                <Typography variant="h2" sx={{ fontWeight: 900, mb: 1 }}>{reportData.totalCompletedSessions}</Typography>
                                <Typography sx={{ fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Sessions Conducted</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: universityTheme.borderRadius.xl,
                                    bgcolor: 'white',
                                    border: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                                    textAlign: 'center'
                                }}
                            >
                                <MdPeople size={36} style={{ marginBottom: 8, color: universityTheme.colors.primary.main }} />
                                <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, color: universityTheme.colors.neutral.gray[900] }}>{reportData.studentStats?.length || 0}</Typography>
                                <Typography sx={{ fontWeight: 800, color: universityTheme.colors.neutral.gray[400], textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Enrolled Students</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: universityTheme.borderRadius.xl,
                                    background: `linear-gradient(135deg, ${universityTheme.colors.secondary.main} 0%, ${universityTheme.colors.secondary.dark} 100%)`,
                                    color: 'white',
                                    textAlign: 'center'
                                }}
                            >
                                <MdCheckCircle size={36} style={{ marginBottom: 8, opacity: 0.7 }} />
                                <Typography variant="h2" sx={{ fontWeight: 900, mb: 1 }}>
                                    {reportData.studentStats?.length > 0
                                        ? Math.round(reportData.studentStats.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / reportData.studentStats.length)
                                        : 0}%
                                </Typography>
                                <Typography sx={{ fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Average Compliance</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper 
                        elevation={0}
                        sx={{ 
                            borderRadius: universityTheme.borderRadius.xl, 
                            border: `1px solid ${universityTheme.colors.neutral.gray[100]}`,
                            overflow: 'hidden',
                            bgcolor: 'white'
                        }}
                    >
                        <Box sx={{ px: 4, pt: 2 }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, v) => setActiveTab(v)}
                                sx={{
                                    '& .MuiTabs-indicator': { backgroundColor: universityTheme.colors.primary.main, height: 4, borderRadius: '4px 4px 0 0' },
                                    '& .MuiTab-root': { 
                                        fontWeight: 900, 
                                        textTransform: 'uppercase', 
                                        fontSize: '0.85rem', 
                                        letterSpacing: '0.05em',
                                        py: 3,
                                        color: universityTheme.colors.neutral.gray[400],
                                        '&.Mui-selected': { color: universityTheme.colors.primary.main }
                                    }
                                }}
                            >
                                <Tab label="Student Performance" icon={<MdPeople size={20} />} iconPosition="start" />
                                <Tab label="Session History" icon={<MdHistory size={20} />} iconPosition="start" />
                            </Tabs>
                            <Divider />
                        </Box>

                        <Box sx={{ p: 4 }}>
                            {activeTab === 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest pl-8">Student</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest">Roll No</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest" align="center">Attended</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest" align="right" style={{ width: 250 }}>Percentage</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest pr-8" align="right">Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reportData.studentStats?.map((student) => (
                                                <TableRow key={student.studentId} hover className="group transition-colors">
                                                    <TableCell className="py-5 pl-8">
                                                        <Box className="flex items-center gap-3">
                                                            <Avatar className="bg-slate-100 text-indigo-600 font-bold">
                                                                {student.firstName[0]}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography className="font-bold text-slate-900">{student.firstName} {student.lastName}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-600">{student.rollNumber}</TableCell>
                                                    <TableCell align="center" className="font-bold text-slate-900">
                                                        {student.attendedSessionsCount} / {reportData.totalCompletedSessions}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box className="flex items-center gap-3 text-right justify-end">
                                                            <Box className="flex-1 max-w-[120px]">
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={student.attendancePercentage}
                                                                    className="rounded-full h-2 bg-slate-100"
                                                                    color={student.attendancePercentage >= 75 ? "primary" : student.attendancePercentage >= 60 ? "warning" : "error"}
                                                                />
                                                            </Box>
                                                            <Typography className="font-black text-slate-900 text-sm whitespace-nowrap min-w-[3rem]">
                                                                {student.attendancePercentage}%
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" className="pr-8">
                                                        {student.attendancePercentage < 75 && (
                                                            <Chip
                                                                label="Low Attendance"
                                                                size="small"
                                                                icon={<MdWarning />}
                                                                className="bg-red-50 text-red-600 font-bold border-none"
                                                            />
                                                        )}
                                                        {student.attendancePercentage >= 75 && (
                                                            <Chip
                                                                label="Safe"
                                                                size="small"
                                                                icon={<MdCheckCircle />}
                                                                className="bg-emerald-50 text-emerald-600 font-bold border-none"
                                                            />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest pl-8">Date</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest">Time</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest">Lab / Section</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest" align="right">Status</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest pr-8" align="right">Attendance</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reportData.sessions?.map((session) => (
                                                <TableRow key={session.id} hover className="group transition-colors">
                                                    <TableCell className="py-5 pl-8 font-bold text-slate-900">
                                                        {new Date(session.sessionDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-600">
                                                        {session.startTime} - {session.endTime}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography className="font-bold text-slate-900">{session.labName}</Typography>
                                                        <Typography className="text-slate-500 text-xs">Section {session.section}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={session.status}
                                                            size="small"
                                                            className={`font-bold ${session.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" className="pr-8">
                                                        <Typography className="font-black text-indigo-600">
                                                            {session.attendanceMarked ? '✓ Recorded' : '-'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {(!reportData.sessions || reportData.sessions.length === 0) && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" className="py-10 text-slate-400 font-bold italic">
                                                        No individual sessions found for this subject.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Paper>
                </Stack>
            ) : (
                !loading && (
                    <Box sx={{ 
                        py: 12, 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        bgcolor: 'white', 
                        borderRadius: universityTheme.borderRadius.xl, 
                        border: `2px dashed ${universityTheme.colors.neutral.gray[200]}` 
                    }}>
                        <MdAssessment size={80} style={{ color: universityTheme.colors.neutral.gray[100], marginBottom: 24 }} />
                        <Typography variant="h5" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 900 }}>
                            Discovery Pending
                        </Typography>
                        <Typography sx={{ color: universityTheme.colors.neutral.gray[300], fontWeight: 600, mt: 1 }}>
                            Select a teacher and subject to unlock session intelligence.
                        </Typography>
                    </Box>
                )
            )}
        </Box>
    );
};

export default AttendanceReports;
