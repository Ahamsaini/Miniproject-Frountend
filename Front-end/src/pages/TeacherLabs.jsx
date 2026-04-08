import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Chip,
    Container,
    Tabs,
    Tab,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    MdScience,
    MdAdd,
    MdSchedule,
    MdPeople,
    MdComputer,
    MdArrowForward,
    MdCheckCircle
} from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLabs, fetchAssignedLabs } from '../features/labs/labsSlice';

const TeacherLabs = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    // Determine view mode based on URL or Tab
    const isAllLabs = location.pathname.includes('all-labs');
    const [tabValue, setTabValue] = useState(isAllLabs ? 1 : 0);

    const { items: labs, loading } = useSelector((state) => state.labs);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (tabValue === 0 && user?.id) {
            dispatch(fetchAssignedLabs(user.id));
        } else {
            dispatch(fetchLabs({ page: 0, size: 50 }));
        }
    }, [dispatch, tabValue, user?.id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 0) navigate('/teacher/my-labs');
        else navigate('/teacher/all-labs');
    };


    if (loading) return <Box className="flex justify-center p-20"><CircularProgress /></Box>;

    return (
        <Box className="space-y-6">
            <Box className="flex justify-between items-center">
                <Box>
                    <Typography variant="h4" className="font-extrabold text-slate-900">
                        {tabValue === 0 ? 'My Assigned Labs' : 'All Laboratory Facilities'}
                    </Typography>
                    <Typography variant="body1" className="text-slate-500 mt-1">
                        {tabValue === 0 ? 'Manage your primary teaching locations' : 'Directory of all available labs in the college'}
                    </Typography>
                </Box>
                {tabValue === 0 && (
                    <Button
                        variant="contained"
                        startIcon={<MdSchedule />}
                        className="bg-primary hover:bg-primary-dark rounded-xl px-6 py-2 shadow-lg shadow-blue-200 font-bold"
                        onClick={() => navigate('/labs/new')} // Or a specific schedule route
                    >
                        Schedule Session
                    </Button>
                )}
            </Box>

            {/* Tabs for switching views */}
            <Paper className="rounded-2xl border border-slate-200 mb-6">
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="My Labs" icon={<MdScience size={20} />} iconPosition="start" className="font-bold py-4" />
                    <Tab label="All Labs Directory" icon={<MdComputer size={20} />} iconPosition="start" className="font-bold py-4" />
                </Tabs>
            </Paper>

            <Grid container spacing={4}>
                {labs.map((lab) => (
                    <Grid item xs={12} md={6} lg={4} key={lab.id}>
                        <Paper className="rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col">
                            {/* Card Header */}
                            <Box className="p-6 bg-slate-50 border-b border-slate-100 relative">
                                <Box className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <MdScience size={24} />
                                    </div>
                                    <Chip
                                        label={lab.labType?.replace('_', ' ') || 'General'}
                                        size="small"
                                        className="font-bold bg-white border border-slate-200"
                                    />
                                </Box>
                                <Typography variant="h5" className="font-bold text-slate-900 mb-1">
                                    {lab.labName}
                                </Typography>
                                <Typography variant="body2" className="text-slate-500 font-medium">
                                    {lab.building} • Room {lab.roomNumber}
                                </Typography>
                            </Box>

                            {/* Card Content */}
                            <Box className="p-6 flex-1">
                                <Box className="grid grid-cols-2 gap-4 mb-6">
                                    <Box className="p-3 bg-blue-50/50 rounded-2xl text-center">
                                        <Typography variant="caption" className="block text-slate-400 font-bold uppercase">Capacity</Typography>
                                        <Typography variant="h6" className="font-black text-slate-800">{lab.capacity}</Typography>
                                    </Box>
                                    <Box className="p-3 bg-green-50/50 rounded-2xl text-center">
                                        <Typography variant="caption" className="block text-slate-400 font-bold uppercase">Machines</Typography>
                                        <Typography variant="h6" className="font-black text-slate-800">{lab.availablePcs || '-'}</Typography>
                                    </Box>
                                </Box>

                                <Box className="space-y-3">
                                    <Typography variant="subtitle2" className="font-bold text-slate-900">Features</Typography>
                                    <Box className="flex flex-wrap gap-2">
                                        {lab.isAirConditioned && <Chip size="small" icon={<MdCheckCircle />} label="AC" className="bg-slate-50" />}
                                        {lab.hasProjector && <Chip size="small" icon={<MdCheckCircle />} label="Projector" className="bg-slate-50" />}
                                        {lab.internetSpeed && <Chip size="small" icon={<MdCheckCircle />} label={lab.internetSpeed} className="bg-slate-50" />}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Card Actions */}
                            <Box className="p-4 border-t border-slate-100 bg-slate-50/50">
                                <Button
                                    fullWidth
                                    endIcon={<MdArrowForward />}
                                    onClick={() => navigate(`/teacher/history?labId=${lab.id}`)}
                                    className="rounded-xl py-3 font-bold text-slate-600 hover:bg-white hover:shadow-md transition-all justify-between"
                                >
                                    View History
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default TeacherLabs;
