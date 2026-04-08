import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Box,
    Paper,
    CircularProgress,
    Tab,
    Tabs,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField as MuiTextField,
    MenuItem,
    Divider
} from '@mui/material';
import {
    MdScience,
    MdComputer,
    MdCalendarToday,
    MdAccessTime,
    MdPeople,
    MdArrowBack,
    MdSpeed,
    MdTv,
    MdAcUnit,
    MdAdd,
    MdEdit,
    MdDelete,
    MdSchool,
    MdPeopleOutline,
    MdGroupAdd,
    MdErrorOutline,
    MdCheckCircleOutline,
    MdSearch,
    MdFilterList,
    MdMoreVert
} from 'react-icons/md';
import LabTimetable from './LabTimetable';
import { fetchLabsByCourseId } from '../features/labs/labsSlice';
import { fetchCourseById } from '../features/courses/coursesSlice';
import { fetchStudents, enrollStudentInCourse } from '../features/students/studentsSlice';
import axiosInstance from '../api/axiosInstance';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [tabValue, setTabValue] = useState(0);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(1);
    const [subjectFormData, setSubjectFormData] = useState({
        subjectCode: '',
        subjectName: '',
        description: '',
        theoryHours: 0,
        labHours: 0,
        totalCredits: 0
    });
    const [submittingSubject, setSubmittingSubject] = useState(false);

    // Student Assignment State
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState({
        studentId: '',
        semester: 1,
        academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString().substring(2),
        enrollmentNumber: ''
    });
    const [enrolling, setEnrolling] = useState(false);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');

    const { items: labs, loading: labsLoading } = useSelector((state) => state.labs);
    const { selectedCourse: course, loading: courseLoading } = useSelector((state) => state.courses);
    const { items: allStudents, loading: studentsLoading } = useSelector((state) => state.students);

    const handleOpenEnrollModal = () => {
        dispatch(fetchStudents({ size: 100 })); // Load students to pick from
        setIsEnrollModalOpen(true);
    };

    const handleEnrollSubmit = async () => {
        if (!enrollmentData.studentId) {
            alert("Please select a student");
            return;
        }
        setEnrolling(true);
        try {
            await dispatch(enrollStudentInCourse({
                studentId: enrollmentData.studentId,
                courseId: courseId,
                semester: enrollmentData.semester,
                academicYear: enrollmentData.academicYear,
                enrollmentNumber: enrollmentData.enrollmentNumber
            })).unwrap();
            dispatch(fetchCourseById(courseId)); // Refresh course to see new student
            setIsEnrollModalOpen(false);
            setEnrollmentData({
                studentId: '',
                semester: 1,
                academicYear: enrollmentData.academicYear,
                enrollmentNumber: ''
            });
        } catch (err) {
            alert(err || "Failed to enroll student");
        } finally {
            setEnrolling(false);
        }
    };

    const handleOpenSubjectModal = (sem) => {
        setSelectedSemester(sem);
        setIsSubjectModalOpen(true);
    };

    const handleCloseSubjectModal = () => {
        setIsSubjectModalOpen(false);
        setSubjectFormData({
            subjectCode: '',
            subjectName: '',
            description: '',
            theoryHours: 0,
            labHours: 0,
            totalCredits: 0
        });
    };

    const handleSubjectFormChange = (e) => {
        const { name, value } = e.target;
        setSubjectFormData(prev => ({
            ...prev,
            [name]: (name === 'theoryHours' || name === 'labHours' || name === 'totalCredits')
                ? parseInt(value) || 0
                : value
        }));
    };

    const handleSubjectSubmit = async () => {
        setSubmittingSubject(true);
        try {
            await axiosInstance.post(`/courses/${courseId}/subjects`, {
                ...subjectFormData,
                semesterNumber: selectedSemester,
                courseId: courseId
            });
            dispatch(fetchCourseById(courseId)); // Refresh
            handleCloseSubjectModal();
        } catch (err) {
            console.error("Failed to add subject", err);
            alert("Failed to add subject: " + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingSubject(false);
        }
    };

    const handleRemoveSubject = async (subjectId) => {
        if (window.confirm('Are you sure you want to remove this subject from the curriculum?')) {
            try {
                await axiosInstance.delete(`/courses/${courseId}/subjects/${subjectId}`);
                dispatch(fetchCourseById(courseId)); // Refresh
            } catch (err) {
                console.error("Failed to remove subject", err);
                alert("Failed to remove subject");
            }
        }
    };

    useEffect(() => {
        if (courseId) {
            dispatch(fetchCourseById(courseId));
            dispatch(fetchLabsByCourseId(courseId));
        }
    }, [dispatch, courseId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (labsLoading || courseLoading) {
        return (
            <Box className="flex justify-center items-center h-screen">
                <CircularProgress />
            </Box>
        );
    }

    if (!course) {
        return (
            <Box className="p-6">
                <Button
                    startIcon={<MdArrowBack />}
                    onClick={() => navigate('/courses')}
                    className="mb-4"
                >
                    Back to Courses
                </Button>
                <Typography variant="h5" color="error">Course not found</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" className="py-8">
            <Button
                startIcon={<MdArrowBack />}
                onClick={() => navigate('/courses')}
                className="mb-4"
                sx={{ mb: 3 }}
            >
                Back to Courses
            </Button>

            {/* Course Header */}
            <Paper className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-sm rounded-xl">
                <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Box>
                        <Typography variant="overline" className="text-blue-600 font-semibold tracking-wider">
                            COURSE DETAILS
                        </Typography>
                        <Typography variant="h4" className="font-bold text-gray-800 mb-1">
                            {course.courseName}
                        </Typography>
                        <Box className="flex items-center gap-3 text-gray-600">
                            <Chip
                                label={course.courseCode}
                                size="small"
                                className="bg-white border border-gray-200 font-mono"
                            />
                            <Typography variant="body2">
                                {course.department} Department
                            </Typography>
                            <span className="text-gray-300">|</span>
                            <MdAccessTime className="text-gray-400" />
                            <Typography variant="body2">
                                Last Updated: {new Date(course.updatedAt || Date.now()).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Box>
                    <Grid container spacing={2} sx={{ width: 'auto' }}>
                        <Grid item>
                            <Box className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 min-w-[100px]">
                                <Typography variant="h6" className="font-bold text-blue-600">
                                    {labs.length}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500 font-medium uppercase">
                                    Assigned Labs
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                onClick={() => navigate(`/courses/edit/${courseId}`)}
                                className="bg-slate-900 hover:bg-black rounded-xl px-6 h-full shadow-none"
                                startIcon={<MdEdit />}
                            >
                                Edit Course
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                className="mb-6 border-b border-gray-200"
                textColor="primary"
                indicatorColor="primary"
            >
                <Tab icon={<MdCalendarToday />} iconPosition="start" label="Curriculum" />
                <Tab icon={<MdComputer />} iconPosition="start" label="Assigned Labs" />
                <Tab icon={<MdPeople />} iconPosition="start" label="Students" />
                <Tab icon={<MdAccessTime />} iconPosition="start" label="Timetable" />
            </Tabs>

            {tabValue === 1 && (
                <Grid container spacing={3}>
                    {labs.length === 0 ? (
                        <Grid item xs={12}>
                            <Paper className="p-12 text-center bg-gray-50 border-dashed border-2 border-gray-200 rounded-xl">
                                <MdScience className="text-6xl text-gray-300 mx-auto mb-4" />
                                <Typography variant="h6" className="text-gray-600 mb-2">
                                    No Labs Assigned
                                </Typography>
                                <Typography color="textSecondary">
                                    There are no labs currently assigned to this course.
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        labs.map((lab) => (
                            <Grid item xs={12} md={6} lg={4} key={lab.id}>
                                <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-100 rounded-xl overflow-visible">
                                    <div className={`h-2 w-full ${lab.isActive ? 'bg-green-500' : 'bg-gray-300'} rounded-t-xl`} />
                                    <CardContent className="p-5">
                                        <Box className="flex justify-between items-start mb-4">
                                            <Box className="flex items-center gap-3">
                                                <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                                                    <MdComputer size={24} />
                                                </div>
                                                <Box>
                                                    <Typography variant="h6" className="font-bold leading-tight">
                                                        {lab.labName}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {lab.labCode}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip
                                                label={lab.labType?.replace('_', ' ')}
                                                size="small"
                                                className="uppercase text-[10px] font-bold tracking-wider"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <Box className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                                <Typography variant="caption" className="text-gray-500 block mb-0.5">Room</Typography>
                                                <Typography variant="body2" className="font-semibold flex items-center gap-1">
                                                    {lab.roomNumber}
                                                </Typography>
                                            </Box>
                                            <Box className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                                <Typography variant="caption" className="text-gray-500 block mb-0.5">Capacity</Typography>
                                                <Typography variant="body2" className="font-semibold flex items-center gap-1">
                                                    <MdPeople className="text-gray-400" />
                                                    {lab.capacity} Students
                                                </Typography>
                                            </Box>
                                        </div>

                                        <Box className="flex flex-wrap gap-2">
                                            <Chip
                                                icon={<MdAcUnit size={14} />}
                                                label="AC"
                                                size="small"
                                                className="bg-cyan-50 text-cyan-700 border-none"
                                            />
                                            <Chip
                                                icon={<MdTv size={14} />}
                                                label="Projector"
                                                size="small"
                                                className="bg-purple-50 text-purple-700 border-none"
                                            />
                                            <Chip
                                                icon={<MdSpeed size={14} />}
                                                label="High Speed"
                                                size="small"
                                                className="bg-orange-50 text-orange-700 border-none"
                                            />
                                        </Box>
                                    </CardContent>
                                    <CardActions className="p-4 pt-0 border-t border-gray-100 bg-gray-50/50">
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={() => navigate(`/labs/sessions?labId=${lab.id}`)}
                                            startIcon={<MdAccessTime />}
                                        >
                                            View Sessions
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {tabValue === 0 && (
                <Box className="space-y-10 mt-4">
                    {Array.from({ length: course.totalSemesters || 8 }, (_, i) => i + 1).map((sem) => {
                        const semSubjects = (course.subjects || []).filter(s => s.semesterNumber === sem);
                        return (
                            <Box key={sem} className="relative">
                                {/* Semester Header Card */}
                                <Paper className="p-5 mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex justify-between items-center overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />
                                    <Box className="flex items-center gap-4">
                                        <Box className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center border border-blue-100 shadow-inner">
                                            <Typography variant="caption" className="font-black leading-none opacity-60">SEM</Typography>
                                            <Typography variant="h5" className="font-black leading-none">{sem}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" className="font-bold text-slate-800">
                                                Semester {sem} Curriculum
                                            </Typography>
                                            <Typography variant="body2" className="text-slate-500 flex items-center gap-1">
                                                <MdSchool size={16} />
                                                {semSubjects.length} Academic Subjects
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<MdAdd />}
                                        onClick={() => handleOpenSubjectModal(sem)}
                                        className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-bold px-4 py-2 capitalize"
                                    >
                                        Add Subject
                                    </Button>
                                </Paper>

                                <Grid container spacing={2.5}>
                                    {semSubjects.length === 0 ? (
                                        <Grid item xs={12}>
                                            <Paper className="p-8 text-center bg-slate-50/50 border-dashed border-2 border-slate-200 rounded-2xl">
                                                <Typography variant="body2" className="text-slate-400 italic">
                                                    No subjects defined for this semester yet. Click "Add Subject" to start building the curriculum.
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ) : (
                                        semSubjects.map((subject) => (
                                            <Grid item xs={12} md={6} lg={4} key={subject.id}>
                                                <Card className="rounded-2xl border border-slate-200 shadow-none hover:shadow-lg hover:border-blue-200 transition-all duration-300 group overflow-visible">
                                                    <CardContent className="p-5">
                                                        <Box className="flex justify-between items-start mb-3">
                                                            <Box className="flex items-center gap-2.5">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${subject.labHours > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                                                    {subject.labHours > 0 ? <MdScience size={20} /> : <MdSchool size={20} />}
                                                                </div>
                                                                <Box>
                                                                    <Typography variant="subtitle1" className="font-black text-slate-900 leading-tight">
                                                                        {subject.subjectName}
                                                                    </Typography>
                                                                    <Typography variant="caption" className="font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                        {subject.subjectCode}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                            <Box className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleRemoveSubject(subject.id)}
                                                                    className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                                                >
                                                                    <MdDelete size={18} />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>

                                                        <Divider className="my-4 opacity-50" />

                                                        <Box className="flex items-center justify-between mb-4">
                                                            <Box className="flex gap-2">
                                                                <Chip
                                                                    label={`${subject.totalCredits} CR`}
                                                                    size="small"
                                                                    className="font-bold text-[10px] bg-slate-100 text-slate-600 border-none"
                                                                />
                                                                {subject.labHours > 0 && (
                                                                    <Chip
                                                                        label="LAB INCLUDED"
                                                                        size="small"
                                                                        className="font-bold text-[10px] bg-indigo-600 text-white border-none shadow-sm shadow-indigo-100"
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                                <Typography variant="caption" className="text-slate-400 block tracking-wider font-bold mb-0.5 uppercase text-[9px]">Theory Hours</Typography>
                                                                <Typography variant="body1" className="font-black text-slate-800">{subject.theoryHours}h</Typography>
                                                            </div>
                                                            <div className={`p-2.5 rounded-xl border transition-all ${subject.labHours > 0 ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                                                                <Typography variant="caption" className={`${subject.labHours > 0 ? 'text-blue-400' : 'text-slate-400'} block tracking-wider font-bold mb-0.5 uppercase text-[9px]`}>Lab Hours</Typography>
                                                                <Typography variant="body1" className={`font-black ${subject.labHours > 0 ? 'text-blue-700' : 'text-slate-800'}`}>{subject.labHours}h</Typography>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))
                                    )}
                                </Grid>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {tabValue === 2 && (
                <Box className="space-y-6">
                    <Box className="flex justify-between items-center">
                        <Box>
                            <Typography variant="h6" className="font-bold text-slate-800">Enrolled Students</Typography>
                            <Typography variant="body2" className="text-slate-500">
                                {course.enrolledStudents?.length || 0} students currently in this course
                            </Typography>
                        </Box>
                    </Box>

                    {(() => {
                        // Group students by semester
                        const studentsBySemester = (course.enrolledStudents || []).reduce((acc, student) => {
                            const sem = student.currentSemester || 0;
                            if (!acc[sem]) acc[sem] = [];
                            acc[sem].push(student);
                            return acc;
                        }, {});

                        const semesters = Object.keys(studentsBySemester).sort((a, b) => a - b);

                        if (semesters.length === 0) {
                            return (
                                <Paper className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm p-12 text-center">
                                    <MdPeople className="text-6xl text-slate-300 mx-auto mb-4" />
                                    <Typography variant="h6" className="text-slate-600 mb-2">
                                        No students enrolled yet
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Students will appear here once they're enrolled in this course.
                                    </Typography>
                                </Paper>
                            );
                        }

                        return semesters.map(semester => (
                            <Box key={semester} className="space-y-3">
                                <Box className="flex items-center gap-3">
                                    <Chip
                                        label={`Semester ${semester}`}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-4"
                                    />
                                    <Typography variant="caption" className="text-slate-400 font-medium">
                                        {studentsBySemester[semester].length} {studentsBySemester[semester].length === 1 ? 'student' : 'students'}
                                    </Typography>
                                </Box>

                                <Paper className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                                    <Box className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Student Name</th>
                                                    <th className="px-6 py-4">Roll / Reg Number</th>
                                                    <th className="px-6 py-4">Academic Year</th>
                                                    <th className="px-6 py-4">Contact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {studentsBySemester[semester].map((student) => (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <Box className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                                    {(student.fullName || student.username || '??').substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <Box>
                                                                    <Typography variant="subtitle2" className="font-bold">
                                                                        {student.fullName || student.username || 'Unknown Student'}
                                                                    </Typography>
                                                                    <Typography variant="caption" className="text-slate-400">
                                                                        {student.email || 'No email'}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Typography variant="body2" className="font-mono text-slate-700 font-semibold">
                                                                {student.rollNumber || 'Not Assigned'}
                                                            </Typography>
                                                            <Typography variant="caption" className="text-slate-400">
                                                                Reg: {student.registrationNumber || 'N/A'}
                                                            </Typography>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Typography variant="body2">{student.academicYear || 'N/A'}</Typography>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Typography variant="body2" className="text-slate-600">
                                                                {student.phoneNumber || 'N/A'}
                                                            </Typography>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Box>
                                </Paper>
                            </Box>
                        ));
                    })()}
                </Box>
            )}

            {tabValue === 3 && (
                <Box className="space-y-6">
                    <Box className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <Typography className="font-bold text-slate-700 whitespace-nowrap">
                            Select Semester:
                        </Typography>
                        <MuiTextField
                            select
                            size="small"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            sx={{ minWidth: 150, bgcolor: 'white' }}
                        >
                            {Array.from({ length: course.totalSemesters || 8 }, (_, i) => i + 1).map((sem) => (
                                <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                            ))}
                        </MuiTextField>
                        <Box className="flex-grow" />
                        <Chip
                            icon={<MdCheckCircleOutline />}
                            label={`Viewing Semester ${selectedSemester} Timetable`}
                            color="primary"
                            variant="outlined"
                            className="bg-white"
                        />
                    </Box>

                    <LabTimetable courseId={courseId} semester={selectedSemester} />
                </Box>
            )}

            {/* Subject Creation Modal */}
            <Dialog open={isSubjectModalOpen} onClose={handleCloseSubjectModal} fullWidth maxWidth="sm">
                <DialogTitle className="font-bold text-slate-900 border-b pb-4">
                    Add Subject to Semester {selectedSemester}
                </DialogTitle>
                <DialogContent className="pt-6">
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <MuiTextField
                                fullWidth
                                label="Subject Code"
                                name="subjectCode"
                                value={subjectFormData.subjectCode}
                                onChange={handleSubjectFormChange}
                                required
                                placeholder="e.g. CS101"
                            />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <MuiTextField
                                fullWidth
                                label="Subject Name"
                                name="subjectName"
                                value={subjectFormData.subjectName}
                                onChange={handleSubjectFormChange}
                                required
                                placeholder="e.g. Data Structures"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <MuiTextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={subjectFormData.description}
                                onChange={handleSubjectFormChange}
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <MuiTextField
                                fullWidth
                                label="Theory Hours"
                                name="theoryHours"
                                type="number"
                                value={subjectFormData.theoryHours}
                                onChange={handleSubjectFormChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <MuiTextField
                                fullWidth
                                label="Lab Hours"
                                name="labHours"
                                type="number"
                                value={subjectFormData.labHours}
                                onChange={handleSubjectFormChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <MuiTextField
                                fullWidth
                                label="Credits"
                                name="totalCredits"
                                type="number"
                                value={subjectFormData.totalCredits}
                                onChange={handleSubjectFormChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className="p-4 border-t bg-slate-50">
                    <Button onClick={handleCloseSubjectModal} className="text-slate-600">Cancel</Button>
                    <Button
                        onClick={handleSubjectSubmit}
                        variant="contained"
                        disabled={submittingSubject}
                        className="bg-blue-600 shadow-none px-6"
                    >
                        {submittingSubject ? <CircularProgress size={20} color="inherit" /> : 'Save Subject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Student Enrollment Modal */}
            <Dialog open={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle className="font-bold text-slate-900 border-b pb-4">
                    Enroll Student in Course
                </DialogTitle>
                <DialogContent className="pt-6">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <MuiTextField
                                select
                                fullWidth
                                label="Select Student"
                                value={enrollmentData.studentId}
                                onChange={(e) => setEnrollmentData({ ...enrollmentData, studentId: e.target.value })}
                                disabled={studentsLoading}
                            >
                                <MenuItem value="">
                                    {studentsLoading ? 'Loading students...' : 'Select a student'}
                                </MenuItem>
                                {allStudents
                                    .filter(s => !course.enrolledStudents?.find(es => es.id === s.id)) // Filter already enrolled
                                    .map((s) => (
                                        <MenuItem key={s.id} value={s.id}>
                                            {s.firstName} {s.lastName} ({s.rollNumber || 'No Roll #'})
                                        </MenuItem>
                                    ))
                                }
                            </MuiTextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <MuiTextField
                                select
                                fullWidth
                                label="Assign to Semester"
                                value={enrollmentData.semester}
                                onChange={(e) => setEnrollmentData({ ...enrollmentData, semester: e.target.value })}
                            >
                                {Array.from({ length: course.totalSemesters || 8 }, (_, i) => i + 1).map(sem => (
                                    <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                                ))}
                            </MuiTextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <MuiTextField
                                fullWidth
                                label="Academic Year"
                                value={enrollmentData.academicYear}
                                onChange={(e) => setEnrollmentData({ ...enrollmentData, academicYear: e.target.value })}
                                placeholder="e.g. 2024-25"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <MuiTextField
                                fullWidth
                                label="Enrollment Number (Optional)"
                                value={enrollmentData.enrollmentNumber}
                                onChange={(e) => setEnrollmentData({ ...enrollmentData, enrollmentNumber: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className="p-4 border-t bg-slate-50">
                    <Button onClick={() => setIsEnrollModalOpen(false)} className="text-slate-600">Cancel</Button>
                    <Button
                        onClick={handleEnrollSubmit}
                        variant="contained"
                        disabled={enrolling}
                        className="bg-blue-600 shadow-none px-6"
                    >
                        {enrolling ? <CircularProgress size={20} color="inherit" /> : 'Enroll Student'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CourseDetails;
