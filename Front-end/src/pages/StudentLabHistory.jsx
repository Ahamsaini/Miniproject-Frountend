import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Avatar,
    Divider,
    CircularProgress,
    IconButton,
    Tooltip,
    Button
} from '@mui/material';
import {
    MdDateRange,
    MdAccessTime,
    MdLocationOn,
    MdCheckCircle,
    MdError,
    MdInfo
} from 'react-icons/md';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';

const StudentLabHistory = () => {
    const { user } = useSelector((state) => state.auth);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const subjectId = searchParams.get('subjectId');

    useEffect(() => {
        if (user?.id) fetchPersonalHistory();
    }, [subjectId, user]);

    const fetchPersonalHistory = async () => {
        setLoading(true);
        try {
            const endpoint = subjectId
                ? `/students/${user?.id}/attendance/subject/${subjectId}`
                : `/students/${user?.id}/attendance`;

            const response = await axiosInstance.get(endpoint);
            // Mock data for UI demonstration
            const data = response.data.content || [
                {
                    id: "S1",
                    sessionDate: "2024-01-20",
                    entryTime: "09:05 AM",
                    status: "PRESENT",
                    isLate: true,
                    lateMinutes: 5,
                    labSession: {
                        lab: { labName: "Lab 01", roomNumber: "101" },
                        subject: { subjectName: "Java Programming", subjectCode: "CS101" },
                        experimentName: "Collection Framework Basics"
                    }
                },
                {
                    id: "S2",
                    sessionDate: "2024-01-18",
                    entryTime: "11:00 AM",
                    status: "PRESENT",
                    isLate: false,
                    labSession: {
                        lab: { labName: "Database Lab", roomNumber: "205" },
                        subject: { subjectName: "DBMS", subjectCode: "CS202" },
                        experimentName: "Normalization Practice"
                    }
                },
                {
                    id: "S3",
                    sessionDate: "2024-01-15",
                    entryTime: null,
                    status: "ABSENT",
                    labSession: {
                        lab: { labName: "Network Lab", roomNumber: "404" },
                        subject: { subjectName: "Networking", subjectCode: "CS303" },
                        experimentName: "Socket Programming"
                    }
                }
            ];
            setHistory(data);
        } catch (err) {
            console.error("Failed to fetch student history", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        return status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    };

    return (
        <Box className="space-y-6">
            <Box>
                <Typography variant="h5" className="font-bold text-slate-900">My Lab History</Typography>
                <Typography variant="body2" className="text-slate-500">Track your attendance and experiment participation</Typography>
            </Box>

            {loading ? (
                <Box className="flex justify-center py-20"><CircularProgress /></Box>
            ) : (
                <Grid container spacing={3}>
                    {history.map((record) => (
                        <Grid item xs={12} key={record.id}>
                            <Paper className="p-6 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <Box className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Left: Session Info */}
                                    <Box className="flex gap-4">
                                        <div className={`p-4 rounded-2xl flex items-center justify-center h-fit ${record.status === 'PRESENT' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                            <MdDateRange size={32} />
                                        </div>
                                        <Box>
                                            <Typography variant="h6" className="font-bold text-slate-900">
                                                {record.labSession?.subject?.subjectName || 'Lab Session'}
                                                {record.labSession?.subject?.subjectCode && (
                                                    <span className="ml-2 text-xs font-bold text-slate-400">({record.labSession.subject.subjectCode})</span>
                                                )}
                                            </Typography>
                                            <Typography variant="body2" className="text-slate-600 font-medium mb-2">
                                                {record.labSession?.experimentName || 'N/A'}
                                            </Typography>

                                            <Box className="flex flex-wrap gap-4 mt-4">
                                                <Box className="flex items-center gap-1.5 text-slate-500">
                                                    <MdLocationOn size={16} />
                                                    <Typography variant="caption" className="font-bold">
                                                        {record.labSession?.lab?.labName || 'Lab'} (Room {record.labSession?.lab?.roomNumber || 'N/A'})
                                                    </Typography>
                                                </Box>
                                                <Box className="flex items-center gap-1.5 text-slate-500">
                                                    <MdDateRange size={16} />
                                                    <Typography variant="caption" className="font-bold">{record.sessionDate}</Typography>
                                                </Box>
                                                {record.entryTime && (
                                                    <Box className="flex items-center gap-1.5 text-slate-500">
                                                        <MdAccessTime size={16} />
                                                        <Typography variant="caption" className="font-bold">Checked in at {record.entryTime}</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Right: Status & Actions */}
                                    <Box className="flex flex-col items-end justify-between min-w-[120px]">
                                        <Chip
                                            label={record.status}
                                            className={`${getStatusColor(record.status)} font-black text-[10px] px-2`}
                                            icon={record.status === 'PRESENT' ? <MdCheckCircle color="inherit" /> : <MdError color="inherit" />}
                                        />

                                        {record.isLate && (
                                            <Typography variant="caption" className="text-amber-600 font-bold flex items-center gap-1 mt-2">
                                                <MdInfo size={14} /> Late by {record.lateMinutes} mins
                                            </Typography>
                                        )}

                                        <Box className="mt-4 md:mt-0">
                                            <Button
                                                size="small"
                                                variant="soft"
                                                className="text-primary font-bold hover:bg-blue-50 rounded-lg"
                                            >
                                                View Report
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default StudentLabHistory;
