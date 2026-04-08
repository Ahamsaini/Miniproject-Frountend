// Shobhit University Theme Configuration
export const universityTheme = {
    colors: {
        // Primary - Deep Blue (Trust & Professionalism)
        primary: {
            main: '#1e3a8a',
            light: '#3b82f6',
            dark: '#1e40af',
            contrast: '#ffffff',
        },
        // Secondary - Gold (Excellence)
        secondary: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
            contrast: '#1f2937',
        },
        // Accent - Teal (Interactive)
        accent: {
            main: '#0d9488',
            light: '#14b8a6',
            dark: '#0f766e',
            contrast: '#ffffff',
        },
        // Neutrals
        neutral: {
            dark: '#1f2937',
            medium: '#6b7280',
            light: '#f3f4f6',
            white: '#ffffff',
            background: '#f9fafb',
            gray: {
                50: '#f9fafb',
                100: '#f3f4f6',
                200: '#e5e7eb',
                300: '#d1d5db',
                400: '#9ca3af',
                500: '#6b7280',
                600: '#4b5563',
                700: '#374151',
                800: '#1f2937',
                900: '#111827',
            }
        },
        // Status
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        // Background
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
    },

    typography: {
        fontFamily: {
            heading: "'Poppins', sans-serif",
            body: "'Inter', sans-serif",
            mono: "'JetBrains Mono', monospace",
        },
        fontSize: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem',// 30px
            '4xl': '2.25rem', // 36px
            '5xl': '3rem',    // 48px
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },

    spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
    },

    borderRadius: {
        sm: '0.25rem',   // 4px
        md: '0.5rem',    // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        '2xl': '1.5rem', // 24px
        full: '9999px',
    },

    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },

    university: {
        name: 'Shobhit University',
        location: 'Gangoh',
        tagline: 'Excellence in Education & Research',
        fullName: 'Shobhit University, Gangoh',
    },
};

export default universityTheme;
