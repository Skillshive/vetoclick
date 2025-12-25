import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { usePusher } from '@/hooks/usePusher';
import { useAuthContext } from '@/contexts/auth/context';
import { NotificationToast } from './NotificationToast';
import { NotificationType } from '@/@types/common';
import { getLatestNotifications, deleteNotification } from '@/services/notificationService';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface OverlayNotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  time: string;
  appointmentId?: string;
  appointmentUuid?: string;
}

interface NotificationContextType {
  showNotification: (notification: Omit<ToastNotification, 'id'>) => void;
  toastNotifications: ToastNotification[];
  overlayNotifications: OverlayNotification[];
  removeNotification: (id: string) => void;
  removeOverlayNotification: (id: string) => void;
  clearAllOverlayNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
  const [overlayNotifications, setOverlayNotifications] = useState<OverlayNotification[]>([]);
  const { user, isAuthenticated } = useAuthContext();
  const [pusherConfig, setPusherConfig] = useState<{ key?: string; cluster?: string } | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated && user && user.id) {
      getLatestNotifications(10)
        .then((response) => {
          if (response.success && response.notifications) {
            const converted = response.notifications.map((notification) => ({
              id: notification.id, // Use the actual notification ID from database
              title: notification.data.title || 'Notification',
              description: notification.data.message || '',
              type: (notification.data.type === 'appointment_confirmed' || notification.data.type === 'appointment.confirmed' ? 'task' :
                     notification.data.type === 'appointment_cancelled' || notification.data.type === 'appointment.cancelled' ? 'security' :
                     notification.data.type === 'appointment_reminder' || notification.data.type === 'appointment.reminder' ? 'task' :
                     'message') as NotificationType,
              time: formatTimeAgo(new Date(notification.created_at)),
              appointmentId: notification.data.appointment?.id?.toString(),
              appointmentUuid: notification.data.appointment?.uuid,
            }));
            
            const uniqueNotifications = converted.filter((notification, index, self) =>
              index === self.findIndex((n) => n.id === notification.id)
            );

            setOverlayNotifications((prev) => {
              const apiNotifications = uniqueNotifications;
              
              const websocketNotifications = prev.filter(wsNotif => {
                if (!wsNotif.appointmentUuid) return true; 
                
                const hasMatch = apiNotifications.some(apiNotif => 
                  apiNotif.appointmentUuid === wsNotif.appointmentUuid &&
                  apiNotif.type === wsNotif.type &&
                  apiNotif.title === wsNotif.title
                );
                
                return !hasMatch; 
              });
              
              const combined = [...apiNotifications, ...websocketNotifications];
              const final = combined.filter((n, index, self) => 
                index === self.findIndex(item => item.id === n.id)
              );
              
              return final;
            });
          }
        })
        .catch((error) => {
          console.error('[NotificationProvider] Error fetching notifications:', error);
        });
    } else {
      // Clear notifications if user is not authenticated
      setOverlayNotifications([]);
    }
  }, [isAuthenticated, user?.id]); // Only depend on user.id to prevent re-fetching

  // Get Pusher config - will be initialized from env vars in pusher.ts if not available
  // The pusher.ts utility will handle getting config from env vars as fallback

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const removeNotification = useCallback((id: string) => {
    setToastNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setToastNotifications((prev) => {
      return [...prev, newNotification];
    });

    const overlayNotification: OverlayNotification = {
      id,
      title: notification.title,
      description: notification.message,
      type: notification.type === 'success' ? 'task' : 
            notification.type === 'error' ? 'security' : 
            notification.type === 'warning' ? 'security' : 'message',
      time: formatTimeAgo(new Date()),
    };

    setOverlayNotifications((prev) => {
      return [overlayNotification, ...prev];
    });

    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [removeNotification]);

  const removeOverlayNotification = useCallback(async (id: string) => {
    setOverlayNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      await deleteNotification(id);
    } catch (error: any) {

    }
  }, []);

  const clearAllOverlayNotifications = useCallback(() => {
    setOverlayNotifications([]);
  }, []);

  const userAny = user as any;
  const isAdmin = userAny?.roles?.some((r: any) => r.name === 'admin') || userAny?.role === 'admin' || false;

  const handleAppointmentCreated = useCallback((data: any) => {
    const appointment = data.appointment;
    const vetName = appointment?.veterinary?.name || 'le vétérinaire';
    const petName = appointment?.pet?.name || 'votre animal';
    const date = appointment?.appointment_date 
      ? new Date(appointment.appointment_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      : '';
    const time = appointment?.start_time 
      ? (typeof appointment.start_time === 'string' 
          ? appointment.start_time.substring(0, 5) 
          : new Date(appointment.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
      : '';

    const message = data.message || `Rendez-vous créé avec ${vetName} pour ${petName}${date ? ` le ${date}` : ''}${time ? ` à ${time}` : ''}`;

    showNotification({
      type: 'success',
      title: 'Nouveau rendez-vous',
      message,
    });

    const notificationId = data.id || data.notification?.id || 
      (appointment?.uuid ? `${appointment.uuid}-appointment_created` : null) ||
      Math.random().toString(36).substring(7);
    setOverlayNotifications((prev) => {
      const exists = prev.some(n => 
        n.id === notificationId || 
        (appointment?.uuid && n.appointmentUuid === appointment.uuid && n.title === 'Nouveau rendez-vous')
      );
      if (exists) return prev;
      return [{
        id: notificationId,
        title: 'Nouveau rendez-vous',
        description: message,
        type: 'task',
        time: 'Just now',
        appointmentId: appointment?.id?.toString(),
        appointmentUuid: appointment?.uuid,
      }, ...prev];
    });
  }, [showNotification]);

  const handleAppointmentUpdated = useCallback((data: any) => {
  }, []);

  const handleAppointmentReminder = useCallback((data: any) => {
    const title = data.title || 'Rappel de rendez-vous';
    const message = data.message || 'Vous avez un rendez-vous à venir';
    
    showNotification({
      type: 'info',
      title,
      message,
      duration: 10000, // Show for 10 seconds
    });

    // Add to overlay notifications (only if not already exists)
    const notificationId = data.id || data.notification?.id || 
      (data.appointment?.uuid ? `${data.appointment.uuid}-reminder` : null) ||
      Math.random().toString(36).substring(7);
    setOverlayNotifications((prev) => {
      // Check by ID or by appointment UUID + type
      const exists = prev.some(n => 
        n.id === notificationId || 
        (data.appointment?.uuid && n.appointmentUuid === data.appointment.uuid && 
         n.title === title && n.type === 'task')
      );
      if (exists) return prev;
      return [{
        id: notificationId,
        title,
        description: message,
        type: 'task',
        time: 'Just now',
        appointmentId: data.appointment?.id?.toString(),
        appointmentUuid: data.appointment?.uuid,
      }, ...prev];
    });
  }, [showNotification]);

  const handleNotification = useCallback((data: any) => {
    let notificationData = data;
    let notificationId = data.id;
    
    if (data.notification) {
      notificationId = data.notification.id || data.id;
      notificationData = {
        ...data.notification.data,
        id: notificationId,
        type: data.notification.data?.type || data.type,
        appointment: data.notification.data?.appointment || data.appointment,
      };
    } else if ((data as any).id && !data.appointment) {
      notificationId = (data as any).id;
    } else {
      notificationData = {
        ...data,
        id: notificationId,
      };
    }
    
    const appointment = notificationData.appointment || data.appointment;
    const notifType = notificationData.type || data.type;
    
    let notificationType: 'success' | 'error' | 'info' | 'warning' = 'info';
    let overlayType: NotificationType = 'message';
    
    // Normalize the notification type (handle both dot and underscore formats)
    const normalizedType = notifType?.replace(/\./g, '_') || '';
    
    if (normalizedType === 'appointment_confirmed' || notifType === 'appointment.confirmed') {
      notificationType = 'success';
      overlayType = 'task';
    } else if (normalizedType === 'appointment_cancelled' || notifType === 'appointment.cancelled') {
      notificationType = 'warning';
      overlayType = 'security';
    } else if (normalizedType === 'appointment_status_changed' || notifType === 'appointment.status.changed') {
      notificationType = 'info';
      overlayType = 'task';
    } else if (normalizedType === 'appointment_reminder' || notifType === 'appointment.reminder') {
      notificationType = 'info';
      overlayType = 'task';
    }

    const title = notificationData.title || data.title || 'Notification';
    const message = notificationData.message || data.message || 'Vous avez une nouvelle notification';

    // Show toast notification
    showNotification({
      type: notificationType,
      title,
      message,
      duration: notifType === 'appointment_reminder' ? 10000 : 5000,
    });

    const normalizedTypeForId = notifType?.replace(/\./g, '_') || notifType || 'unknown';
    const finalNotificationId = notificationId || 
      (appointment?.uuid ? `${appointment.uuid}-${normalizedTypeForId}` : null) ||
      Math.random().toString(36).substring(7);
    
    const overlayNotification: OverlayNotification = {
      id: finalNotificationId,
      title,
      description: message,
      type: overlayType,
      time: 'Just now',
      appointmentId: appointment?.id?.toString(),
      appointmentUuid: appointment?.uuid,
    };

    setOverlayNotifications((prev) => {
      const exists = prev.some(n => {
        if (finalNotificationId && n.id === finalNotificationId) {
          return true;
        }
        
        if (appointment?.uuid && n.appointmentUuid === appointment.uuid) {
          if (n.type === overlayType && n.title === overlayNotification.title) {
            return true;
          }
          if (n.description === overlayNotification.description && n.type === overlayType) {
            return true;
          }
        }
        
        return false;
      });
      
      if (exists) {
        return prev;
      }
      
      return [overlayNotification, ...prev];
    });
  }, [showNotification]);

  usePusher({
    userId: isAuthenticated && user ? (user.id as number) : null,
    pusherConfig,
    isAdmin,
    onAppointmentCreated: handleAppointmentCreated,
    onAppointmentUpdated: handleAppointmentUpdated,
    onAppointmentReminder: handleAppointmentReminder,
    onNotification: handleNotification,
  });


  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      toastNotifications, 
      overlayNotifications,
      removeNotification, 
      removeOverlayNotification,
      clearAllOverlayNotifications,
    }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toastNotifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

