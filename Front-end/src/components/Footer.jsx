import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import universityTheme from '../theme/universityTheme';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <>
            {/* Developer Credit - Hidden in HTML comment */}
            {/* Crafted with ❤️ by Aham Saini */}

            <Box
                component="footer"
                sx={{
                    bgcolor: universityTheme.colors.primary.main,
                    color: universityTheme.colors.primary.contrast,
                    py: 4,
                    mt: 'auto',
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        {/* University Info */}
                        <Grid item xs={12} md={4}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                    fontWeight: universityTheme.typography.fontWeight.bold,
                                    mb: 2,
                                }}
                            >
                                {universityTheme.university.name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                                {universityTheme.university.tagline}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, opacity: 0.8 }}>
                                <MdLocationOn size={16} />
                                <Typography variant="caption">
                                    {universityTheme.university.location}, Uttar Pradesh, India
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Quick Links */}
                        <Grid item xs={12} md={4}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                    fontWeight: universityTheme.typography.fontWeight.semibold,
                                    mb: 2,
                                }}
                            >
                                Quick Links
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8, fontSize: '0.875rem' }}>
                                    About Us
                                </Link>
                                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8, fontSize: '0.875rem' }}>
                                    Privacy Policy
                                </Link>
                                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8, fontSize: '0.875rem' }}>
                                    Terms of Service
                                </Link>
                                <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.8, fontSize: '0.875rem' }}>
                                    Contact Support
                                </Link>
                            </Box>
                        </Grid>

                        {/* Contact Info */}
                        <Grid item xs={12} md={4}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: universityTheme.typography.fontFamily.heading,
                                    fontWeight: universityTheme.typography.fontWeight.semibold,
                                    mb: 2,
                                }}
                            >
                                Contact Us
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                                    <MdEmail size={16} />
                                    <Typography variant="caption">info@shobhituniversity.ac.in</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                                    <MdPhone size={16} />
                                    <Typography variant="caption">+91-XXXX-XXXXXX</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Copyright */}
                    <Box
                        sx={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            mt: 4,
                            pt: 3,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            © {currentYear} {universityTheme.university.fullName}. All rights reserved.
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.3,
                                fontSize: '0.65rem',
                                fontFamily: universityTheme.typography.fontFamily.mono,
                            }}
                            title="Developer"
                        >
                            <a href="https://www.linkedin.com/in/aham-saini-1590a9315">Dev: AS</a>
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Console Developer Credit */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `console.log('%c🎓 Shobhit University Lab Management System', 'font-size: 16px; font-weight: bold; color: #1e3a8a;'); console.log('%c✨ Crafted with care by Aham Saini', 'font-size: 12px; color: #0d9488;');`,
                }}
            />
        </>
    );
};

export default Footer;
