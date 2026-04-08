import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchCourses = createAsyncThunk(
    'courses/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/courses', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch courses');
        }
    }
);

export const fetchCourseById = createAsyncThunk(
    'courses/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/courses/${id}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch course');
        }
    }
);

export const createCourse = createAsyncThunk(
    'courses/create',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/courses', courseData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create course');
        }
    }
);

export const updateCourse = createAsyncThunk(
    'courses/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/courses/${id}`, data);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update course');
        }
    }
);

export const deleteCourse = createAsyncThunk(
    'courses/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/courses/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete course');
        }
    }
);

const coursesSlice = createSlice({
    name: 'courses',
    initialState: {
        items: [],
        loading: false,
        error: null,
        pagination: {
            totalElements: 0,
            totalPages: 0,
            number: 0,
        },
        selectedCourse: null,
    },
    reducers: {
        clearCourseError: (state) => {
            state.error = null;
        },
        setSelectedCourse: (state, action) => {
            state.selectedCourse = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchCourses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content || (Array.isArray(action.payload) ? action.payload : []);
                state.pagination = {
                    totalElements: action.payload.totalElements || 0,
                    totalPages: action.payload.totalPages || 0,
                    number: action.payload.number || 0,
                };
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch By ID
            .addCase(fetchCourseById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCourseById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedCourse = action.payload;
            })
            .addCase(fetchCourseById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createCourse.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            // Update
            .addCase(updateCourse.fulfilled, (state, action) => {
                const index = state.items.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteCourse.fulfilled, (state, action) => {
                state.items = state.items.filter(c => c.id !== action.payload);
            });
    },
});

export const { clearCourseError, setSelectedCourse } = coursesSlice.actions;
export default coursesSlice.reducer;
