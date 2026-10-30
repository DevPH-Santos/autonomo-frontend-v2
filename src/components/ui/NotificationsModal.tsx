'use client';

import { ReactNode } from 'react';
import { Icon } from '../ui/icon';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
  onMarkAsRead?: () => void;
  isMarkingAsRead?: boolean;
  onViewAll?: () => void;
  children?: ReactNode;
}

export function NotificationsModal({
  isOpen,
  onClose,
  unreadCount = 0,
  onMarkAsRead,
  isMarkingAsRead = false,
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
      <div className="fixed top-[4.75rem] right-3 z-50 flex max-h-[calc(100dvh-5.5rem)] w-[calc(100vw-1.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_32px_rgba(42,52,57,0.08)] transition-all duration-300 sm:right-4 lg:right-8">
        {/* Header */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h3 className="font-semibold text-on-surface text-lg">Notificações</h3>
            {unreadCount > 0 && (
              <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
                {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
              </span>
            )}
          </div>
          {onMarkAsRead && unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAsRead}
              disabled={isMarkingAsRead}
              className="min-h-9 w-full rounded-lg px-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0 sm:w-auto sm:text-right"
            >
              {isMarkingAsRead ? 'Marcando...' : 'Marcar todas como lidas'}
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
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
        <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-3">
          {onViewAll ? (
            <button
              onClick={onViewAll}
              className="min-h-11 w-full rounded-lg py-2.5 text-sm font-medium text-blue-600 transition-colors duration-200 hover:bg-blue-50"
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
