import { useContext } from 'react';
import { ThemeContext, type ThemeContextType } from '../../core/context/ThemeContext';

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}
