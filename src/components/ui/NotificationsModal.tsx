'use client';

import { ReactNode } from 'react';
import { Icon } from '../ui/icon';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
  onMarkAsRead?: () => void;
  onViewAll?: () => void;
  children?: ReactNode;
}

export function NotificationsModal({
  isOpen,
  onClose,
  unreadCount = 0,
  onMarkAsRead,
  onViewAll,
  children,
}: Readonly<NotificationsModalProps>) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-[120%] right-14 w-[380px] bg-white rounded-2xl shadow-[0_16px_32px_rgba(42,52,57,0.08)] border border-slate-200 z-50 overflow-hidden transform opacity-100 translate-y-0 transition-all duration-300 origin-top-right">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-on-surface text-lg">Notificações</h3>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
              </span>
            )}
          </div>
          {onMarkAsRead && (
            <button
              onClick={onMarkAsRead}
              className="text-xs text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              Marcar como lidas
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
          {children ? (
            children
          ) : (
            <div className="px-5 py-12 text-center">
              <Icon name="notifications" className="text-4xl text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Nenhuma notificação</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          {onViewAll ? (
            <button
              onClick={onViewAll}
              className="w-full py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              Ver todas as notificações
            </button>
          ) : (
            <div className="py-2.5 text-sm text-slate-500 text-center">
              Sem mais ações
            </div>
          )}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
