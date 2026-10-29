export const colors = {
  // Paleta inspirada no verde oficial do WhatsApp
  primary: '#128C7E', // teal do WhatsApp — texto, ícones e bordas (bom contraste)
  primaryBright: '#25D366', // verde vívido do WhatsApp — ponta de gradientes e CTAs
  primaryDark: '#075E54', // teal escuro do WhatsApp — início de gradientes e superfícies escuras
  secondary: '#25D366',
  accent: '#F7931E',

  // Gradientes padronizados
  gradients: {
    // Verde sólido real do WhatsApp (os botões do app original não usam degradê)
    primary: '#25D366',
    primaryText:
      'bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] bg-clip-text text-transparent',
    dark: 'linear-gradient(135deg, #054C40 0%, #075E54 100%)',
    flame: 'linear-gradient(to bottom, #FF6B35 0%, #FF8E53 50%, #F7931E 100%)',
    progress: {
      completed: 'bg-gradient-to-r from-blue-400 to-blue-600',
      current: 'bg-gradient-to-r from-orange-400 to-red-500',
    }
  },

  // Estados
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    600: '#4B5563',
    700: '#374151',
    900: '#111827'
  },
  
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const;

export const animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
    extraSlow: 1000,
  },
  easing: {
    easeOut: [0.25, 0.46, 0.45, 0.94],
    easeOutQuart: [0.25, 1, 0.5, 1],
    easeOutBack: [0.34, 1.56, 0.64, 1],
  }
} as const;

export const glassmorphism = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
} as const; 