export const theme = {
  colors: {
    // 可爱粉橙色彩方案
    primary: '#FF9A8B',      // 可爱珊瑚粉
    secondary: '#FFB3BA',    // 甜美粉色
    accent: '#FFAAA5',       // 温柔桃粉
    background: '#FFF5F5',   // 粉白背景
    surface: '#FFFFFF',      // 纯白
    surfaceHover: '#FFE8E8', // 浅粉白
    text: {
      primary: '#4A2C2A',    // 温暖深棕
      secondary: '#8B5A5A',  // 柔和棕粉
      muted: '#B08080',      // 淡雅粉棕
    },
    border: '#FFD6D6',       // 粉色边框
    shadow: 'rgba(255, 154, 139, 0.2)', // 粉橙阴影
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
    sm: '0 1px 2px 0 rgba(255, 154, 139, 0.08)',
    md: '0 4px 6px -1px rgba(255, 154, 139, 0.15), 0 2px 4px -1px rgba(255, 154, 139, 0.1)',
    lg: '0 10px 15px -3px rgba(255, 154, 139, 0.15), 0 4px 6px -2px rgba(255, 154, 139, 0.08)',
    xl: '0 20px 25px -5px rgba(255, 154, 139, 0.15), 0 10px 10px -5px rgba(255, 154, 139, 0.06)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #FF9A8B 0%, #FFB3BA 100%)',
    secondary: 'linear-gradient(135deg, #FFB3BA 0%, #FFAAA5 100%)',
    background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)',
  },
  
  transitions: {
    instant: '80ms ease-out',
    fast: '120ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms ease-in-out',
  },
};

export type Theme = typeof theme;

// Styled-components v6 theme declaration
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
