import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import coursesReducer from '../features/courses/coursesSlice';
import labsReducer from '../features/labs/labsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import studentsReducer from '../features/students/studentsSlice';
import teachersReducer from '../features/teachers/teachersSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        courses: coursesReducer,
        labs: labsReducer,
        dashboard: dashboardReducer,
        students: studentsReducer,
        teachers: teachersReducer,
    },
});

export default store;
