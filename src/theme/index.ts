export const theme = {
  colors: {
    primary: {
      50: '#F0F4FF',
      100: '#E0E7FF',
      500: '#667EEA',
      600: '#5A67D8',
      700: '#4C51BF',
      800: '#434190',
      900: '#3C366B'
    },
    secondary: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A'
    },
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D'
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F'
    },
    danger: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D'
    },
    sidebar: {
      bg: '#1E293B',
      bgHover: '#334155',
      bgActive: '#667EEA',
      text: '#94A3B8',
      textActive: '#FFFFFF',
      textHover: '#CBD5E1',
      border: '#334155'
    },
    chart: {
      primary: '#667EEA',
      secondary: '#F59E0B',
      success: '#22C55E',
      danger: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      purple: '#8B5CF6',
      pink: '#EC4899'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  components: {
    card: {
      base: 'bg-white rounded-xl shadow-sm border border-gray-100',
      padding: 'p-6',
      hover: 'hover:shadow-md transition-shadow duration-200'
    },
    button: {
      primary: 'bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200',
      secondary: 'bg-secondary-100 text-secondary-700 px-4 py-2 rounded-lg hover:bg-secondary-200 transition-colors duration-200',
      danger: 'bg-danger-500 text-white px-4 py-2 rounded-lg hover:bg-danger-600 transition-colors duration-200'
    },
    input: {
      base: 'border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
    }
  },
  broker: {
    workflow: {
      leadIntake: '#3B82F6',
      clientOnboarding: '#10B981',
      budgetProcessing: '#F59E0B',
      documentManagement: '#8B5CF6',
      billingAutomation: '#EF4444'
    },
    status: {
      active: '#22C55E',
      pending: '#F59E0B',
      completed: '#3B82F6',
      overdue: '#EF4444',
      cancelled: '#6B7280'
    }
  }
} as const;

export type ThemeType = typeof theme; 