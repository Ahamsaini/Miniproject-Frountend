import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../features/auth/authSlice';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);

    React.useEffect(() => {
        if (isAuthenticated) {
            dispatch(updateUserProfile());
        }
    }, [dispatch, isAuthenticated]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Box className="flex h-[100dvh] overflow-hidden bg-slate-50">
            <Navbar onToggleSidebar={toggleSidebar} />
            <Sidebar open={sidebarOpen} onToggleSidebar={toggleSidebar} />

            <Box
                component="main"
                className="flex-grow overflow-auto pt-20 px-3 pb-24 sm:px-6 lg:px-8 sm:pb-8"
            >
                <Outlet />
            </Box>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </Box>
    );
};


export default MainLayout;
