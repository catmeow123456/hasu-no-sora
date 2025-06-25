export const theme = {
  colors: {
    // 温暖阳光的色彩方案
    primary: '#FF8C42',      // 暖橙色
    secondary: '#FFD23F',    // 金黄色
    accent: '#FF6B9D',       // 柔和粉色
    background: '#FFF8F0',   // 奶油白
    surface: '#FFFFFF',      // 纯白
    surfaceHover: '#FFF4E6', // 浅橙白
    text: {
      primary: '#2D1810',    // 深棕色
      secondary: '#8B4513',  // 中棕色
      muted: '#A0522D',      // 浅棕色
    },
    border: '#FFE4CC',       // 浅橙边框
    shadow: 'rgba(255, 140, 66, 0.15)', // 暖橙阴影
  },
  
  fonts: {
    primary: '"Inter", "Noto Sans SC", sans-serif',
    heading: '"Poppins", "Noto Sans SC", sans-serif',
  },
  
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(255, 140, 66, 0.05)',
    md: '0 4px 6px -1px rgba(255, 140, 66, 0.1), 0 2px 4px -1px rgba(255, 140, 66, 0.06)',
    lg: '0 10px 15px -3px rgba(255, 140, 66, 0.1), 0 4px 6px -2px rgba(255, 140, 66, 0.05)',
    xl: '0 20px 25px -5px rgba(255, 140, 66, 0.1), 0 10px 10px -5px rgba(255, 140, 66, 0.04)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #FF8C42 0%, #FFD23F 100%)',
    secondary: 'linear-gradient(135deg, #FFD23F 0%, #FF6B9D 100%)',
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%)',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
};

export type Theme = typeof theme;
