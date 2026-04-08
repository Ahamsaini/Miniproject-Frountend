import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    List,
    ListItem,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { MdWarning, MdCheckCircle } from 'react-icons/md';

const ReassignmentDialog = ({ open, onClose, teacher, sessions, availableTeachers, onConfirm, loading }) => {
    const [reassignments, setReassignments] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setReassignments({});
            setError('');
        }
    }, [open]);

    const handleTeacherChange = (sessionId, teacherId) => {
        setReassignments(prev => ({
            ...prev,
            [sessionId]: teacherId
        }));
    };

    const handleBulkAssign = (teacherId) => {
        const newReassignments = {};
        sessions.forEach(session => {
            newReassignments[session.id] = teacherId;
        });
        setReassignments(newReassignments);
    };

    const isComplete = sessions.length === 0 || sessions.every(s => reassignments[s.id]);

    const handleConfirm = () => {
        if (!isComplete) {
            setError('Please assign all sessions to a replacement teacher before proceeding.');
            return;
        }
        onConfirm(reassignments);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ className: "rounded-3xl p-2" }}>
            <DialogTitle className="font-black text-slate-900 flex items-center gap-2">
                <MdWarning className="text-amber-500" size={28} />
                Reassign Lab Sessions & Delete Teacher
            </DialogTitle>
            <DialogContent>
                <Box className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Typography variant="body2" className="text-slate-600 mb-2">
                        You are about to delete <strong>{teacher?.fullName}</strong>.
                        They have <strong>{sessions.length}</strong> active lab sessions that must be reassigned.
                    </Typography>
                    {sessions.length > 0 && (
                        <Box className="flex items-center gap-2 mt-4">
                            <Typography variant="caption" className="font-bold text-slate-500 uppercase">Bulk Assign All To:</Typography>
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <Select
                                    onChange={(e) => handleBulkAssign(e.target.value)}
                                    displayEmpty
                                    className="rounded-lg bg-white"
                                >
                                    <MenuItem value="" disabled>Select Teacher</MenuItem>
                                    {availableTeachers.map(t => (
                                        <MenuItem key={t.id} value={t.id}>{t.fullName} ({t.department})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </Box>

                {error && <Alert severity="error" className="mb-4 rounded-xl">{error}</Alert>}

                <Typography variant="subtitle2" className="font-black text-slate-700 mb-2 px-2 uppercase tracking-wider text-[10px]">
                    Individual Session Mapping
                </Typography>

                <List className="space-y-3 p-0">
                    {sessions.length === 0 ? (
                        <Box className="py-10 text-center bg-emerald-50 rounded-2xl border border-emerald-100">
                            <MdCheckCircle className="text-emerald-500 mx-auto mb-2" size={32} />
                            <Typography className="text-emerald-700 font-bold">No sessions to reassign!</Typography>
                            <Typography variant="caption" className="text-emerald-600">This teacher can be deleted immediately.</Typography>
                        </Box>
                    ) : (
                        sessions.map((session) => (
                            <ListItem key={session.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                                <Box className="flex-1">
                                    <Typography className="font-bold text-slate-900">{session.subjectName}</Typography>
                                    <Box className="flex items-center gap-2 mt-1">
                                        <Chip label={session.sessionDate} size="small" className="bg-slate-100 font-mono text-[10px]" />
                                        <Typography variant="caption" className="text-slate-500">
                                            {session.startTime} - {session.endTime}
                                        </Typography>
                                    </Box>
                                </Box>

                                <FormControl size="small" sx={{ minWidth: 250 }} className="w-full md:w-auto">
                                    <InputLabel>Replacement Teacher</InputLabel>
                                    <Select
                                        label="Replacement Teacher"
                                        value={reassignments[session.id] || ''}
                                        onChange={(e) => handleTeacherChange(session.id, e.target.value)}
                                        className="rounded-xl"
                                    >
                                        {availableTeachers.map(t => (
                                            <MenuItem key={t.id} value={t.id}>
                                                <Box className="flex flex-col">
                                                    <Typography variant="body2" className="font-bold">{t.fullName}</Typography>
                                                    <Typography variant="caption" className="text-slate-500">{t.department}</Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </ListItem>
                        ))
                    )}
                </List>
            </DialogContent>
            <DialogActions className="p-6 border-t border-slate-50">
                <Button onClick={onClose} className="text-slate-500 font-bold px-6">Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={loading || (sessions.length > 0 && !isComplete)}
                    className={`bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl px-8 h-[48px] shadow-lg shadow-rose-600/20`}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Finalize & Delete Teacher'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReassignmentDialog;
