import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<Props> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer ${
        isDark
          ? 'bg-slate-900 border-slate-700/80 text-amber-300 hover:bg-slate-800 hover:text-amber-200 hover:border-slate-600 shadow-sm'
          : 'bg-white border-slate-200 text-indigo-700 hover:bg-slate-100 hover:border-slate-300 shadow-sm'
      } ${className}`}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in duration-200" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 animate-in fade-in zoom-in duration-200" />
        )}
      </div>
      {showLabel && (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </span>
      )}
    </button>
  );
};
