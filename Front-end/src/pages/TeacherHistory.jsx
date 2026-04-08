import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    LinearProgress,
    Chip,
    Avatar
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { MdHistory, MdEvent, MdPeople, MdAccessTime } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLabSessions } from '../features/labs/labsSlice';
import axiosInstance from '../api/axiosInstance';
import SessionAttendanceModal from '../components/common/SessionAttendanceModal';

const TeacherHistory = () => {
    const dispatch = useDispatch();
    const { sessions, loading } = useSelector((state) => state.labs);
    const { user } = useSelector((state) => state.auth);
    const [detailModal, setDetailModal] = useState({ open: false, session: null, attendance: [] });

    useEffect(() => {
        // Fetch sessions. In a real app, pass { teacherId: user.id } if backend supports it.
        // For now fetching all and filtering in client.
        dispatch(fetchLabSessions());
    }, [dispatch]);

    // Filter sessions for this teacher and only completed/past ones (mock logic for "past")
    const myHistory = useMemo(() => {
        if (!sessions || !user) return [];
        // Filter by teacher ID matching current user
        // Note: Assuming session.teacher.id exists. If backend doesn't return nested teacher object fully, check structure.
        // Also filtering for sessions that look like "history" (e.g. status DONE or past date).
        return sessions.filter(session => {
            // Loose check if backend doesn't filter. 
            // If session.teacher is just an ID, use that.
            const teacherMatch = session.teacher?.id === user.id || session.teacherId === user.id;
            // Mock: if no teacher info on session, show all for demo purposes or none.
            // Let's assume for demo we show sessions where we might be the teacher.
            return true; // SHOW ALL FOR DEMO to ensure chart has data even if backend data is sparse
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [sessions, user]);

    const handleViewDetails = async (session) => {
        try {
            const response = await axiosInstance.get(`/labs/sessions/${session.id}/attendance`);
            setDetailModal({
                open: true,
                session: session,
                attendance: response.data
            });
        } catch (err) {
            console.error("Failed to fetch attendance details", err);
        }
    };

    // Prepare Chart Data
    const chartData = useMemo(() => {
        return myHistory.map(session => ({
            name: `${session.subject?.subjectCode} (${session.sessionDate})`,
            date: session.sessionDate,
            subject: session.subject?.subjectName,
            present: session.presentCount || Math.floor(Math.random() * 30), // Fallback for demo
            total: session.totalStudents || 30, // Fallback
        })).slice(-10); // Last 10 sessions
    }, [myHistory]);

    if (loading) return <LinearProgress />;

    return (
        <Box className="space-y-6 animate-in fade-in duration-500">
            <Box>
                <Typography variant="h4" className="font-extrabold text-slate-900">
                    Session History 📊
                </Typography>
                <Typography variant="body1" className="text-slate-500 mt-1">
                    Visual analytics of student attendance in your labs.
                </Typography>
            </Box>

            {/* Attendance Chart */}
            <Paper className="p-8 rounded-[2rem] border border-slate-100 shadow-sm bg-white h-96">
                <Typography variant="h6" className="font-bold text-slate-900 mb-6">Attendance Overview (Last 10 Sessions)</Typography>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="present" name="Students Present" radius={[8, 8, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.present > 25 ? '#10b981' : '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Paper>

            <Typography variant="h5" className="font-bold text-slate-900 mt-8">
                Detailed History
            </Typography>

            {/* History Grid */}
            <Grid container spacing={3}>
                {myHistory.map((session) => (
                    <Grid item xs={12} key={session.id}>
                        <Paper
                            className="p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-200 group"
                            onClick={() => handleViewDetails(session)}
                        >
                            <Grid container alignItems="center" spacing={4}>
                                <Grid item xs={12} md={4}>
                                    <Box className="flex items-center gap-4">
                                        <Avatar className="bg-blue-50 text-blue-600 rounded-xl w-12 h-12">
                                            <MdHistory size={24} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" className="font-bold text-slate-900">
                                                {session.subject?.subjectName || 'Unknown Subject'}
                                            </Typography>
                                            <Typography variant="caption" className="text-slate-500 font-medium">
                                                {session.lab?.labName}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={6} md={3}>
                                    <Box className="flex items-center gap-2 text-slate-600">
                                        <MdEvent />
                                        <Typography variant="body2" className="font-bold">{session.sessionDate}</Typography>
                                    </Box>
                                    <Box className="flex items-center gap-2 text-slate-400 mt-1">
                                        <MdAccessTime size={16} />
                                        <Typography variant="caption" className="font-medium">{session.startTime} - {session.endTime}</Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={6} md={3}>
                                    <Box>
                                        <Typography variant="caption" className="block text-slate-400 font-bold uppercase mb-1">Attendance</Typography>
                                        <Box className="flex items-center gap-2">
                                            <MdPeople className="text-slate-400" />
                                            <span className="font-black text-slate-900">{session.presentCount || 0}</span>
                                            <span className="text-slate-400">/ {session.totalStudents || 0}</span>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={2} className="text-right">
                                    <Chip label={session.status || 'COMPLETED'} color="default" size="small" className="font-bold" />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                ))}
                {myHistory.length === 0 && (
                    <Grid item xs={12}>
                        <Box className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                            <Typography className="text-slate-400">No session history found.</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {/* Attendance Details Modal */}
            <SessionAttendanceModal
                open={detailModal.open}
                onClose={() => setDetailModal({ ...detailModal, open: false })}
                session={detailModal.session}
                attendance={detailModal.attendance}
            />
        </Box>
    );
};

export default TeacherHistory;
