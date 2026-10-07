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
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="
          fixed z-50

          /* Mobile */
          top-20 left-3 right-3
          w-auto
          max-w-none
          rounded-2xl

          /* Tablet */
          sm:left-auto
          sm:right-4
          sm:w-[min(380px,calc(100vw-2rem))]

          /* Desktop */
          lg:right-8

          bg-white
          border border-slate-200
          shadow-[0_16px_32px_rgba(42,52,57,0.08)]
          overflow-hidden

          max-h-[calc(100vh-6rem)]

          opacity-100
          translate-y-0
          transition-all duration-300
          origin-top-right
        "
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h3 className="font-semibold text-on-surface text-base sm:text-lg whitespace-nowrap">
              Notificações
            </h3>

            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-600 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
              </span>
            )}
          </div>

          {onMarkAsRead && (
            <button
              onClick={onMarkAsRead}
              className="
                text-[11px] sm:text-xs
                text-slate-600
                hover:text-blue-600
                transition-colors
                font-medium
                whitespace-nowrap
                shrink-0
              "
            >
              Marcar como lidas
            </button>
          )}
        </div>

        {/* Notification List */}
        <div
          className="
            overflow-y-auto
            no-scrollbar
            max-h-[calc(100vh-13rem)]
            sm:max-h-[400px]
          "
        >
          {children ? (
            children
          ) : (
            <div className="px-4 sm:px-5 py-10 sm:py-12 text-center">
              <Icon
                name="notifications"
                className="text-4xl text-slate-300 mx-auto mb-3"
              />

              <p className="text-sm text-slate-500">
                Nenhuma notificação
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-200">
          {onViewAll ? (
            <button
              onClick={onViewAll}
              className="
                w-full
                py-2.5
                text-xs sm:text-sm
                font-medium
                text-blue-600
                hover:bg-blue-50
                rounded-lg
                transition-colors duration-200
              "
            >
              Ver todas as notificações
            </button>
          ) : (
            <div className="py-2.5 text-xs sm:text-sm text-slate-500 text-center">
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
