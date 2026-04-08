import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { MdCheckCircle, MdCancel } from 'react-icons/md';

const SessionAttendanceModal = ({ open, onClose, session, attendance }) => {
    if (!session) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ className: "rounded-3xl" }}
        >
            <DialogTitle className="border-b border-slate-100 pb-4">
                <Box className="flex justify-between items-center">
                    <Box>
                        <Typography variant="h6" className="font-bold text-slate-900">
                            Session Attendance Details
                        </Typography>
                        <Typography variant="caption" className="text-slate-500">
                            {session.subject.subjectName} ({session.sessionDate})
                            {session.section && ` • Section ${session.section}`}
                        </Typography>
                    </Box>
                    <Chip
                        label={`${attendance.filter(a => a.status === 'PRESENT').length} Present / ${attendance.length} Total`}
                        className="bg-slate-900 text-white font-bold"
                    />
                </Box>
            </DialogTitle>
            <DialogContent className="p-0">
                <TableContainer sx={{ maxHeight: '60vh' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell className="bg-slate-50 font-bold text-slate-600">Roll Number</TableCell>
                                <TableCell className="bg-slate-50 font-bold text-slate-600">Student Name</TableCell>
                                <TableCell className="bg-slate-50 font-bold text-slate-600">Entry Time</TableCell>
                                <TableCell className="bg-slate-50 font-bold text-slate-600">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendance.length > 0 ? (
                                attendance.map((att) => (
                                    <TableRow key={att.id} hover>
                                        <TableCell className="font-mono text-slate-600">{att.student.rollNumber}</TableCell>
                                        <TableCell className="font-bold text-slate-800">
                                            {att.student.firstName} {att.student.lastName}
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {att.entryTime || '--:--'}
                                        </TableCell>
                                        <TableCell>
                                            {att.status === 'PRESENT' ? (
                                                <Chip
                                                    icon={<MdCheckCircle size={14} />}
                                                    label="PRESENT"
                                                    size="small"
                                                    className="bg-green-50 text-green-700 font-bold text-[10px]"
                                                />
                                            ) : (
                                                <Chip
                                                    icon={<MdCancel size={14} />}
                                                    label="ABSENT"
                                                    size="small"
                                                    className="bg-red-50 text-red-700 font-bold text-[10px]"
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" className="py-8 text-slate-500">
                                        No attendance records found for this session.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions className="p-4 border-t border-slate-100">
                <Button
                    onClick={onClose}
                    className="text-slate-600 font-bold"
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionAttendanceModal;
