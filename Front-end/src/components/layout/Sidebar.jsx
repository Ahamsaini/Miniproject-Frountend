import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Drawer,
    Typography,
    Divider,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    MdDashboard,
    MdSchool,
    MdComputer,
    MdScience,
    MdHistory,
    MdPeople,
    MdLibraryBooks,
    MdEventNote,
    MdSettings,
    MdLogout,
    MdAssessment,
    MdAccountCircle
} from 'react-icons/md';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const Sidebar = ({ open, onToggleSidebar }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <MdDashboard size={22} />, path: '/', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
        { text: 'Courses', icon: <MdSchool size={22} />, path: '/courses', roles: ['ADMIN'] }, // Removed TEACHER
        { text: 'Lab Sessions', icon: <MdComputer size={22} />, path: '/labs', roles: ['ADMIN'] }, // Removed TEACHER (Lab Creating/Management)
        { text: 'My Labs', icon: <MdScience size={22} />, path: '/teacher/my-labs', roles: ['TEACHER'] }, // New for Teacher
        { text: 'All Labs', icon: <MdComputer size={22} />, path: '/teacher/all-labs', roles: ['TEACHER'] }, // New for Teacher
        {
            text: user?.role === 'STUDENT' ? 'My Records' : (user?.role === 'TEACHER' ? 'Session History' : 'Lab History'),
            icon: <MdHistory size={22} />,
            path: user?.role === 'STUDENT' ? '/my-history' : (user?.role === 'TEACHER' ? '/teacher/history' : '/labs/history'),
            roles: ['ADMIN', 'TEACHER', 'STUDENT']
        },
        { text: 'Students', icon: <MdPeople size={22} />, path: '/students', roles: ['ADMIN', 'TEACHER'] },
        { text: 'Teachers', icon: <MdPeople size={22} />, path: '/teachers', roles: ['ADMIN'] },
        { text: 'Pending Approvals', icon: <MdPeople size={22} />, path: '/onboarding', roles: ['ADMIN'] },
        { text: 'Curriculum', icon: <MdLibraryBooks size={22} />, path: '/curriculum', roles: ['ADMIN', 'TEACHER'] },
        { text: 'Session Reports', icon: <MdEventNote size={22} />, path: '/attendance', roles: ['ADMIN', 'TEACHER'] },
        { text: 'Subject Audit', icon: <MdAssessment size={22} />, path: '/attendance/subject', roles: ['ADMIN', 'TEACHER'] },
        { text: 'My Profile', icon: <MdAccountCircle size={22} />, path: '/profile', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    ];


    // Filter items based on role
    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    const drawerContent = (
        <Box className="flex flex-col h-full bg-white border-r border-slate-200">
            <Box className="h-16 sm:h-20" /> {/* Spacer for Navbar */}

            <Box className="px-4 py-4">
                <Typography variant="overline" className="text-slate-400 font-bold px-4">
                    General
                </Typography>
                <List className="mt-2 space-y-1">
                    {filteredItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={NavLink}
                                to={item.path}
                                onClick={isMobile ? onToggleSidebar : undefined}
                                className={({ isActive }) =>
                                    `rounded-xl mx-2 py-3 px-4 transition-all ${isActive
                                        ? 'bg-blue-50 text-primary font-bold shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`
                                }
                            >
                                <ListItemIcon className="min-w-[40px] text-inherit">
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{ className: 'text-sm font-medium' }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Divider className="mx-6 my-2 opacity-50" />

            <Box className="px-4 py-4 mt-auto">
                <List>
                    <ListItem disablePadding>
                        <ListItemButton className="rounded-xl mx-2 text-slate-600 hover:bg-slate-50">
                            <ListItemIcon className="min-w-[40px] text-inherit">
                                <MdSettings size={22} />
                            </ListItemIcon>
                            <ListItemText primary="Settings" primaryTypographyProps={{ className: 'text-sm font-medium' }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={handleLogout}
                            className="rounded-xl mx-2 text-rose-600 hover:bg-rose-50 mt-1"
                        >
                            <ListItemIcon className="min-w-[40px] text-inherit">
                                <MdLogout size={22} />
                            </ListItemIcon>
                            <ListItemText primary="Logout" primaryTypographyProps={{ className: 'text-sm font-bold' }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { sm: 260 }, flexShrink: { sm: 0 } }}>
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={open}
                onClose={onToggleSidebar}
                ModalProps={{ keepMounted: true }}
                classes={{
                    paper: `w-[260px] border-none shadow-none`
                }}
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
