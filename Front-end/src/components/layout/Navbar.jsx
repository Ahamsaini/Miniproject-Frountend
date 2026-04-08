import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box,
    Badge,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import { MdNotifications, MdMenu, MdAccountCircle, MdLogout } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        handleClose();
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            className="bg-white text-slate-800 border-b border-slate-200 z-50"
        >
            <Toolbar className="justify-between px-4 sm:px-6">
                <Box className="flex items-center gap-4">
                    <IconButton
                        edge="start"
                        className="text-slate-600 sm:hidden"
                        onClick={onToggleSidebar}
                    >
                        <MdMenu size={24} />
                    </IconButton>
                    <Typography variant="h6" className="font-bold text-primary flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">C</div>
                        <span className="inline sm:inline">Lab Manage</span>
                    </Typography>
                </Box>

                <Box className="flex items-center gap-2">
                    <IconButton className="text-slate-500 hover:bg-slate-50">
                        <Badge badgeContent={4} color="secondary">
                            <MdNotifications size={24} />
                        </Badge>
                    </IconButton>

                    <Tooltip title="Profile">
                        <IconButton onClick={handleMenu} className="p-1 border-2 border-transparent hover:border-slate-100 transition-all">
                            <Avatar
                                className="w-8 h-8 text-sm font-bold bg-primary-light"
                                src={user?.profilePictureUrl}
                            >
                                {user?.firstName?.charAt(0) || <MdAccountCircle />}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            className: "mt-2 shadow-lg border border-slate-100 min-w-[200px]"
                        }}
                    >
                        <Box className="px-4 py-2 border-b border-slate-50">
                            <Typography variant="subtitle2" className="font-bold truncate">
                                {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                            </Typography>
                            <Typography variant="caption" className="text-slate-500 italic uppercase">
                                {user?.role}
                            </Typography>
                        </Box>
                        <MenuItem onClick={() => { navigate('/profile'); handleClose(); }} className="py-2 text-sm gap-3">
                            <MdAccountCircle size={18} className="text-slate-400" /> My Profile
                        </MenuItem>

                        <MenuItem onClick={handleLogout} className="py-2 text-sm gap-3 text-red-500">
                            <MdLogout size={18} /> Sign Out
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
