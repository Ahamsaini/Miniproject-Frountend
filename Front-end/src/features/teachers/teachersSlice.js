import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Fetch all teachers
export const fetchTeachers = createAsyncThunk(
    'teachers/fetchTeachers',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/teachers', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch teachers');
        }
    }
);

// Fetch unassigned teachers (no Employee ID)
export const fetchUnassignedTeachers = createAsyncThunk(
    'teachers/fetchUnassignedTeachers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/teachers/unassigned');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch unassigned teachers');
        }
    }
);

// Update teacher
export const updateTeacher = createAsyncThunk(
    'teachers/updateTeacher',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/teachers/${id}`, data);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update teacher');
        }
    }
);

// Delete/Deactivate teacher
export const deleteTeacher = createAsyncThunk(
    'teachers/deleteTeacher',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/teachers/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete teacher');
        }
    }
);

// Fetch sessions for a specific teacher
export const fetchTeacherSessions = createAsyncThunk(
    'teachers/fetchTeacherSessions',
    async (teacherId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/teachers/${teacherId}/lab-sessions`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch teacher sessions');
        }
    }
);

// Delete teacher with reassignment
export const reassignAndDeleteTeacher = createAsyncThunk(
    'teachers/reassignAndDeleteTeacher',
    async ({ teacherId, reassignments }, { rejectWithValue }) => {
        try {
            await axiosInstance.post(`/teachers/${teacherId}/reassign-and-delete`, {
                sessionTeacherMap: reassignments
            });
            return teacherId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to reassign sessions and delete teacher');
        }
    }
);

const teachersSlice = createSlice({
    name: 'teachers',
    initialState: {
        items: [],
        unassignedItems: [], // New state for onboarding
        loading: false,
        error: null,
        pagination: {
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: 20
        }
    },
    reducers: {
        clearTeacherError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Teachers
            .addCase(fetchTeachers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTeachers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content || action.payload;
                state.pagination = {
                    totalElements: action.payload.totalElements || action.payload.length,
                    totalPages: action.payload.totalPages || 1,
                    number: action.payload.number || 0,
                    size: action.payload.size || action.payload.length
                };
            })
            .addCase(fetchTeachers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Unassigned
            .addCase(fetchUnassignedTeachers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUnassignedTeachers.fulfilled, (state, action) => {
                state.loading = false;
                state.unassignedItems = action.payload;
            })
            .addCase(fetchUnassignedTeachers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Teacher
            .addCase(updateTeacher.fulfilled, (state, action) => {
                const index = state.items.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                // Also remove from unassigned if it was there
                state.unassignedItems = state.unassignedItems.filter(t => t.id !== action.payload.id);
            })
            // Delete Teacher
            .addCase(deleteTeacher.fulfilled, (state, action) => {
                state.items = state.items.filter(t => t.id !== action.payload);
            });
    }
});

export const { clearTeacherError } = teachersSlice.actions;
export default teachersSlice.reducer;
