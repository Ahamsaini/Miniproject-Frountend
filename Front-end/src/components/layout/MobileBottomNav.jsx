import React from 'react';
import {
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    Box
} from '@mui/material';
import {
    MdDashboard,
    MdEventNote,
    MdAccountCircle,
    MdHistory
} from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { universityTheme } from '../../theme/universityTheme';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const getActionValue = () => {
        const path = location.pathname;
        if (path === '/' || path === '/dashboard') return 0;
        if (path.includes('timetable') || path.includes('attendance')) return 1;
        if (path.includes('history')) return 2;
        if (path.includes('profile')) return 3;
        return 0;
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: { xs: 'block', sm: 'none' },
                zIndex: 1000,
                borderTop: `1px solid ${universityTheme.colors.neutral.light}`,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
            }}
            elevation={0}
        >
            <BottomNavigation
                showLabels
                value={getActionValue()}
                sx={{
                    height: 64,
                    '& .MuiBottomNavigationAction-root': {
                        color: universityTheme.colors.neutral.medium,
                        '&.Mui-selected': {
                            color: universityTheme.colors.primary.main,
                        },
                    }
                }}
            >
                <BottomNavigationAction
                    label="Home"
                    icon={<MdDashboard size={24} />}
                    onClick={() => navigate('/')}
                />
                <BottomNavigationAction
                    label="Schedule"
                    icon={<MdEventNote size={24} />}
                    onClick={() => {
                        if (user?.role === 'STUDENT') navigate('/student/timetable');
                        else if (user?.role === 'TEACHER') navigate('/attendance');
                        else navigate('/onboarding');
                    }}
                />
                <BottomNavigationAction
                    label="History"
                    icon={<MdHistory size={24} />}
                    onClick={() => {
                        if (user?.role === 'STUDENT') navigate('/my-history');
                        else if (user?.role === 'TEACHER') navigate('/teacher/history');
                        else navigate('/labs/history');
                    }}
                />
                <BottomNavigationAction
                    label="Profile"
                    icon={<MdAccountCircle size={24} />}
                    onClick={() => navigate('/profile')}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default MobileBottomNav;
