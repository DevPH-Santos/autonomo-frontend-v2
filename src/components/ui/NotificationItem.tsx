'use client';

import { ReactNode } from 'react';
import { Icon, type IconName } from './icon';

interface NotificationItemProps {
  icon: IconName;
  iconBgColor?: string;
  iconColor?: string;
  title: ReactNode;
  description: string;
  timestamp: string;
  isUnread?: boolean;
  onClick?: () => void;
}

export function NotificationItem({
  icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  title,
  description,
  timestamp,
  isUnread = false,
  onClick,
}: Readonly<NotificationItemProps>) {
  return (
    <div
      onClick={onClick}
      className={`px-5 py-4 flex gap-4 hover:bg-slate-100 transition-colors duration-200 cursor-pointer relative group ${
        isUnread ? '' : 'opacity-75 hover:opacity-100'
      }`}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-600 group-hover:h-8 transition-all duration-300 rounded-r-md" />
      )}

      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0`}
      >
        <Icon name={icon} className="text-[20px]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 font-medium pr-6 leading-tight mb-1">
          {title}
        </p>
        <p className="text-xs text-slate-500">{description}</p>
        <p className="text-xs text-slate-400 mt-1">{timestamp}</p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-2" />
      )}
    </div>
  );
}