import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Notification } from '../types';
import * as notificationService from '../features/notifications/services';
import { useAuth } from './AuthContext';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  toast: Notification | null;
  setToast: (toast: Notification | null) => void;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<Notification | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function fetchNotifications() {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      
      // Identificar si hay nuevas notificaciones no leídas para mostrarlas como Toast flotante
      setNotifications((prev) => {
        if (prev.length > 0) {
          const prevIds = new Set(prev.map((n) => n.id));
          const newUnread = data.find((n) => !n.isRead && !prevIds.has(n.id));
          if (newUnread) {
            setToast(newUnread);
            // Autocerrar el toast en 5 segundos
            setTimeout(() => setToast(null), 5000);
          }
        }
        return data;
      });
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }

  async function markNotificationAsRead(id: string) {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }

  // Sondeo (polling) cada 10 segundos
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setToast(null);
      return;
    }

    // Carga inicial
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        setToast,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}
