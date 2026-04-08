import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Container,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Stack,
    Avatar,
    Chip
} from '@mui/material';
import { MdCheckCircle, MdOutlineVpnKey, MdComputer, MdWarning } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { submitAttendanceCode, clearLabError } from '../features/labs/labsSlice';
import axiosInstance from '../api/axiosInstance';

const CodeSubmission = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.labs);
    const { user } = useSelector((state) => state.auth);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [pcNumber, setPcNumber] = useState('');
    const [success, setSuccess] = useState(false);
    const [occupiedComputers, setOccupiedComputers] = useState([]);
    const [loadingOccupied, setLoadingOccupied] = useState(false);

    useEffect(() => {
        const fetchOccupiedComputers = async () => {
            setLoadingOccupied(true);
            try {
                const response = await axiosInstance.get(`/labs/sessions/${sessionId}/occupied-computers`);
                setOccupiedComputers(response.data || []);
            } catch (err) {
                console.error('Failed to load occupied computers:', err);
            } finally {
                setLoadingOccupied(false);
            }
        };

        if (sessionId) {
            fetchOccupiedComputers();
        }
    }, [sessionId]);

    const handleInput = (index, value) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value.toUpperCase();
        setCode(newCode);

        // Auto focus next
        if (value && index < 5) {
            document.getElementById(`code-input-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-input-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (type) => {
        dispatch(clearLabError());
        const finalCode = code.join('');
        if (finalCode.length < 6) return;
        if (type === 'entry' && !pcNumber) {
            alert('Please enter your Machine/Bench number to continue');
            return;
        }

        // Check if computer is occupied (case-insensitive)
        if (type === 'entry' && occupiedComputers.some(pc => pc.toLowerCase() === pcNumber.toLowerCase())) {
            alert(`Computer ${pcNumber} is already occupied. Please select a different machine.`);
            return;
        }

        const result = await dispatch(submitAttendanceCode({
            sessionId,
            code: finalCode,
            type,
            studentId: user?.id,
            pcNumber: pcNumber
        }));

        if (!result.error) {
            setSuccess(true);
            setTimeout(() => navigate('/student/dashboard'), 2000);
        }
    };

    return (
        <Box className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <Container maxWidth="xs">
                <Paper className="p-10 rounded-[2.5rem] border border-slate-200 shadow-xl bg-white text-center">
                    <Avatar className="w-20 h-20 bg-primary/10 text-primary mx-auto mb-6">
                        <MdOutlineVpnKey size={40} />
                    </Avatar>

                    <Typography variant="h4" className="font-black text-slate-900 mb-2">Verification</Typography>
                    <Typography variant="body2" className="text-slate-500 font-medium mb-10">
                        Enter the 6-digit code and your machine number to validate your lab presence.
                    </Typography>

                    {error && <Alert severity="error" className="mb-6 rounded-2xl">{error}</Alert>}
                    {success && (
                        <Box className="bg-green-50 p-6 rounded-3xl mb-8 flex flex-col items-center">
                            <MdCheckCircle className="text-green-500 mb-2" size={48} />
                            <Typography className="text-green-800 font-black">Logged Successfully!</Typography>
                            <Typography variant="caption" className="text-green-600">Redirecting to history...</Typography>
                        </Box>
                    )}

                    <Box className="mb-8">
                        <TextField
                            fullWidth
                            label="Machine / Bench Number"
                            variant="outlined"
                            placeholder="e.g., M-24 or L1-Bench-01"
                            value={pcNumber}
                            onChange={(e) => setPcNumber(e.target.value)}
                            required
                            error={pcNumber && occupiedComputers.some(pc => pc.toLowerCase() === pcNumber.toLowerCase())}
                            helperText={
                                pcNumber && occupiedComputers.some(pc => pc.toLowerCase() === pcNumber.toLowerCase())
                                    ? "⚠️ This computer is already occupied!"
                                    : `${occupiedComputers.length} computer(s) currently occupied`
                            }
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '1.2rem',
                                    fontWeight: '900',
                                    backgroundColor: '#f8fafc',
                                    '& fieldset': { borderColor: '#e2e8f0' },
                                    '& :hover fieldset': { borderColor: '#cbd5e1' },
                                },
                                '& .MuiInputLabel-root': { fontWeight: 'bold' }
                            }}
                        />
                        {loadingOccupied && (
                            <Box className="flex items-center gap-2 mt-2 text-slate-500">
                                <CircularProgress size={14} />
                                <Typography variant="caption">Loading occupied computers...</Typography>
                            </Box>
                        )}
                        {occupiedComputers.length > 0 && (
                            <Box className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <Box className="flex items-center gap-2 mb-2">
                                    <MdWarning className="text-amber-600" size={16} />
                                    <Typography variant="caption" className="font-bold text-amber-900 uppercase">
                                        Occupied Computers
                                    </Typography>
                                </Box>
                                <Box className="flex flex-wrap gap-1.5">
                                    {occupiedComputers.map((pc, idx) => (
                                        <Chip
                                            key={idx}
                                            label={pc}
                                            size="small"
                                            className="bg-amber-100 text-amber-800 font-bold text-xs"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Stack direction="row" spacing={1} justifyContent="center" className="mb-10">
                        {code.map((digit, i) => (
                            <TextField
                                key={i}
                                id={`code-input-${i}`}
                                value={digit}
                                onChange={(e) => handleInput(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                variant="outlined"
                                sx={{ width: '3.5rem' }}
                                inputProps={{
                                    className: "text-center text-2xl font-black p-0 h-16",
                                    maxLength: 1,
                                    style: { borderRadius: '1rem' }
                                }}
                            />
                        ))}
                    </Stack>

                    <Box className="space-y-4">
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading || code.join('').length < 6 || !pcNumber}
                            onClick={() => handleSubmit('entry')}
                            className="py-4 bg-primary rounded-3xl font-black shadow-lg shadow-blue-900/10 text-lg"
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log Entry'}
                        </Button>

                        <Button
                            fullWidth
                            variant="soft"
                            size="large"
                            disabled={loading || code.join('').length < 6}
                            onClick={() => handleSubmit('exit')}
                            className="py-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-3xl font-black text-lg"
                        >
                            Log Exit
                        </Button>
                    </Box>

                    <Box className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                        <MdComputer size={18} />
                        <Typography variant="caption" className="font-bold tracking-widest uppercase">
                            Terminal Verification Enabled
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default CodeSubmission;
