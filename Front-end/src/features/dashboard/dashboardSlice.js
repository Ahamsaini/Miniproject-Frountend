import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Async thunk to fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get('/courses/dashboard/stats');
            return response.data;
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const initialState = {
    stats: null,
    isLoading: false,
    isError: false,
    message: '',
};

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = dashboardSlice.actions;
export default dashboardSlice.reducer;
