import React, { useState } from 'react';
import { Globe, AtSign } from 'lucide-react';

interface Props {
  name: string;
  logoUrl?: string;
  socialUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LogoAvatar: React.FC<Props> = ({
  name,
  logoUrl,
  socialUrl,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-11 h-11 text-sm rounded-xl',
    lg: 'w-14 h-14 text-base rounded-2xl',
    xl: 'w-20 h-20 text-xl rounded-2xl',
  }[size];

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'CO';

  const getSocialBadge = () => {
    if (!socialUrl) return null;
    const lower = socialUrl.toLowerCase();
    if (lower.includes('instagram') || lower.startsWith('@')) {
      return <AtSign className="w-2.5 h-2.5 text-pink-500" />;
    }
    return <Globe className="w-2.5 h-2.5 text-emerald-500" />;
  };

  const hasValidLogo = logoUrl && !imgError && logoUrl.trim() !== '';

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`${sizeClasses} overflow-hidden font-bold flex items-center justify-center select-none shadow-sm transition-transform duration-200 ${
          hasValidLogo
            ? 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
            : 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-indigo-500/20'
        } ${className}`}
      >
        {hasValidLogo ? (
          <img
            src={logoUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="tracking-wider">{initials}</span>
        )}
      </div>

      {socialUrl && size !== 'sm' && (
        <a
          href={socialUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          title={`Abrir perfil: ${socialUrl}`}
        >
          {getSocialBadge()}
        </a>
      )}
    </div>
  );
};
