import React, { useState } from 'react';

export const AccountAvatar = ({
  src = null,
  displayName = '',
  username = '',
  provider = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImageError(false);
  }

  const isSafeHttps = typeof src === 'string' && src.trim().startsWith('https://');

  const getInitials = () => {
    const name = displayName?.trim() || username?.trim() || provider || 'A';
    const parts = name.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getGradient = () => {
    switch (provider?.toUpperCase()) {
      case 'FACEBOOK':
        return 'from-blue-600 to-indigo-600 shadow-blue-500/20';
      case 'INSTAGRAM':
        return 'from-amber-500 via-pink-600 to-purple-600 shadow-pink-500/20';
      case 'WHATSAPP':
        return 'from-emerald-500 to-teal-600 shadow-emerald-500/20';
      default:
        return 'from-slate-600 to-slate-800 shadow-slate-500/20';
    }
  };

  const sizeClasses =
    size === 'lg'
      ? 'w-14 h-14 rounded-2xl text-lg'
      : size === 'sm'
      ? 'w-8 h-8 rounded-lg text-xs'
      : 'w-11 h-11 rounded-xl text-sm';

  if (isSafeHttps && !imageError) {
    return (
      <img
        src={src}
        alt={`${displayName || username || provider} avatar`}
        onError={() => setImageError(true)}
        className={`${sizeClasses} object-cover border border-slate-200 shrink-0 shadow-xs`}
      />
    );
  }

  return (
    <div
      aria-label="Account initials avatar"
      className={`${sizeClasses} bg-gradient-to-tr ${getGradient()} text-white font-bold flex items-center justify-center shrink-0 shadow-md`}
    >
      {getInitials()}
    </div>
  );
};

export default AccountAvatar;
