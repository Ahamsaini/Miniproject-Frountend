import React, { useState, useEffect } from 'react';
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
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    MdAssessment,
    MdPeople,
    MdSchool,
    MdWarning,
    MdCheckCircle,
    MdHistory,
    MdDownload
} from 'react-icons/md';
import axiosInstance from '../api/axiosInstance';

const SubjectAttendanceReport = () => {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filters, setFilters] = useState({
        courseId: '',
        semester: '',
        subjectId: '',
        section: 'ALL'
    });
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (filters.courseId && filters.semester) {
            fetchSubjects(filters.courseId, filters.semester);
        } else {
            setSubjects([]);
        }
    }, [filters.courseId, filters.semester]);

    const fetchCourses = async () => {
        try {
            const res = await axiosInstance.get('/courses?size=50');
            setCourses(res.data.content || (Array.isArray(res.data) ? res.data : []));
        } catch (err) {
            console.error('Failed to fetch courses', err);
        }
    };

    const fetchSubjects = async (courseId, semester) => {
        setLoadingSubjects(true);
        try {
            const res = await axiosInstance.get(`/courses/${courseId}/subjects/semester/${semester}`);
            setSubjects(res.data);
            if (res.data.length > 0) {
                setFilters(prev => ({ ...prev, subjectId: res.data[0].id }));
            } else {
                setFilters(prev => ({ ...prev, subjectId: '' }));
            }
        } catch (err) {
            console.error('Failed to fetch subjects', err);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            // Reset dependent filters
            ...(name === 'courseId' ? { semester: '', subjectId: '' } : {}),
            ...(name === 'semester' ? { subjectId: '' } : {})
        }));
    };

    const generateReport = async () => {
        if (!filters.courseId || !filters.semester || !filters.subjectId) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get('/labs/reports/subject-attendance', {
                params: filters
            });
            setReport(res.data);
        } catch (err) {
            console.error('Failed to generate report', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axiosInstance.get('/labs/reports/subject-attendance/export', {
                params: filters,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `subject_attendance_${filters.subjectId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed', err);
        }
    };

    return (
        <Box className="space-y-6">
            <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Box>
                    <Typography variant="h4" className="font-black text-slate-900 flex items-center gap-3">
                        <MdAssessment className="text-indigo-600" />
                        Subject Audit
                    </Typography>
                    <Typography className="text-slate-500 font-medium ml-11">
                        Detailed cross-sectional attendance analysis
                    </Typography>
                </Box>
                {report && (
                    <Button
                        variant="contained"
                        startIcon={<MdDownload />}
                        className="bg-slate-900 rounded-2xl px-6 py-2.5 font-bold shadow-lg"
                        onClick={handleExport}
                    >
                        Export CSV
                    </Button>
                )}
            </Box>

            <Paper className="p-6 rounded-[2rem] border border-slate-100 shadow-sm bg-white">
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Course</InputLabel>
                            <Select
                                name="courseId"
                                value={filters.courseId}
                                label="Course"
                                onChange={handleFilterChange}
                                className="rounded-xl"
                                native={isMobile}
                            >
                                {isMobile ? (
                                    <>
                                        <option value="">Select Course</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.courseName}</option>
                                        ))}
                                    </>
                                ) : (
                                    courses.map(c => (
                                        <MenuItem key={c.id} value={c.id}>{c.courseName}</MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small" disabled={!filters.courseId}>
                            <InputLabel>Semester</InputLabel>
                            <Select
                                name="semester"
                                value={filters.semester}
                                label="Semester"
                                onChange={handleFilterChange}
                                className="rounded-xl"
                                native={isMobile}
                            >
                                {isMobile ? (
                                    <>
                                        <option value="">Select Semester</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <option key={sem} value={sem}>Semester {sem}</option>
                                        ))}
                                    </>
                                ) : (
                                    [1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                        <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small" disabled={!filters.semester || loadingSubjects}>
                            <InputLabel>Subject</InputLabel>
                            <Select
                                name="subjectId"
                                value={filters.subjectId}
                                label="Subject"
                                onChange={handleFilterChange}
                                className="rounded-xl"
                                native={isMobile}
                            >
                                {isMobile ? (
                                    <>
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.subjectName}</option>
                                        ))}
                                    </>
                                ) : (
                                    subjects.map(s => (
                                        <MenuItem key={s.id} value={s.id}>{s.subjectName}</MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Section</InputLabel>
                            <Select
                                name="section"
                                value={filters.section}
                                label="Section"
                                onChange={handleFilterChange}
                                className="rounded-xl"
                                native={isMobile}
                            >
                                {isMobile ? (
                                    <>
                                        <option value="ALL">All Sections</option>
                                        <option value="A">Section A</option>
                                        <option value="B">Section B</option>
                                        <option value="C">Section C</option>
                                    </>
                                ) : (
                                    [
                                        <MenuItem key="ALL" value="ALL">All Sections</MenuItem>,
                                        <MenuItem key="A" value="A">Section A</MenuItem>,
                                        <MenuItem key="B" value="B">Section B</MenuItem>,
                                        <MenuItem key="C" value="C">Section C</MenuItem>
                                    ]
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            className="bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl font-bold shadow-indigo-100 shadow-lg"
                            onClick={generateReport}
                            disabled={loading || !filters.subjectId}
                        >
                            Generate
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading && <LinearProgress className="rounded-full h-1.5" />}

            {report ? (
                <Stack spacing={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card className="rounded-[2rem] border-none shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2">
                                <CardContent className="flex flex-col items-center py-6">
                                    <MdHistory size={32} className="mb-2 opacity-80" />
                                    <Typography variant="h3" className="font-black">{report.totalCompletedSessions}</Typography>
                                    <Typography className="opacity-80 font-bold uppercase tracking-wider text-xs">Sessions Conducted</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card className="rounded-[2rem] bg-white p-2 border border-slate-100">
                                <CardContent className="flex flex-col items-center py-6">
                                    <MdPeople size={32} className="mb-2 text-indigo-600" />
                                    <Typography variant="h3" className="font-black text-slate-900">{report.studentStats?.length || 0}</Typography>
                                    <Typography className="text-slate-400 font-bold uppercase tracking-wider text-xs">Enrolled Students</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Paper className="rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden bg-white">
                        <Box className="px-8 pt-6">
                            <Tabs
                                value={activeTab}
                                onChange={(e, v) => setActiveTab(v)}
                                sx={{
                                    '& .MuiTabs-indicator': { backgroundColor: '#4f46e5', height: 3 },
                                    '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '1rem', py: 3 }
                                }}
                            >
                                <Tab label="Student Performance" icon={<MdPeople size={20} />} iconPosition="start" />
                                <Tab label="Session History" icon={<MdHistory size={20} />} iconPosition="start" />
                            </Tabs>
                            <Divider />
                        </Box>

                        <Box className="p-8">
                            {activeTab === 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest pl-8">Student</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest">Roll No</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest" align="right">Attended</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest" align="right" style={{ width: 250 }}>Percentage</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {report.studentStats?.map((stat) => (
                                                <TableRow key={stat.studentId} hover className="group transition-colors">
                                                    <TableCell className="py-5 pl-8">
                                                        <Box className="flex items-center gap-3">
                                                            <Avatar className="bg-slate-100 text-indigo-600 font-bold">
                                                                {stat.firstName[0]}
                                                            </Avatar>
                                                            <Typography className="font-bold text-slate-900">{stat.firstName} {stat.lastName}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-600">{stat.rollNumber}</TableCell>
                                                    <TableCell align="right" className="font-bold text-slate-900">
                                                        {stat.attendedSessionsCount} / {report.totalCompletedSessions}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box className="flex items-center gap-3 text-right justify-end">
                                                            <Box className="flex-1 max-w-[120px]">
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={stat.attendancePercentage}
                                                                    className="rounded-full h-2 bg-slate-100"
                                                                    color={stat.attendancePercentage >= 75 ? "primary" : stat.attendancePercentage >= 60 ? "warning" : "error"}
                                                                />
                                                            </Box>
                                                            <Typography className="font-black text-slate-900 text-sm whitespace-nowrap min-w-[3rem]">
                                                                {stat.attendancePercentage}%
                                                            </Typography>
                                                        </Box>
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
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest" align="right">Teacher</TableCell>
                                                <TableCell className="font-black text-slate-400 py-4 uppercase text-xs tracking-widest pr-8" align="right">Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {report.sessions?.map((session) => (
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
                                                        <Typography className="font-medium text-slate-700">{session.teacherName}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right" className="pr-8">
                                                        <Chip
                                                            label={session.status}
                                                            size="small"
                                                            className={`font-bold ${session.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {(!report.sessions || report.sessions.length === 0) && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" className="py-20">
                                                        <MdHistory size={48} className="text-slate-100 mb-4 mx-auto" />
                                                        <Typography className="text-slate-400 font-bold">No individual session records found</Typography>
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
                    <Box className="py-20 text-center flex flex-col items-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                        <MdAssessment size={64} className="text-slate-200 mb-4" />
                        <Typography variant="h6" className="text-slate-400 font-bold">Select filters above to generate the subject audit report</Typography>
                        <Typography className="text-slate-400">Aggregated stats and session history will be loaded</Typography>
                    </Box>
                )
            )}
        </Box>
    );
};

export default SubjectAttendanceReport;
