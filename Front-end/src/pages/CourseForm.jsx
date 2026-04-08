import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    MenuItem,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import { MdSave, MdArrowBack } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse, updateCourse } from '../features/courses/coursesSlice';
import axiosInstance from '../api/axiosInstance';

const CourseForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.courses);

    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        description: '',
        durationYears: 4,
        totalSemesters: 8,
        department: '',
        totalCredits: 0,
        status: 'ACTIVE'
    });

    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isEdit) {
            setFetching(true);
            axiosInstance.get(`/courses/${id}`)
                .then(res => {
                    setFormData(res.data);
                    setFetching(false);
                })
                .catch(() => setFetching(false));
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'durationYears' || name === 'totalSemesters' || name === 'totalCredits')
                ? parseInt(value) || 0
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEdit) {
            await dispatch(updateCourse({ id, data: formData }));
        } else {
            await dispatch(createCourse(formData));
        }
        if (!error) navigate('/courses');
    };

    if (fetching) return <Box className="flex justify-center py-20"><CircularProgress /></Box>;

    return (
        <Box className="max-w-4xl mx-auto space-y-6">
            <Box className="flex items-center gap-4">
                <Button
                    startIcon={<MdArrowBack />}
                    onClick={() => navigate('/courses')}
                    className="text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                    Back to List
                </Button>
            </Box>

            <Paper className="p-8 border border-slate-200 rounded-2xl shadow-sm">
                <Typography variant="h5" className="font-bold text-slate-900 mb-1">
                    {isEdit ? 'Edit Course' : 'Create New Course'}
                </Typography>
                <Typography variant="body2" className="text-slate-500 mb-8">
                    Enter the details for the academic program
                </Typography>

                {error && <Alert severity="error" className="mb-6 rounded-lg">{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Typography variant="overline" className="text-primary font-bold tracking-widest block mb-4">
                        Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Course Code"
                                name="courseCode"
                                placeholder="e.g. BTECH-CS"
                                required
                                value={formData.courseCode}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Course Name"
                                name="courseName"
                                placeholder="e.g. Bachelor of Technology in Computer Science"
                                required
                                value={formData.courseName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Divider className="my-8 opacity-50" />

                    <Typography variant="overline" className="text-primary font-bold tracking-widest block mb-4">
                        Academic Details
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Department"
                                name="department"
                                required
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                                <MenuItem value="DRAFT">Draft</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Duration (Years)"
                                name="durationYears"
                                value={formData.durationYears}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Total Semesters"
                                name="totalSemesters"
                                value={formData.totalSemesters}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Total Credits"
                                name="totalCredits"
                                value={formData.totalCredits}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Box className="flex justify-end gap-3 mt-10">
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/courses')}
                            className="rounded-xl px-8 border-slate-200 text-slate-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={!loading && <MdSave />}
                            disabled={loading}
                            className="bg-primary hover:bg-blue-700 shadow-none rounded-xl px-10 py-2.5"
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Update Course' : 'Create Course')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default CourseForm;
