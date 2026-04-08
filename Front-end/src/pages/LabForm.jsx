import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Divider,
    Alert
} from '@mui/material';
import { MdSave, MdArrowBack } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const LabForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        labCode: '',
        labName: '',
        labType: 'COMPUTER_LAB',
        building: '',
        floor: '',
        roomNumber: '',
        capacity: '',
        description: '',
        specifications: '',
        facilities: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchLabData();
        }
    }, [id]);

    const fetchLabData = async () => {
        try {
            const response = await axiosInstance.get(`/labs/${id}`);
            setFormData({
                labCode: response.data.labCode || '',
                labName: response.data.labName || '',
                labType: response.data.labType || 'COMPUTER_LAB',
                building: response.data.building || '',
                floor: response.data.floor || '',
                roomNumber: response.data.roomNumber || '',
                capacity: response.data.capacity || '',
                description: response.data.description || '',
                specifications: response.data.specifications || '',
                facilities: response.data.facilities || ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch lab data');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                capacity: parseInt(formData.capacity)
            };

            if (isEditMode) {
                await axiosInstance.put(`/labs/${id}`, payload);
            } else {
                await axiosInstance.post('/labs', payload);
            }

            setSuccess(true);
            setTimeout(() => navigate('/labs'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} lab`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <Button
                startIcon={<MdArrowBack />}
                onClick={() => navigate('/labs')}
                className="text-slate-600 hover:bg-slate-100 rounded-xl"
            >
                Back to Labs
            </Button>

            <Paper className="p-8 rounded-[2rem] border border-slate-200 shadow-sm bg-white">
                <Typography variant="h5" className="font-extrabold text-slate-900 mb-2">
                    {isEditMode ? 'Edit Lab' : 'Create New Lab'}
                </Typography>
                <Typography variant="body2" className="text-slate-500 font-medium mb-8">
                    {isEditMode ? 'Update lab information and specifications' : 'Fill in the details to create a new laboratory'}
                </Typography>

                {error && <Alert severity="error" className="mb-6 rounded-2xl">{error}</Alert>}
                {success && <Alert severity="success" className="mb-6 rounded-2xl">Lab {isEditMode ? 'updated' : 'created'} successfully!</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" className="font-bold text-slate-900 mb-4">Basic Information</Typography>
                            <Divider className="mb-6" />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Lab Code"
                                name="labCode"
                                value={formData.labCode}
                                onChange={handleChange}
                                required
                                placeholder="e.g., LAB-CS-101"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Lab Name"
                                name="labName"
                                value={formData.labName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Computer Science Lab 1"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Lab Type</InputLabel>
                                <Select
                                    name="labType"
                                    value={formData.labType}
                                    onChange={handleChange}
                                    label="Lab Type"
                                >
                                    <MenuItem value="COMPUTER_LAB">Computer Lab</MenuItem>
                                    <MenuItem value="ELECTRONICS_LAB">Electronics Lab</MenuItem>
                                    <MenuItem value="PHYSICS_LAB">Physics Lab</MenuItem>
                                    <MenuItem value="CHEMISTRY_LAB">Chemistry Lab</MenuItem>
                                    <MenuItem value="BIOLOGY_LAB">Biology Lab</MenuItem>
                                    <MenuItem value="NETWORKING_LAB">Networking Lab</MenuItem>
                                    <MenuItem value="RESEARCH_LAB">Research Lab</MenuItem>
                                    <MenuItem value="MULTIMEDIA_LAB">Multimedia Lab</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Capacity"
                                name="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 30"
                            />
                        </Grid>

                        {/* Location Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" className="font-bold text-slate-900 mb-4 mt-6">Location</Typography>
                            <Divider className="mb-6" />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Building"
                                name="building"
                                value={formData.building}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Main Block"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Floor"
                                name="floor"
                                value={formData.floor}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 2"
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Room Number"
                                name="roomNumber"
                                value={formData.roomNumber}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 201"
                            />
                        </Grid>

                        {/* Additional Details */}
                        <Grid item xs={12}>
                            <Typography variant="h6" className="font-bold text-slate-900 mb-4 mt-6">Additional Details</Typography>
                            <Divider className="mb-6" />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                placeholder="Brief description of the lab and its purpose"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Specifications"
                                name="specifications"
                                value={formData.specifications}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                placeholder="Technical specifications (e.g., Machine specs, equipment list)"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Facilities"
                                name="facilities"
                                value={formData.facilities}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                placeholder="Available facilities (e.g., projector, whiteboard, AC)"
                            />
                        </Grid>

                        {/* Action Buttons */}
                        <Grid item xs={12} className="mt-8">
                            <Box className="flex gap-4 justify-end">
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/labs')}
                                    className="rounded-xl px-8 border-slate-200 text-slate-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<MdSave />}
                                    disabled={loading}
                                    className="bg-primary rounded-xl px-8 shadow-lg shadow-blue-200"
                                >
                                    {loading ? 'Saving...' : (isEditMode ? 'Update Lab' : 'Create Lab')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default LabForm;
