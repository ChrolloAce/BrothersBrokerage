import { theme } from '../theme';

export const useTheme = () => {
  return theme;
};

export const getThemeColor = (path: string) => {
  const keys = path.split('.');
  let current: any = theme.colors;
  
  for (const key of keys) {
    if (current[key]) {
      current = current[key];
    } else {
      return null;
    }
  }
  
  return current;
};

export const getThemeValue = (path: string) => {
  const keys = path.split('.');
  let current: any = theme;
  
  for (const key of keys) {
    if (current[key]) {
      current = current[key];
    } else {
      return null;
    }
  }
  
  return current;
}; 