import React from 'react';
import { Box, Typography } from '@mui/material';
import { MdSchool } from 'react-icons/md';
import universityTheme from '../theme/universityTheme';

const UniversityLogo = ({ size = 'medium', showText = true, variant = 'full' }) => {
    const sizes = {
        small: { icon: 32, text: '1rem' },
        medium: { icon: 48, text: '1.5rem' },
        large: { icon: 64, text: '2rem' },
        xlarge: { icon: 96, text: '2.5rem' },
    };

    const currentSize = sizes[size] || sizes.medium;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
            }}
        >
            {/* Logo Icon - Using graduation cap as placeholder */}
            <Box
                sx={{
                    width: currentSize.icon,
                    height: currentSize.icon,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${universityTheme.colors.primary.main} 0%, ${universityTheme.colors.accent.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: universityTheme.shadows.lg,
                }}
            >
                <MdSchool
                    size={currentSize.icon * 0.6}
                    color={universityTheme.colors.primary.contrast}
                />
            </Box>

            {/* University Name */}
            {showText && (
                <Box sx={{ textAlign: 'center' }}>
                    <Typography
                        sx={{
                            fontFamily: universityTheme.typography.fontFamily.heading,
                            fontWeight: universityTheme.typography.fontWeight.bold,
                            fontSize: currentSize.text,
                            color: universityTheme.colors.primary.main,
                            lineHeight: 1.2,
                        }}
                    >
                        {variant === 'full' ? universityTheme.university.name : 'SU'}
                    </Typography>
                    {variant === 'full' && size !== 'small' && (
                        <Typography
                            sx={{
                                fontFamily: universityTheme.typography.fontFamily.body,
                                fontSize: `calc(${currentSize.text} * 0.4)`,
                                color: universityTheme.colors.neutral.medium,
                                mt: 0.5,
                            }}
                        >
                            {universityTheme.university.location}
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default UniversityLogo;
