import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Avatar,
    Grid,
    Divider,
    Button,
    Stack,
    Chip,
    IconButton,
    Card,
    CardContent
} from '@mui/material';
import {
    MdEmail,
    MdPhone,
    MdBadge,
    MdSchool,
    MdSecurity,
    MdEdit,
    MdFingerprint,
    MdLocationCity,
    MdCalendarToday
} from 'react-icons/md';
import { useSelector } from 'react-redux';
import { universityTheme } from '../theme/universityTheme';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);

    const InfoRow = ({ icon, label, value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 2.5 }}>
            <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: universityTheme.borderRadius.lg, 
                bgcolor: universityTheme.colors.neutral.gray[50], 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: universityTheme.colors.primary.main,
                flexShrink: 0,
                border: `1px solid ${universityTheme.colors.neutral.gray[100]}`
            }}>
                {icon}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" sx={{ 
                    color: universityTheme.colors.neutral.gray[400], 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontSize: '0.65rem',
                    mb: 0.5,
                    display: 'block'
                }}>
                    {label}
                </Typography>
                <Typography variant="body1" sx={{ 
                    color: universityTheme.colors.neutral.gray[800], 
                    fontWeight: 700,
                    fontSize: '0.95rem'
                }}>
                    {value || 'Not provided'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ 
            maxWidth: '1000px', 
            mx: 'auto', 
            pb: 6, 
            px: { xs: 2, md: 0 },
            pt: { xs: 2, md: 4 }
        }}>
            {/* Header / Cover Area */}
            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: universityTheme.borderRadius.xl,
                    border: `1px solid ${universityTheme.colors.neutral.gray[200]}`,
                    bgcolor: '#fff',
                    mb: 4,
                    boxShadow: universityTheme.shadows.md
                }}
            >
                <Box sx={{ 
                    h: { xs: '120px', md: '180px' }, 
                    background: `linear-gradient(135deg, ${universityTheme.colors.primary.dark} 0%, ${universityTheme.colors.primary.main} 100%)`,
                    position: 'relative'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: '40%',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 100%)'
                    }} />
                </Box>
                <Box sx={{ 
                    px: { xs: 3, md: 6 }, 
                    pb: 6, 
                    pt: 0, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    alignItems: { xs: 'flex-start', sm: 'flex-end' }, 
                    gap: 4, 
                    mt: { xs: '-50px', md: '-70px' } 
                }}>
                    <Avatar
                        src={user?.profilePictureUrl}
                        sx={{
                            width: { xs: 100, sm: 160 },
                            height: { xs: 100, sm: 160 },
                            border: '8px solid white',
                            boxShadow: universityTheme.shadows.lg,
                            bgcolor: universityTheme.colors.primary.main,
                            fontSize: '4rem',
                            fontWeight: 900
                        }}
                    >
                        {user?.firstName?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, pt: { xs: 0, sm: 8 } }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
                            <Box>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], mb: 0.5, letterSpacing: '-0.03em' }}>
                                    {user?.firstName} {user?.lastName}
                                </Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Chip
                                        label={user?.role}
                                        size="small"
                                        sx={{
                                            bgcolor: universityTheme.colors.primary.main,
                                            color: '#fff',
                                            borderRadius: universityTheme.borderRadius.md,
                                            fontWeight: 900,
                                            fontSize: '0.7rem',
                                            px: 1,
                                            height: 24
                                        }}
                                    />
                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: universityTheme.colors.neutral.gray[300] }} />
                                    <Typography variant="body2" sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 700 }}>
                                        Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
                                    </Typography>
                                </Stack>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<MdEdit />}
                                sx={{
                                    borderRadius: universityTheme.borderRadius.lg,
                                    border: `2.2px solid ${universityTheme.colors.neutral.gray[200]}`,
                                    color: universityTheme.colors.neutral.gray[700],
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    px: 4,
                                    py: 1.2,
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        border: `2.2px solid ${universityTheme.colors.primary.main}`,
                                        bgcolor: 'rgba(0,0,0,0.02)',
                                        color: universityTheme.colors.primary.main
                                    }
                                }}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={4}>
                {/* Left Column: Essential Info */}
                <Grid item xs={12} md={7}>
                    <Card elevation={0} sx={{ 
                        borderRadius: universityTheme.borderRadius.xl, 
                        border: `1px solid ${universityTheme.colors.neutral.gray[200]}`, 
                        boxShadow: universityTheme.shadows.sm,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ 
                            px: 4, 
                            py: 3, 
                            bgcolor: universityTheme.colors.neutral.gray[50], 
                            borderBottom: `1px solid ${universityTheme.colors.neutral.gray[100]}`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between' 
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], fontSize: '1.1rem' }}>
                                Personal Dossier
                            </Typography>
                            <MdBadge size={22} color={universityTheme.colors.neutral.gray[400]} />
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Stack divider={<Divider sx={{ opacity: 0.6 }} />}>
                                <InfoRow icon={<MdEmail />} label="Academic Email" value={user?.email} />
                                <InfoRow icon={<MdPhone />} label="Verified Contact" value={user?.phone} />
                                <InfoRow icon={<MdLocationCity />} label="Faculty/Dept" value={user?.department} />
                                {user?.role === 'STUDENT' && (
                                    <>
                                        <InfoRow icon={<MdFingerprint />} label="University Roll No" value={user?.rollNumber} />
                                        <InfoRow icon={<MdCalendarToday />} label="Enrolled Semester" value={`Semester ${user?.semester}`} />
                                    </>
                                )}
                                {user?.role === 'TEACHER' && (
                                    <InfoRow icon={<MdFingerprint />} label="Faculty ID" value={user?.employeeId} />
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column: Account Status & Governance */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={4}>
                        <Card elevation={0} sx={{ 
                            borderRadius: universityTheme.borderRadius.xl, 
                            border: `1px solid ${universityTheme.colors.neutral.gray[200]}`, 
                            boxShadow: universityTheme.shadows.sm,
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ 
                                px: 4, 
                                py: 3, 
                                bgcolor: universityTheme.colors.neutral.gray[50], 
                                borderBottom: `1px solid ${universityTheme.colors.neutral.gray[100]}`, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between' 
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: universityTheme.colors.neutral.gray[900], fontSize: '1.1rem' }}>
                                    Governance
                                </Typography>
                                <MdSecurity size={22} color={universityTheme.colors.neutral.gray[400]} />
                            </Box>
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={3.5}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Security Status</Typography>
                                        <Chip
                                            label="SECURE"
                                            size="small"
                                            sx={{
                                                bgcolor: `${universityTheme.colors.success}15`,
                                                color: universityTheme.colors.success,
                                                fontWeight: 900,
                                                borderRadius: '8px',
                                                fontSize: '0.65rem'
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ color: universityTheme.colors.neutral.gray[500], fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Verified Profile</Typography>
                                        <Typography sx={{ color: universityTheme.colors.primary.main, fontWeight: 900, fontSize: '0.75rem' }}>CERTIFIED</Typography>
                                    </Box>
                                    <Divider />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        sx={{
                                            bgcolor: universityTheme.colors.neutral.gray[900],
                                            borderRadius: universityTheme.borderRadius.lg,
                                            py: 1.8,
                                            fontWeight: 900,
                                            fontSize: '0.9rem',
                                            textTransform: 'none',
                                            display: 'flex',
                                            gap: 2,
                                            '&:hover': { bgcolor: '#000' }
                                        }}
                                    >
                                        <MdSecurity size={20} />
                                        Advanced Security
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card elevation={0} sx={{ 
                            borderRadius: universityTheme.borderRadius.xl, 
                            border: `1px solid ${universityTheme.colors.primary.main}20`, 
                            bgcolor: `${universityTheme.colors.primary.main}05`,
                            overflow: 'hidden'
                        }}>
                            <CardContent sx={{ p: 5, textAlign: 'center' }}>
                                <Avatar sx={{ 
                                    mx: 'auto', 
                                    mb: 3, 
                                    bg: '#fff', 
                                    color: universityTheme.colors.primary.main, 
                                    shadows: universityTheme.shadows.sm,
                                    width: 64,
                                    height: 64,
                                    border: `1px solid ${universityTheme.colors.primary.main}20`
                                }}>
                                    <MdSchool size={36} />
                                </Avatar>
                                <Typography variant="h5" sx={{ color: universityTheme.colors.primary.main, fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
                                    {universityTheme.university.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: universityTheme.colors.neutral.gray[400], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px' }}>
                                    Main Campus
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 3, color: universityTheme.colors.neutral.gray[600], fontWeight: 600, fontStyle: 'italic', opacity: 0.8 }}>
                                    "Excellence in Research & Knowledge"
                                </Typography>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
