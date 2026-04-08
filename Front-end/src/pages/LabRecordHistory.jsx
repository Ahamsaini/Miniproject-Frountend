import React, { useEffect, useState } from 'react';
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
    Button,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Pagination,
    Stack,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    MdSearch,
    MdHistory,
    MdFileDownload,
    MdVisibility,
    MdFilterList,
    MdDateRange,
    MdCheckCircle,
    MdCancel
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import SessionAttendanceModal from '../components/common/SessionAttendanceModal';

const LabRecordHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 0, number: 0 });

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [detailModal, setDetailModal] = useState({ open: false, session: null, attendance: [] });
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchHistory(0);
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axiosInstance.get('/courses', { params: { size: 100 } });
            setCourses(response.data.content || []);
        } catch (err) {
            console.error("Failed to fetch courses", err);
        }
    };

    const fetchSubjects = async (courseId, semester) => {
        try {
            const params = { size: 100 };
            if (courseId) params.courseId = courseId;
            if (semester) params.semester = semester;
            const response = await axiosInstance.get('/subjects', { params });
            setSubjects(response.data.content || []);
        } catch (err) {
            console.error("Failed to fetch subjects", err);
        }
    };

    const handleCourseChange = (courseId) => {
        setSelectedCourse(courseId);
        setSelectedSemester('');
        setSelectedSubject('');
        setSubjects([]);
        if (courseId) {
            // Subjects will be fetched when semester is selected
        }
    };

    const handleSemesterChange = (semester) => {
        setSelectedSemester(semester);
        setSelectedSubject('');
        if (selectedCourse && semester) {
            fetchSubjects(selectedCourse, semester);
        } else {
            setSubjects([]);
        }
    };

    const fetchHistory = async (page) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/labs/sessions', {
                params: {
                    page: page,
                    size: 10,
                    status: 'COMPLETED',
                    keyword: searchTerm,
                    courseId: selectedCourse || undefined,
                    semester: selectedSemester || undefined,
                    subjectId: selectedSubject || undefined
                }
            });
            const data = response.data.content || [];
            setHistory(data);
            setPagination({
                totalElements: response.data.totalElements || data.length,
                totalPages: response.data.totalPages || 1,
                number: response.data.number || 0
            });
        } catch (err) {
            console.error("Error fetching lab history", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (session) => {
        setLoadingDetails(true);
        try {
            const response = await axiosInstance.get(`/labs/sessions/${session.id}/attendance`);
            setDetailModal({
                open: true,
                session: session,
                attendance: response.data
            });
        } catch (err) {
            console.error("Failed to fetch attendance details", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handlePageChange = (event, value) => {
        fetchHistory(value - 1);
    };

    return (
        <Box className="space-y-6">
            <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Box className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-xl text-slate-600">
                        <MdHistory size={28} />
                    </div>
                    <Box>
                        <Typography variant="h5" className="font-bold text-slate-900">Lab Records History</Typography>
                        <Typography variant="body2" className="text-slate-500">View and export logs of all completed laboratory sessions</Typography>
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<MdFileDownload />}
                    className="rounded-xl border-slate-200 text-slate-700 font-bold px-6"
                >
                    Export Logs
                </Button>
            </Box>

            <Paper className="p-6 border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                <Box className="flex flex-col sm:flex-row gap-4 mb-8">
                    <TextField
                        fullWidth
                        placeholder="Search by experiment, teacher, or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchHistory(0)}
                        className="bg-slate-50 rounded-2xl"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdSearch className="text-slate-400" size={20} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '1rem' }
                        }}
                    />
                    <FormControl variant="outlined" className="min-w-[200px] bg-slate-50 rounded-xl">
                        <InputLabel>Filter by Course</InputLabel>
                        <Select
                            value={selectedCourse}
                            onChange={(e) => handleCourseChange(e.target.value)}
                            label="Filter by Course"
                        >
                            <MenuItem value="">
                                <em>All Courses</em>
                            </MenuItem>
                            {courses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                    {course.courseName} ({course.courseCode})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl
                        variant="outlined"
                        className="min-w-[200px] bg-slate-50 rounded-xl"
                        disabled={!selectedCourse}
                    >
                        <InputLabel>Filter by Semester</InputLabel>
                        <Select
                            value={selectedSemester}
                            onChange={(e) => handleSemesterChange(e.target.value)}
                            label="Filter by Semester"
                        >
                            <MenuItem value="">
                                <em>All Semesters</em>
                            </MenuItem>
                            {selectedCourse && [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <MenuItem key={sem} value={sem}>
                                    Semester {sem}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl
                        variant="outlined"
                        className="min-w-[200px] bg-slate-50 rounded-xl"
                        disabled={!selectedSemester}
                    >
                        <InputLabel>Filter by Subject</InputLabel>
                        <Select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            label="Filter by Subject"
                        >
                            <MenuItem value="">
                                <em>All Subjects</em>
                            </MenuItem>
                            {subjects.map((subject) => (
                                <MenuItem key={subject.id} value={subject.id}>
                                    {subject.subjectName} ({subject.subjectCode})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        className="bg-slate-800 shadow-none rounded-2xl px-8 h-[56px]"
                        onClick={() => fetchHistory(0)}
                    >
                        Search
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead className="bg-slate-50">
                            <TableRow>
                                <TableCell className="font-bold text-slate-600">Date & Lab</TableCell>
                                <TableCell className="font-bold text-slate-600">Experiment / Topic</TableCell>
                                <TableCell className="font-bold text-slate-600">Subject / Cohort</TableCell>
                                <TableCell className="font-bold text-slate-600">Conducted By</TableCell>
                                <TableCell className="font-bold text-slate-600">Attendance</TableCell>
                                <TableCell align="right" className="font-bold text-slate-600">Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.map((record) => (
                                <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <Box className="flex items-center gap-2">
                                            <MdDateRange className="text-primary-light" size={18} />
                                            <Box>
                                                <Typography variant="body2" className="font-bold text-slate-800">{record.sessionDate}</Typography>
                                                <Typography variant="caption" className="text-slate-500">{record.lab.labName} ({record.lab.roomNumber})</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" className="font-bold text-slate-900 line-clamp-1">{record.experimentName}</Typography>
                                        <Typography variant="caption" className="text-slate-400 italic">ID: {record.id}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 mb-1">
                                            <Chip
                                                label={record.subject.subjectCode}
                                                size="small"
                                                className="bg-blue-50 text-primary font-bold text-[10px]"
                                            />
                                            {record.section && (
                                                <Chip
                                                    label={`Sec ${record.section}`}
                                                    size="small"
                                                    className="bg-purple-50 text-purple-600 font-bold text-[10px]"
                                                />
                                            )}
                                        </div>
                                        <Typography variant="body2" className="text-slate-600 block">{record.subject.subjectName}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" className="text-slate-700 font-medium">{record.teacher.fullName || `${record.teacher.firstName} ${record.teacher.lastName}`}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box className="flex items-center gap-2">
                                            <Typography variant="body2" className="font-black text-slate-800">
                                                {record.totalStudents > 0 ? Math.round((record.presentCount / record.totalStudents) * 100) : 0}%
                                            </Typography>
                                            <Box className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{ width: `${record.totalStudents > 0 ? (record.presentCount / record.totalStudents) * 100 : 0}%` }}
                                                />
                                            </Box>
                                            <Typography variant="caption" className="text-slate-400">
                                                ({record.presentCount}/{record.totalStudents})
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            onClick={() => handleViewDetails(record)}
                                            startIcon={<MdVisibility />}
                                            className="text-primary font-bold hover:bg-blue-50 rounded-lg px-3"
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box className="flex justify-between items-center mt-8 px-2">
                    <Typography variant="caption" className="text-slate-500 font-medium">
                        Showing {history.length} of {pagination.totalElements} historical records
                    </Typography>
                    <Pagination
                        count={pagination.totalPages}
                        page={pagination.number + 1}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                        size="small"
                    />
                </Box>
            </Paper >

            {/* Detailed Attendance Modal */}
            <SessionAttendanceModal
                open={detailModal.open}
                onClose={() => setDetailModal({ ...detailModal, open: false })}
                session={detailModal.session}
                attendance={detailModal.attendance}
            />
        </Box >
    );
};

export default LabRecordHistory;
