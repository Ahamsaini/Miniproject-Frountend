import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Fetch all labs
export const fetchLabs = createAsyncThunk(
    'labs/fetchLabs',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/labs', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch labs');
        }
    }
);

// Fetch labs by course ID
export const fetchLabsByCourseId = createAsyncThunk(
    'labs/fetchLabsByCourseId',
    async (courseId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/courses/${courseId}/labs`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch course labs');
        }
    }
);

// Fetch all lab sessions
export const fetchLabSessions = createAsyncThunk(
    'labs/fetchSessions',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/labs/sessions', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch sessions');
        }
    }
);

// Fetch single session by ID
export const fetchLabSessionById = createAsyncThunk(
    'labs/fetchSessionById',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/labs/sessions/${sessionId}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch session');
        }
    }
);

// Teacher: Generate Code (Start or End)
export const generateCode = createAsyncThunk(
    'labs/generateCode',
    async ({ sessionId, type }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/labs/sessions/${sessionId}/generate-code?type=${type.toUpperCase()}`);
            return { sessionId, code: response.data.code, type: type.toLowerCase() };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to generate code');
        }
    }
);

// Student: Submit Entry/Exit Code
export const submitAttendanceCode = createAsyncThunk(
    'labs/submitCode',
    async ({ sessionId, code, type, studentId, pcNumber }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/labs/sessions/attendance/mark', {
                sessionId,
                code,
                type: type.toUpperCase(),
                studentId,
                pcNumber
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Invalid or expired code');
        }
    }
);

// Teacher: Get Session Students
export const fetchSessionStudents = createAsyncThunk(
    'labs/fetchSessionStudents',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/labs/sessions/${sessionId}/attendance`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch students');
        }
    }
);

// Teacher: Finalize Attendance
export const finalizeAttendance = createAsyncThunk(
    'labs/finalize',
    async (sessionId, { rejectWithValue }) => {
        try {
            await axiosInstance.post(`/labs/sessions/${sessionId}/finalize`);
            return sessionId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to finalize');
        }
    }
);

// Teacher: Manual Entry
export const manualEntry = createAsyncThunk(
    'labs/manualEntry',
    async ({ sessionId, rollNumber }, { rejectWithValue }) => {
        try {
            // First resolve roll number to studentId (backend markManualAttendance takes studentId)
            const studentRes = await axiosInstance.get(`/students/roll/${rollNumber}`);
            const studentId = studentRes.data.id;

            await axiosInstance.post(`/labs/sessions/${sessionId}/attendance/manual`, {
                studentId,
                sessionId,
                status: 'PRESENT'
            });
            return { sessionId };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to add student');
        }
    }
);

// Teacher: Delete Attendance Record
export const deleteAttendanceRecord = createAsyncThunk(
    'labs/deleteAttendance',
    async (attendanceId, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/labs/sessions/attendance/${attendanceId}`);
            return attendanceId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete record');
        }
    }
);

// Teacher: Fetch assigned sessions
export const fetchTeacherSessions = createAsyncThunk(
    'labs/fetchTeacherSessions',
    async (teacherId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/teachers/${teacherId}/lab-sessions`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch teacher sessions');
        }
    }
);

// Teacher: Fetch upcoming sessions
export const fetchUpcomingTeacherSessions = createAsyncThunk(
    'labs/fetchUpcomingTeacherSessions',
    async (teacherId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/teachers/${teacherId}/lab-sessions/upcoming`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch upcoming sessions');
        }
    }
);

// Teacher: Fetch assigned labs
export const fetchAssignedLabs = createAsyncThunk(
    'labs/fetchAssignedLabs',
    async (teacherId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/teachers/${teacherId}/assigned-labs`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch assigned labs');
        }
    }
);

// Student: Find active session for current course/semester
export const fetchActiveSessionForStudent = createAsyncThunk(
    'labs/fetchActiveSession',
    async (studentId, { rejectWithValue }) => {
        try {
            // 1. Get student info to find course and semester
            const studentRes = await axiosInstance.get(`/students/${studentId}`);
            const student = studentRes.data;

            if (!student.course?.id) return null;

            // 2. Fetch ongoing sessions for this course and semester
            const sessionRes = await axiosInstance.get('/labs/sessions', {
                params: {
                    status: 'ONGOING',
                    courseId: student.course.id,
                    semester: student.currentSemester,
                    section: student.section,
                    size: 1
                }
            });

            const sessions = sessionRes.data.content || [];
            return sessions.length > 0 ? sessions[0] : null;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch active session');
        }
    }
);

// Student: Fetch all labs scheduled for today
export const fetchDailySessionsForStudent = createAsyncThunk(
    'labs/fetchDailySessions',
    async (studentId, { rejectWithValue }) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const studentRes = await axiosInstance.get(`/students/${studentId}`);
            const student = studentRes.data;

            if (!student.course?.id) return [];

            const sessionRes = await axiosInstance.get('/labs/sessions', {
                params: {
                    courseId: student.course.id,
                    semester: student.currentSemester,
                    section: student.section,
                    sessionDate: today,
                    size: 100
                }
            });

            return sessionRes.data.content || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch daily schedule');
        }
    }
);

// Student: Fetch today's attendance records
export const fetchTodayAttendance = createAsyncThunk(
    'labs/fetchTodayAttendance',
    async (studentId, { rejectWithValue }) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await axiosInstance.get(`/students/${studentId}/attendance`);
            // Filter attendance for today if backend doesn't support query params (assuming it returns all)
            // But based on controller, it supports pagination. If we want just today, we might need to filter frontend
            // or use specific subject endpoint if we knew it. For now, let's filter today's entries.
            const allAttendance = response.data.content || [];
            return allAttendance.filter(record => record.labSession?.sessionDate === today);
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch today\'s attendance');
        }
    }
);

const labsSlice = createSlice({
    name: 'labs',
    initialState: {
        items: [],
        sessions: [],
        dailySessions: [],
        currentSession: null,
        currentSessionStudents: [],
        studentActiveSession: null,
        todayAttendance: [], // Track records for JOIN/LEAVE status
        activeCodes: {}, // { sessionId: { entry: '...', exit: '...' } }
        loading: false,
        error: null,
    },
    reducers: {
        clearLabError: (state) => {
            state.error = null;
        },
        // Update a specific student in the current session list
        updateSessionStudent: (state, action) => {
            const index = state.currentSessionStudents.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.currentSessionStudents[index] = action.payload;
            }
        },
        // Add a student to the current session list
        addSessionStudent: (state, action) => {
            state.currentSessionStudents.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Labs
            .addCase(fetchLabs.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLabs.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content || action.payload;
            })
            .addCase(fetchLabs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Labs by Course ID
            .addCase(fetchLabsByCourseId.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLabsByCourseId.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchLabsByCourseId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Sessions
            .addCase(fetchLabSessions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLabSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = action.payload.content || action.payload;
            })
            .addCase(fetchLabSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Generate Code
            .addCase(generateCode.fulfilled, (state, action) => {
                const { sessionId, code, type } = action.payload;
                if (!state.activeCodes[sessionId]) state.activeCodes[sessionId] = {};
                state.activeCodes[sessionId][type] = code;
            })
            // Fetch Session By ID
            .addCase(fetchLabSessionById.fulfilled, (state, action) => {
                state.currentSession = action.payload;
                // Pre-populate codes if they exist in the response
                if (action.payload.sessionCodes) {
                    const codes = {};
                    action.payload.sessionCodes.forEach(c => {
                        if (c.isValid) codes[c.type.toLowerCase()] = c.code;
                    });
                    state.activeCodes[action.payload.id] = codes;
                }
            })
            // Fetch Session Students
            .addCase(fetchSessionStudents.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSessionStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSessionStudents = action.payload;
            })
            .addCase(fetchSessionStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Submit Attendance Code (Student)
            .addCase(submitAttendanceCode.fulfilled, (state, action) => {
                // Optionally update the student list if the response includes updated data
                if (action.payload && action.payload.student) {
                    const studentId = action.payload.student.id;
                    const index = state.currentSessionStudents.findIndex(s => s.student?.id === studentId);
                    if (index !== -1) {
                        state.currentSessionStudents[index] = action.payload;
                    } else {
                        state.currentSessionStudents.push(action.payload);
                    }
                }
            })
            .addCase(submitAttendanceCode.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Manual Entry
            .addCase(manualEntry.fulfilled, (state) => {
                // Will refresh the student list in the component after success
            })
            // Delete Attendance
            .addCase(deleteAttendanceRecord.fulfilled, (state, action) => {
                state.currentSessionStudents = state.currentSessionStudents.filter(
                    s => s.id !== action.payload
                );
            })
            // Fetch Teacher Sessions
            .addCase(fetchTeacherSessions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTeacherSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = action.payload;
                // Pre-populate activeCodes for all sessions
                action.payload.forEach(session => {
                    if (session.sessionCodes) {
                        const codes = {};
                        session.sessionCodes.forEach(c => {
                            if (c.isValid) codes[c.type.toLowerCase()] = c.code;
                        });
                        state.activeCodes[session.id] = codes;
                    }
                });
            })
            .addCase(fetchTeacherSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Assigned Labs
            .addCase(fetchAssignedLabs.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAssignedLabs.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchAssignedLabs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Active Session for Student
            .addCase(fetchActiveSessionForStudent.fulfilled, (state, action) => {
                state.studentActiveSession = action.payload;
            })
            // Fetch Daily Sessions for Student
            .addCase(fetchDailySessionsForStudent.fulfilled, (state, action) => {
                state.dailySessions = action.payload;
            })
            // Fetch Today's Attendance
            .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
                state.todayAttendance = action.payload;
            });
    },
});

export const { clearLabError, updateSessionStudent, addSessionStudent } = labsSlice.actions;
export default labsSlice.reducer;
