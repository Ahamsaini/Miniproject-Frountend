import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    MenuItem,
    Alert,
    CircularProgress
} from '@mui/material';
import { MdSave, MdArrowBack, MdWarning } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, useMediaQuery, List } from '@mui/material';
import axiosInstance from '../api/axiosInstance';

const LabSessionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const { user } = useSelector((state) => state.auth);
    const isTeacher = user?.role === 'TEACHER';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState(null);
    const [conflicts, setConflicts] = useState([]);
    const [labs, setLabs] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [formData, setFormData] = useState({
        courseId: '',
        semester: '',
        labId: '',
        subjectId: '',
        teacherId: '',
        sessionDate: '',
        startTime: '',
        endTime: '',
        sessionTopic: '',
        experimentName: '',
        section: ''
    });

    const [courses, setCourses] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const promises = [
                    axiosInstance.get('/labs?size=100'),
                    axiosInstance.get('/courses?size=100'),
                    axiosInstance.get('/subjects?size=200')
                ];

                // If not a teacher, also fetch all teachers for selection
                if (!isTeacher) {
                    promises.push(axiosInstance.get('/users/role/TEACHER'));
                }

                const [labsRes, coursesRes, subjectsRes, teachersRes] = await Promise.all(promises);

                setLabs(labsRes.data.content || labsRes.data || []);
                setCourses(coursesRes.data.content || coursesRes.data || []);
                setAllSubjects(subjectsRes.data.content || subjectsRes.data || []);

                if (!isTeacher && teachersRes) {
                    setTeachers(teachersRes.data.content || teachersRes.data || []);
                }

                if (isEdit) {
                    const sessionRes = await axiosInstance.get(`/labs/sessions/${id}`);
                    const session = sessionRes.data;
                    setFormData({
                        courseId: session.subject?.course?.id || '',
                        semester: session.subject?.semesterNumber?.toString() || '',
                        labId: session.lab?.id || '',
                        subjectId: session.subject?.id || '',
                        teacherId: session.teacher?.id || '',
                        sessionDate: session.sessionDate || '',
                        startTime: session.startTime?.substring(0, 5) || '',
                        endTime: session.endTime?.substring(0, 5) || '',
                        sessionTopic: session.sessionTopic || '',
                        experimentName: session.experimentName || '',
                        section: session.section || ''
                    });
                } else if (isTeacher) {
                    // Pre-fill teacher ID for new sessions created by teachers
                    setFormData(prev => ({ ...prev, teacherId: user.id }));
                }
            } catch (err) {
                console.error("Failed to load form data", err);
                setError("Failed to load initial data");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id, isEdit]);

    // Filter subjects when course or semester changes
    useEffect(() => {
        if (formData.courseId && formData.semester) {
            const filtered = allSubjects.filter(sub =>
                sub.course?.id === formData.courseId &&
                sub.semesterNumber === parseInt(formData.semester)
            );
            setFilteredSubjects(filtered);
            // Reset subject selection ONLY if not in edit mode OR if this change is manual
            // In edit mode initialization, we don't want to reset.
        } else {
            setFilteredSubjects([]);
        }
    }, [formData.courseId, formData.semester, allSubjects]);

    const selectedCourse = courses.find(c => c.id === formData.courseId);
    const availableSemesters = selectedCourse ? Array.from({ length: selectedCourse.totalSemesters }, (_, i) => i + 1) : [];

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setConflicts([]); // Clear conflicts when data changes
    };

    const checkConflicts = async () => {
        setLoading(true);
        setError(null);
        setConflicts([]);
        try {
            const res = await axiosInstance.post('/labs/check-conflicts', formData);
            if (res.data.hasConflict) {
                setConflicts(res.data.messages);
                setLoading(false);
                return true; // Has conflicts
            }
            return false; // No conflicts
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to check conflicts');
            setLoading(false);
            return true; // Treat error as potential conflict
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Conflict Check First
        const hasConflicts = await checkConflicts();
        if (hasConflicts) return;

        setLoading(true);
        setError(null);
        try {
            if (isEdit) {
                await axiosInstance.put(`/labs/sessions/${id}`, formData);
            } else {
                await axiosInstance.post('/labs/sessions', formData);
            }
            navigate('/labs');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} session`);
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Box className="flex justify-center py-20">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="max-w-4xl mx-auto space-y-6">
            <Button
                startIcon={<MdArrowBack />}
                onClick={() => navigate('/labs')}
                className="text-slate-600 hover:bg-slate-100 rounded-xl px-4 py-2"
                size={isMobile ? "small" : "medium"}
            >
                Back to Sessions
            </Button>

            <Paper className="p-5 md:p-8 border border-slate-200 rounded-3xl md:rounded-2xl shadow-sm">
                <Typography variant="h5" className="font-extrabold text-slate-900 mb-1 text-xl md:text-2xl">
                    {isEdit ? 'Reschedule Lab Session' : 'Schedule Lab Session'}
                </Typography>
                <Typography variant="body2" className="text-slate-500 mb-6 md:mb-8 text-xs md:text-sm font-medium">
                    {isEdit ? 'Modify timings or location for this experiment' : 'Plan a new experiment session for students'}
                </Typography>

                {error && <Alert severity="error" className="mb-6 rounded-lg">{error}</Alert>}

                {conflicts.length > 0 && (
                    <Alert
                        severity="warning"
                        icon={<MdWarning size={24} />}
                        className="mb-6 rounded-xl border border-amber-100 bg-amber-50"
                    >
                        <Typography className="font-bold mb-1">Scheduling Conflicts Detected:</Typography>
                        <List className="py-0">
                            {conflicts.map((msg, i) => (
                                <li key={i} className="text-sm list-disc ml-4">{msg}</li>
                            ))}
                        </List>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Course"
                                name="courseId"
                                required
                                value={formData.courseId}
                                onChange={handleChange}
                                disabled={isEdit}
                            >
                                {Object.entries(courses.reduce((acc, c) => {
                                    const dept = c.department || 'Other';
                                    if (!acc[dept]) acc[dept] = [];
                                    acc[dept].push(c);
                                    return acc;
                                }, {})).map(([dept, deptCourses]) => [
                                    <MenuItem key={`header-${dept}`} disabled className="font-bold opacity-100 text-blue-600 bg-blue-50/50">
                                        {dept} Department
                                    </MenuItem>,
                                    ...deptCourses.map(course => (
                                        <MenuItem key={course.id} value={course.id} sx={{ pl: 4 }}>{course.courseName}</MenuItem>
                                    ))
                                ])}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Semester"
                                name="semester"
                                required
                                disabled={!formData.courseId || isEdit}
                                value={formData.semester}
                                onChange={handleChange}
                            >
                                {availableSemesters.map(sem => (
                                    <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Subject"
                                name="subjectId"
                                required
                                disabled={!formData.semester || isEdit}
                                value={formData.subjectId}
                                onChange={handleChange}
                            >
                                {filteredSubjects.map(sub => (
                                    <MenuItem key={sub.id} value={sub.id}>{sub.subjectName} ({sub.subjectCode})</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Laboratory Room"
                                name="labId"
                                required
                                value={formData.labId}
                                onChange={handleChange}
                            >
                                {labs.map(lab => (
                                    <MenuItem key={lab.id} value={lab.id}>{lab.labName} (Room {lab.roomNumber})</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Assign Teacher"
                                name="teacherId"
                                required
                                value={formData.teacherId}
                                onChange={handleChange}
                                disabled={isTeacher}
                            >
                                {isTeacher ? (
                                    <MenuItem value={user.id}>{user.fullName || user.username || user.firstName + ' ' + user.lastName}</MenuItem>
                                ) : (
                                    teachers.map(t => (
                                        <MenuItem key={t.id} value={t.id}>{t.fullName || t.username || t.firstName + ' ' + t.lastName}</MenuItem>
                                    ))
                                )}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Section (Cohort)"
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                helperText="Optional: Leave blank for all sections"
                                disabled={isEdit}
                            >
                                <MenuItem value="">All Sections</MenuItem>
                                <MenuItem value="A">Section A</MenuItem>
                                <MenuItem value="B">Section B</MenuItem>
                                <MenuItem value="C">Section C</MenuItem>
                                <MenuItem value="D">Section D</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Session Date"
                                name="sessionDate"
                                required
                                InputLabelProps={{ shrink: true }}
                                value={formData.sessionDate}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="time"
                                label="Start Time"
                                name="startTime"
                                required
                                InputLabelProps={{ shrink: true }}
                                value={formData.startTime}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="time"
                                label="End Time"
                                name="endTime"
                                required
                                InputLabelProps={{ shrink: true }}
                                value={formData.endTime}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Experiment / Topic Name"
                                name="experimentName"
                                placeholder="e.g. Implementation of Linked Lists"
                                required
                                value={formData.experimentName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Objectives"
                                name="sessionTopic"
                                multiline
                                rows={2}
                                value={formData.sessionTopic}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Box className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-8 md:mt-10">
                        <Button
                            variant="outlined"
                            fullWidth={isMobile}
                            onClick={() => navigate('/labs')}
                            className="rounded-xl px-8 border-slate-200 text-slate-600 font-bold py-2.5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth={isMobile}
                            startIcon={!loading && <MdSave />}
                            disabled={loading}
                            className="bg-primary hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl px-10 py-2.5 font-bold"
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Save Changes' : 'Schedule Lab')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default LabSessionForm;
