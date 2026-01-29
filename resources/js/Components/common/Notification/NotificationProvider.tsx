import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { usePusher } from '@/hooks/usePusher';
import { useAuthContext } from '@/contexts/auth/context';
import { NotificationToast } from './NotificationToast';
import { NotificationType } from '@/@types/common';
import { getLatestNotifications, deleteNotification } from '@/services/notificationService';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();

  const [prevNotificationIds, setPrevNotificationIds] = useState<Set<string>>(new Set());
  const prevNotificationIdsRef = useRef<Set<string>>(new Set());
  // Use ref for immediate synchronous duplicate detection (state updates are async and can cause race conditions)
  const processedAppointmentUpdatesRef = useRef<Set<string>>(new Set());

  // Use ref to store the latest translation function to avoid dependency issues
  const tRef = useRef(t);
  tRef.current = t;

  const fetchNotifications = useCallback((showToastForNew = false) => {
    if (isAuthenticated && user && user.id) {
      getLatestNotifications(10)
        .then((response) => {
          if (response.success && response.notifications) {
            const converted = response.notifications.map((notification) => ({
              id: notification.id, // Use the actual notification ID from database
              title: notification.data.title ? tRef.current(notification.data.title) : tRef.current('common.notification'),
              description: notification.data.message ? tRef.current(notification.data.message) : '',
              type: (notification.data.type === 'appointment_confirmed' || notification.data.type === 'appointment.confirmed' ? 'task' :
                     notification.data.type === 'appointment_cancelled' || notification.data.type === 'appointment.cancelled' ? 'security' :
                     notification.data.type === 'appointment_reminder' || notification.data.type === 'appointment.reminder' ? 'task' :
                     'message') as NotificationType,
              time: formatTimeAgo(new Date(notification.created_at)),
              appointmentId: notification.data.appointment?.id?.toString(),
              appointmentUuid: notification.data.appointment?.uuid,
            }));
            
            const newNotifications = response.notifications.filter(
              (notif) => !prevNotificationIdsRef.current.has(notif.id),
            );

            // Trigger local dashboard updates for new appointment notifications (polling fallback)
            newNotifications.forEach((notification) => {
              if (notification.data?.appointment && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('appointment.updated.local', {
                  detail: {
                    appointment: notification.data.appointment,
                    source: 'notification.poll',
                  },
                }));
              }
            });

            // Update the tracking set with all current notification IDs
            setPrevNotificationIds((prevIds) => {
              const newIds = new Set(prevIds);
              response.notifications.forEach(notif => newIds.add(notif.id));
              return newIds;
            });
            response.notifications.forEach((notif) => prevNotificationIdsRef.current.add(notif.id));
            
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
          // Error fetching notifications
        });
    } else {
      // Clear notifications if user is not authenticated
      setOverlayNotifications([]);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchNotifications(false);
    
    // Periodically check for new notifications (in case broadcast isn't working)
    // Use a longer interval to avoid spamming
    const interval = setInterval(() => {
      fetchNotifications(false); // Don't show toasts on interval refresh
    }, 30000); // Check every 30 seconds instead of 5
    
    return () => {
      clearInterval(interval);
    };
  }, [fetchNotifications]);

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

  // Helper function to extract appointment details for translation replacements
  const getAppointmentReplacements = useCallback((appointment: any): Record<string, string> => {
    const vetName = appointment?.veterinary?.name || 
                   (appointment?.veterinary?.user?.firstname && appointment?.veterinary?.user?.lastname
                     ? `${appointment.veterinary.user.firstname} ${appointment.veterinary.user.lastname}`
                     : 'the veterinarian');
    
    const petName = appointment?.pet?.name || 'your pet';
    
    let date = '';
    if (appointment?.appointment_date) {
      const appointmentDate = new Date(appointment.appointment_date);
      date = appointmentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    let time = '';
    if (appointment?.start_time) {
      if (typeof appointment.start_time === 'string') {
        // Extract time from "HH:mm:ss" format
        time = appointment.start_time.substring(0, 5);
      } else {
        // If it's already formatted or a Date object
        time = appointment.start_time;
      }
    }
    
    return {
      vetName,
      petName,
      date,
      time,
    };
  }, []);

  const handleAppointmentCreated = useCallback((data: any) => {
    const appointment = data.appointment;
    // Title and message from backend are translation keys
    const titleKey = data.title || data.notification?.data?.title || 'common.new_appointment';
    const messageKey = data.message || data.notification?.data?.message || '';
    
    const replacements = getAppointmentReplacements(appointment);
    const title = t(titleKey);
    const message = messageKey ? t(messageKey, replacements) : '';

    if (!title && !message) {
      return;
    }

    showNotification({
      type: 'success',
      title,
      message,
    });

    const notificationId = data.id || data.notification?.id || 
      (appointment?.uuid ? `${appointment.uuid}-appointment_created` : null) ||
      Math.random().toString(36).substring(7);
    setOverlayNotifications((prev) => {
      const exists = prev.some(n => 
        n.id === notificationId || 
        (appointment?.uuid && n.appointmentUuid === appointment.uuid && n.title === title)
      );
      if (exists) return prev;
      return [{
        id: notificationId,
        title,
        description: message,
        type: 'task',
        time: 'Just now',
        appointmentId: appointment?.id?.toString(),
        appointmentUuid: appointment?.uuid,
      }, ...prev];
    });
  }, [showNotification, t, getAppointmentReplacements]);

  const handleAppointmentUpdated = useCallback((data: any) => {
    const appointment = data.appointment;
    const changes = data.changes;
    // Title and message from backend are translation keys
    const titleKey = data.title || data.notification?.data?.title || '';
    const messageKey = data.message || data.notification?.data?.message || '';
    
    // If there's a status change, show a notification
    if (changes?.status) {
      const oldStatus = changes.status.old;
      const newStatus = changes.status.new;
      
      // Create a unique key for this specific update to prevent duplicates
      const updateKey = `${appointment?.id || appointment?.uuid}-${oldStatus}-${newStatus}`;
      
      // Use ref for IMMEDIATE synchronous check (no async state update delay)
      if (processedAppointmentUpdatesRef.current.has(updateKey)) {
        return;
      }
      
      // Mark this update as processed IMMEDIATELY in the ref
      processedAppointmentUpdatesRef.current.add(updateKey);
      
      // Keep only the last 50 updates to prevent memory leak
      if (processedAppointmentUpdatesRef.current.size > 100) {
        const arr = Array.from(processedAppointmentUpdatesRef.current);
        processedAppointmentUpdatesRef.current = new Set(arr.slice(-50));
      }
      
      let notificationType: 'success' | 'error' | 'info' | 'warning' = 'info';
      // Default translation keys based on status (if backend doesn't provide them)
      let defaultTitleKey = 'common.appointment_updated';
      let defaultMessageKey = 'common.appointment_updated_message';
      
      // Determine notification type and default keys based on status change
      if (newStatus === 'confirmed') {
        notificationType = 'success';
        defaultTitleKey = 'common.appointment_confirmed';
        defaultMessageKey = 'common.appointment_confirmed_message';
      } else if (newStatus === 'cancelled') {
        notificationType = 'warning';
        defaultTitleKey = 'common.appointment_cancelled';
        defaultMessageKey = 'common.appointment_cancelled_message';
      } else if (newStatus === 'completed') {
        notificationType = 'success';
        defaultTitleKey = 'common.appointment_completed';
        defaultMessageKey = 'common.appointment_completed_message';
      } else if (newStatus === 'rescheduled') {
        notificationType = 'info';
        defaultTitleKey = 'common.appointment_rescheduled';
        defaultMessageKey = 'common.appointment_rescheduled_message';
      }
      
      // Use backend translation keys if provided, otherwise use defaults
      const finalTitleKey = titleKey || defaultTitleKey;
      const finalMessageKey = messageKey || defaultMessageKey;
      
      const replacements = getAppointmentReplacements(appointment);
      const title = t(finalTitleKey);
      const message = finalMessageKey ? t(finalMessageKey, replacements) : '';
      
      // Only show notification if we have title or message
      if (title || message) {
        // Show toast notification (this also adds to overlay automatically)
        showNotification({
          type: notificationType,
          title,
          message,
          duration: 5000,
        });
      }
    } else {
      // Generic update notification if no status change
      if (titleKey || messageKey) {
        const replacements = getAppointmentReplacements(appointment);
        const title = titleKey ? t(titleKey) : t('common.appointment_updated');
        const message = messageKey ? t(messageKey, replacements) : '';
        
        showNotification({
          type: 'info',
          title,
          message,
          duration: 5000,
        });
      }
    }
  }, [showNotification, t, getAppointmentReplacements]);

  const handleAppointmentReminder = useCallback((data: any) => {
    // Title and message from backend are translation keys
    const titleKey = data.title || data.notification?.data?.title || 'common.appointment_reminder';
    const messageKey = data.message || data.notification?.data?.message || 'common.appointment_reminder_message';
    
    const appointment = data.appointment || data.notification?.data?.appointment;
    const replacements = getAppointmentReplacements(appointment);
    const title = t(titleKey);
    const message = t(messageKey, replacements);
    
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
  }, [showNotification, t, getAppointmentReplacements]);

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
    if (appointment && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('appointment.updated.local', {
        detail: {
          appointment,
          source: 'notification.ws',
        },
      }));
    }
    // Extract notification type from multiple possible sources
    const notifType = notificationData.type || data.type || (data as any).notification?.type || 
                      (data as any).notification?.data?.type || 
                      (notificationData as any).notification?.type;
    
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

    // Title and message from backend are translation keys
    const titleKey = notificationData.title || data.title || 'common.notification';
    const messageKey = notificationData.message || data.message || 'common.new_notification';

    const replacements = appointment ? getAppointmentReplacements(appointment) : {};
    const title = t(titleKey);
    const message = t(messageKey, replacements);

    // Show toast notification
    // Always show if we have valid notification data (handler is only called for valid notifications)
    if (title || message) {
      showNotification({
        type: notificationType,
        title,
        message,
        duration: notifType === 'appointment_reminder' || normalizedType === 'appointment_reminder' ? 10000 : 5000,
      });
    }

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
  }, [showNotification, t, getAppointmentReplacements]);

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

