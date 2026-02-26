'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';
import {
  getNotificationsAction,
  markAllReadAction,
} from '@/lib/actions/notification.actions';
import { NotificationPanel } from './notification-panel';
import type { NotificationItem } from '@/lib/types/notification.types';

interface Props {
  panelPosition?: 'right' | 'below';

  className?: string;

  showLabel?: boolean;
}

export function NotificationBell({
  panelPosition = 'right',
  className = '',
  showLabel = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNotificationsAction()
      .then(({ notifications: items, unreadCount: count }) => {
        setNotifications(items);
        setUnreadCount(count);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const calcStyle = useCallback((): React.CSSProperties => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();

    if (panelPosition === 'right') {
      return {
        position: 'fixed',
        left: rect.right + 12,
        top: Math.max(8, rect.top),
        zIndex: 9999,
      };
    }

    const panelW = Math.min(320, window.innerWidth - 32);
    const centerLeft = Math.max(16, (window.innerWidth - panelW) / 2);
    return {
      position: 'fixed',
      left: centerLeft,
      top: rect.bottom + 8,
      width: panelW,
      zIndex: 9999,
    };
  }, [panelPosition]);

  useEffect(() => {
    if (!isOpen) return;

    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setIsOpen(false);
      }
    }
    function reposition() {
      setPanelStyle(calcStyle());
    }

    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', reposition, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', reposition, { passive: true });

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen, calcStyle]);

  async function handleOpen() {
    const opening = !isOpen;

    if (opening) setPanelStyle(calcStyle());
    setIsOpen(opening);
    if (opening && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await markAllReadAction();
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        aria-label="Notifications"
        className={className}
      >
        <div className="relative inline-flex">
          <Bell size={24} strokeWidth={isOpen ? 2.5 : 1.75} />
          {loaded && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-0.75 rounded-full bg-[#FFC300] text-black text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {showLabel && (
          <span className="hidden lg:block ml-3 text-[15px] font-semibold">
            Notifications
          </span>
        )}
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div ref={panelRef} style={panelStyle}>
            <NotificationPanel
              notifications={notifications}
              onClose={() => setIsOpen(false)}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
