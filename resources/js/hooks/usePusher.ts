import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { initializePusher, getPusherInstance, disconnectPusher } from '@/utils/pusher';
import type { Channel } from 'pusher-js';

interface PageProps {
  pusher?: {
    key?: string;
    cluster?: string;
  };
  auth?: {
    user?: {
      id?: number;
    };
  };
}

interface PusherEvent {
  appointment?: any;
  message?: string;
  type?: string;
  title?: string;
  changes?: any;
  notification?: {
    id?: string;
    type?: string;
    data?: any;
  };
  id?: string;
}

interface UsePusherOptions {
  onAppointmentCreated?: (data: PusherEvent) => void;
  onAppointmentUpdated?: (data: PusherEvent) => void;
  onAppointmentReminder?: (data: PusherEvent) => void;
  onNotification?: (data: PusherEvent) => void;
  userId?: number | null;
  pusherConfig?: {
    key?: string;
    cluster?: string;
  };
  isAdmin?: boolean;
}

export function usePusher(options: UsePusherOptions = {}) {
  // Always call usePage (hooks must be called unconditionally)
  // But we'll only use its result if explicit props aren't provided
  let inertiaProps: PageProps | null = null;
  try {
    const { props } = usePage();
    inertiaProps = props as PageProps;
  } catch (e) {
    // Not in Inertia context - this is expected when called from outside Inertia components
    inertiaProps = null;
  }

  // Use explicit props if provided, otherwise fall back to Inertia props
  const userId = options.userId !== undefined 
    ? options.userId 
    : (inertiaProps?.auth?.user?.id ?? null);
  
  const pusherConfig = options.pusherConfig !== undefined
    ? options.pusherConfig
    : inertiaProps?.pusher;

  // Check if user is admin
  const userFromProps = inertiaProps?.auth?.user as any;
  const isAdmin = options.isAdmin !== undefined
    ? options.isAdmin
    : (userFromProps?.roles?.some((r: any) => r.name === 'admin') || 
       userFromProps?.role === 'admin' || 
       false);

  const channelsRef = useRef<Channel[]>([]);
  const callbacksRef = useRef(options);

  // Always keep ref up to date with latest callbacks
  callbacksRef.current = options;

  useEffect(() => {
    console.log('[usePusher] Effect triggered', {
      userId,
      pusherConfig: pusherConfig ? { cluster: pusherConfig.cluster } : null,
      isAdmin,
    });

    if (!userId) {
      console.warn('[usePusher] Skipping - no userId');
      return;
    }

    const pusher = initializePusher(userId, pusherConfig);

    if (!pusher) {
      console.error('[usePusher] Failed to initialize Pusher');
      return;
    }

    console.log('[usePusher] Pusher initialized, current connection state:', pusher.connection.state);

    // Create wrapper functions that always use the latest callbacks from ref
    const handleAppointmentCreated = (data: PusherEvent) => {
      const callbacks = callbacksRef.current;
      if (callbacks.onAppointmentCreated) {
        try {
          callbacks.onAppointmentCreated(data);
        } catch (error) {
          // Error in onAppointmentCreated
        }
      }
    };

    const handleAppointmentUpdated = (data: PusherEvent) => {
      const callbacks = callbacksRef.current;

      if (callbacks.onAppointmentUpdated) {
        try {
          callbacks.onAppointmentUpdated(data);
        } catch (error) {
          // Error in onAppointmentUpdated
        }
      }
    };

    const handleAppointmentReminder = (data: PusherEvent) => {
      const callbacks = callbacksRef.current;
      if (callbacks.onAppointmentReminder) {
        try {
          callbacks.onAppointmentReminder(data);
        } catch (error) {
          // Error in onAppointmentReminder
        }
      }
    };

    // Subscribe to public appointments channel
    const appointmentsChannel = pusher.subscribe('appointments');
    
    // CRITICAL: Unbind all previous handlers to prevent duplicates when component remounts
    appointmentsChannel.unbind_all();
    
    channelsRef.current.push(appointmentsChannel);
    
    appointmentsChannel.bind('pusher:subscription_succeeded', () => {
      console.log('[usePusher] Successfully subscribed to appointments channel');
    });

    appointmentsChannel.bind('pusher:subscription_error', (err: any) => {
      console.error('[usePusher] Subscription error for appointments channel:', err);
    });

    // Subscribe to admin channel if user is admin
    if (isAdmin) {
      const adminChannel = pusher.subscribe('admin.appointments');
      adminChannel.unbind_all(); // Unbind previous handlers
      channelsRef.current.push(adminChannel);
      
      adminChannel.bind('appointment.created', handleAppointmentCreated);
      adminChannel.bind('appointment.updated', handleAppointmentUpdated);
    }

    // Subscribe to private user channel
    const userChannel = pusher.subscribe(`private-user.${userId}`);
    
    // CRITICAL: Unbind all previous handlers to prevent duplicates when component remounts
    userChannel.unbind_all();
    
    channelsRef.current.push(userChannel);
    
    userChannel.bind('pusher:subscription_succeeded', () => {
      console.log('[usePusher] Successfully subscribed to private user channel:', `private-user.${userId}`);
    });

    userChannel.bind('pusher:subscription_error', (err: any) => {
      console.error('[usePusher] Subscription error for private user channel:', {
        channel: `private-user.${userId}`,
        error: err,
      });
    });

    // Listen for notifications on the user channel (AppointmentConfirmed, AppointmentCancelled use user.{userId})
    // AppointmentStatusChanged still uses App.Models.User.{id}, but we'll listen on user channel for the main notifications

    // Listen for appointment created events on public channel
    appointmentsChannel.bind('appointment.created', handleAppointmentCreated);

    // Listen for appointment updated events on public channel for all users.
    // Receptionists may not receive private events, so use public updates too.
    appointmentsChannel.bind('appointment.updated', (data: PusherEvent) => {
      handleAppointmentUpdated(data);
    });

    // Also listen for notification events on public appointments channel (in case they're broadcast there too)
    appointmentsChannel.bind('appointment.confirmed', (data: PusherEvent) => {
      handleNotification(data);
    });

    // Global listener for appointments channel too
    appointmentsChannel.bind_global((eventName: string, data: any) => {
      if (eventName === 'appointment.confirmed' || eventName.includes('notification') || eventName.includes('Notification')) {
        if (eventName === 'appointment.confirmed') {
          handleNotification(data);
        }
      }
    });

    // Listen for events on private user channel
    userChannel.bind('appointment.created', (data: PusherEvent) => {
      handleAppointmentCreated(data);
    });

    userChannel.bind('appointment.updated', (data: PusherEvent) => {
      handleAppointmentUpdated(data);
    });

    userChannel.bind('appointment.reminder', (data: PusherEvent) => {
      handleAppointmentReminder(data);
    });

    // Listen for general notification events on user channel
    // AppointmentConfirmed and AppointmentCancelled now broadcast to user.{userId}
    const handleNotification = (data: PusherEvent) => {
      const callbacks = callbacksRef.current;
      if (callbacks.onNotification) {
        try {
          callbacks.onNotification(data);
        } catch (error) {
          // Error in onNotification
        }
      }
    };

    // Listen for notification events on user channel
    // Laravel broadcasts notifications with the event name from broadcastType()
    userChannel.bind('appointment.confirmed', (data: PusherEvent) => {
      handleNotification(data);
    });
    userChannel.bind('appointment.cancelled', (data: PusherEvent) => {
      handleNotification(data);
    });
    userChannel.bind('appointment.status.changed', (data: PusherEvent) => {
      handleNotification(data);
    });
    userChannel.bind('appointment.reminder', (data: PusherEvent) => {
      handleNotification(data);
    });
    
    // Also listen for Laravel's default notification broadcast event
    // Even though we use broadcastType(), Laravel may still send the default event
    userChannel.bind('Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (data: PusherEvent) => {
      // Check if this is one of our custom notification types
      // The data structure from Laravel's default notification broadcast:
      // { id: '...', type: 'App\\Notifications\\AppointmentConfirmed', notifiable_type: '...', notifiable_id: ..., data: {...} }
      const notificationType = (data as any).type || data.notification?.type || (data as any).notification?.data?.type || 
                               (data as any).data?.type || (data as any).data?.notification?.type;
      const hasAppointment = (data as any).appointment || data.notification?.data?.appointment || 
                            (data as any).notification?.appointment || (data as any).data?.appointment;
      
      // Check if it's an appointment notification by class name or type
      const isAppointmentNotification = hasAppointment || 
        (notificationType && (
          notificationType === 'appointment.confirmed' ||
          notificationType === 'appointment.cancelled' ||
          notificationType === 'appointment.status.changed' ||
          notificationType === 'appointment.reminder' ||
          notificationType === 'appointment_confirmed' ||
          notificationType === 'appointment_cancelled' ||
          notificationType === 'appointment_status_changed' ||
          notificationType === 'appointment_reminder' ||
          (typeof notificationType === 'string' && (
            notificationType.includes('AppointmentConfirmed') ||
            notificationType.includes('AppointmentCancelled') ||
            notificationType.includes('AppointmentStatusChanged') ||
            notificationType.includes('AppointmentReminder') ||
            notificationType.includes('App\\Notifications\\Appointment')
          ))
        ));
      
      if (isAppointmentNotification) {
        // Extract the actual notification data from Laravel's structure
        const notificationData = (data as any).data || data.notification?.data || data;
        handleNotification(notificationData);
      }
    });
    
    // Listen for all events on the channel for debugging
    userChannel.bind_global((eventName: string, data: any) => {
      // Check if this is a notification-related event
      if (eventName.startsWith('appointment.') || 
          eventName.includes('Notification') || 
          eventName.includes('notification') ||
          eventName === 'appointment.confirmed' ||
          eventName === 'appointment.cancelled' ||
          eventName.includes('BroadcastNotification') ||
          eventName.includes('Illuminate')) {
        // Try to handle it as a notification if it looks like one
        if (eventName === 'appointment.confirmed' || 
            (data && (data.type === 'appointment.confirmed' || data.type === 'appointment_confirmed' || 
                     (data.data && data.data.type === 'appointment.confirmed')))) {
          handleNotification(data);
        }
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('[usePusher] Channel cleanup triggered', {
        channelCount: channelsRef.current.length,
        channelNames: channelsRef.current.map(c => c.name),
        pusherState: pusher.connection.state,
      });
      
      channelsRef.current.forEach((channel) => {
        try {
          channel.unbind_all();
          pusher.unsubscribe(channel.name);
          console.log('[usePusher] Unsubscribed from channel:', channel.name);
        } catch (error) {
          console.error('[usePusher] Error unsubscribing from channel:', channel.name, error);
        }
      });
      channelsRef.current = [];
      
      // Only disconnect if connection is established and we're sure no other components need it
      // Note: We don't disconnect here to avoid premature disconnection during React Strict Mode
      // The Pusher instance will remain connected for other components that might need it
    };
  }, [userId, pusherConfig, isAdmin]);

  return {
    pusher: getPusherInstance(),
  };
}

