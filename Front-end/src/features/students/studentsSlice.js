import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchStudents = createAsyncThunk(
    'students/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/students', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch students');
        }
    }
);

export const fetchStudentAttendanceSummary = createAsyncThunk(
    'students/fetchSummary',
    async (studentId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/students/${studentId}/attendance/summary`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch summary');
        }
    }
);

export const enrollStudentInCourse = createAsyncThunk(
    'students/enrollInCourse',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/students/${payload.studentId}/enroll-course`, payload);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to enroll student');
        }
    }
);

export const fetchUnassignedStudents = createAsyncThunk(
    'students/fetchUnassigned',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/students/unassigned');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch unassigned students');
        }
    }
);

export const updateStudent = createAsyncThunk(
    'students/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/students/${id}`, data);
            return response.data;
        } catch (err) {
            if (err.response?.data?.data && typeof err.response.data.data === 'object') {
                const validationErrors = Object.entries(err.response.data.data)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join(', ');
                return rejectWithValue(validationErrors);
            }
            return rejectWithValue(err.response?.data?.message || 'Failed to update student');
        }
    }
);

const studentsSlice = createSlice({
    name: 'students',
    initialState: {
        items: [],
        unassignedItems: [], // New state for onboarding
        loading: false,
        error: null,
        pagination: { totalElements: 0, totalPages: 0, number: 0 },
        attendanceSummary: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudents.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content || (Array.isArray(action.payload) ? action.payload : []);
                state.pagination = {
                    totalElements: action.payload.totalElements || 0,
                    totalPages: action.payload.totalPages || 0,
                    number: action.payload.number || 0,
                };
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Unassigned Students
            .addCase(fetchUnassignedStudents.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUnassignedStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.unassignedItems = action.payload;
            })
            .addCase(fetchUnassignedStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Student
            .addCase(updateStudent.fulfilled, (state, action) => {
                const index = state.items.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                // Also remove from unassigned if it were there
                state.unassignedItems = state.unassignedItems.filter(s => s.id !== action.payload.id);
            })
            // Fetch Attendance Summary
            .addCase(fetchStudentAttendanceSummary.fulfilled, (state, action) => {
                state.attendanceSummary = action.payload;
            });
    },
});

export default studentsSlice.reducer;
