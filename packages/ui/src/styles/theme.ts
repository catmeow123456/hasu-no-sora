export const theme = {
  colors: {
    // 明亮清新的暖色调方案
    primary: '#FF7A59',      // 明亮珊瑚橙
    secondary: '#FFB347',    // 温暖金橙
    accent: '#FF9F7A',       // 柔和桃橙
    background: '#FFFBF8',   // 温暖象牙白
    surface: '#FFFFFF',      // 纯白
    surfaceHover: '#FFF4F0', // 极浅暖白
    text: {
      primary: '#2D1B1A',    // 深暖棕
      secondary: '#6B4A47',  // 中暖棕
      muted: '#9A7B78',      // 浅暖棕
    },
    border: '#FFE4D6',       // 暖橙边框
    shadow: 'rgba(255, 122, 89, 0.25)', // 明亮橙色阴影
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
    sm: '0 1px 2px 0 rgba(255, 122, 89, 0.12)',
    md: '0 4px 6px -1px rgba(255, 122, 89, 0.20), 0 2px 4px -1px rgba(255, 122, 89, 0.15)',
    lg: '0 10px 15px -3px rgba(255, 122, 89, 0.20), 0 4px 6px -2px rgba(255, 122, 89, 0.12)',
    xl: '0 20px 25px -5px rgba(255, 122, 89, 0.20), 0 10px 10px -5px rgba(255, 122, 89, 0.10)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #FF7A59 0%, #FFB347 100%)',
    secondary: 'linear-gradient(135deg, #FFB347 0%, #FF9F7A 100%)',
    background: 'linear-gradient(135deg, #FFFBF8 0%, #FFFFFF 100%)',
  },
  
  transitions: {
    instant: '80ms ease-out',
    fast: '120ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms ease-in-out',
  },
  
  // 歌手印象色配置（基于官方设定）
  singers: {
    kaho: {
      name: '日野下花帆',
      primary: '#f8b500',    // 太阳色
      secondary: '#fcc332',  // 稍浅的太阳色
      background: '#fff8e7'  // 温暖背景
    },
    sayaka: {
      name: '村野沙耶香', 
      primary: '#5383c3',    // 冰蓝色
      secondary: '#7ba0d0',  // 稍浅的冰蓝
      background: '#f0f6ff'  // 冰蓝背景
    },
    kozue: {
      name: '乙宗梢',
      primary: '#68be8d',    // 人鱼绿色
      secondary: '#8ccfa8',  // 稍浅的人鱼绿
      background: '#f0fff5'  // 绿色背景
    },
    tsuzuri: {
      name: '夕雾缀理',
      primary: '#ba2636',    // 我的红色
      secondary: '#d04a5a',  // 稍浅的红色
      background: '#fff0f2'  // 红色背景
    },
    rurino: {
      name: '大泽瑠璃乃',
      primary: '#e7609e',    // 瑠璃粉色
      secondary: '#ed82b5',  // 稍浅的粉色
      background: '#fff5fb'  // 粉色背景
    },
    megumi: {
      name: '藤岛慈',
      primary: '#c8c2c6',    // 天使白色
      secondary: '#d5d0d3',  // 稍浅的白色
      background: '#fafafa'  // 白色背景
    },
    ginko: {
      name: '百生吟子',
      primary: '#a2d7dd',    // 天之原色
      secondary: '#b8e2e6',  // 稍浅的天之原色
      background: '#f5feff'  // 天色背景
    },
    kosuzu: {
      name: '徒町小铃',
      primary: '#fad764',    // 长庚星色
      secondary: '#fce085',  // 稍浅的星色
      background: '#fffcf0'  // 星色背景
    },
    himena: {
      name: '安养寺姬芽',
      primary: '#9d8de2',    // 糖果紫色
      secondary: '#b5a8e8',  // 稍浅的紫色
      background: '#f8f6ff'  // 紫色背景
    },
    // 小组配色
    cerise: {
      name: 'Cerise Bouquet',
      primary: '#da645f',     // 玫瑰色
      secondary: '#e8857f',   // 稍浅的玫瑰色  
      background: '#fdf5f4'   // 温暖的玫瑰背景
    },
    dollche: {
      name: 'DOLLCHESTRA', 
      primary: '#163bca',     // 蓝色
      secondary: '#4a6bd4',   // 稍浅的蓝色
      background: '#f0f4ff'   // 清爽的蓝色背景
    },
    miracra: {
      name: 'Mira-Cra Park!',
      primary: '#F3B171',     // 黄色
      secondary: '#f6c48a',   // 稍浅的黄色
      background: '#fffbf0'   // 温暖的黄色背景
    },
    // 整体项目主题色
    hasunosora: {
      name: 'Hasu no Sora',
      primary: '#FB8A9B',     // Hasu no Sora 主题粉色
      secondary: '#fca5b3',   // 稍浅的主题粉色
      background: '#fff8f9'   // 温暖的粉色背景
    }
  },
};

export type Theme = typeof theme;

// 歌手颜色获取工具函数
export const getSingerColor = (singer?: string, fallbackColor: string = theme.colors.text.primary): string => {
  if (!singer) return fallbackColor;
  
  const singerConfig = theme.singers[singer as keyof typeof theme.singers];
  return singerConfig ? singerConfig.primary : fallbackColor;
};

// 根据当前状态获取歌手颜色（增强版本）
export const getSingerColorForState = (
  singer?: string, 
  isCurrent: boolean = false, 
  fallbackColor?: string
): string => {
  if (!singer) {
    // 无歌手标记的文本使用主题颜色
    return isCurrent ? theme.colors.text.primary : theme.colors.text.secondary;
  }
  
  const singerConfig = theme.singers[singer as keyof typeof theme.singers];
  if (!singerConfig) {
    return fallbackColor || (isCurrent ? theme.colors.text.primary : theme.colors.text.secondary);
  }
  
  // 当前行：使用饱和度更高的主色调
  // 非当前行：使用透明度降低的主色调
  return isCurrent 
    ? singerConfig.primary 
    : `${singerConfig.primary}CC`; // 添加透明度
};

// 获取歌手背景色
export const getSingerBackground = (singer?: string, fallbackColor: string = 'transparent'): string => {
  if (!singer) return fallbackColor;
  
  const singerConfig = theme.singers[singer as keyof typeof theme.singers];
  return singerConfig ? singerConfig.background : fallbackColor;
};

// 获取歌手名称
export const getSingerName = (singer?: string): string => {
  if (!singer) return '';
  
  const singerConfig = theme.singers[singer as keyof typeof theme.singers];
  return singerConfig ? singerConfig.name : singer;
};

// 创建多歌手彩虹渐变
export const createRainbowGradient = (singers: string[]): string => {
  if (!singers || singers.length === 0) {
    return theme.colors.text.primary;
  }
  
  if (singers.length === 1) {
    return getSingerColor(singers[0]);
  }
  
  const colors = singers.map(singer => getSingerColor(singer, theme.colors.text.primary));
  
  // 确保至少有两种颜色用于渐变
  if (colors.length < 2) {
    return colors[0] || theme.colors.text.primary;
  }
  
  // 创建线性渐变，从左到右平滑过渡
  return `linear-gradient(90deg, ${colors.join(', ')})`;
};

// 获取多歌手组合的显示名称
export const getRainbowSingerNames = (singers: string[]): string => {
  if (!singers || singers.length === 0) return '';
  
  const names = singers.map(singer => getSingerName(singer) || singer);
  
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(' & ');
  
  // 多于两个歌手时，用逗号分隔，最后一个用 & 连接
  const lastSinger = names.pop();
  return `${names.join(', ')} & ${lastSinger}`;
};

// Styled-components v6 theme declaration
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
