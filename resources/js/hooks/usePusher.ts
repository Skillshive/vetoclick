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
  
  console.log('[usePusher] Current callbacks ref:', {
    hasCreated: !!callbacksRef.current.onAppointmentCreated,
    hasUpdated: !!callbacksRef.current.onAppointmentUpdated,
    hasReminder: !!callbacksRef.current.onAppointmentReminder,
  });

  useEffect(() => {
    console.log('[usePusher] useEffect triggered with:', {
      userId,
      pusherConfig,
      isAdmin,
    });
    
    if (!userId) {
      console.log('[Pusher] No userId, skipping Pusher initialization. userId:', userId);
      return;
    }

    const pusher = initializePusher(userId, pusherConfig);

    if (!pusher) {
      console.warn('[Pusher] Failed to initialize Pusher');
      return;
    }

    // Add connection event listeners for debugging
    pusher.connection.bind('connected', () => {
      console.log('[Pusher] Connected to Pusher');
    });

    pusher.connection.bind('error', (err: any) => {
      console.error('[Pusher] Connection error:', err);
    });

    pusher.connection.bind('disconnected', () => {
      console.warn('[Pusher] Disconnected from Pusher');
    });

    // Create wrapper functions that always use the latest callbacks from ref
    const handleAppointmentCreated = (data: PusherEvent) => {
      const callbacks = callbacksRef.current;
      console.log('[Pusher] handleAppointmentCreated - callbacks:', {
        hasCreated: !!callbacks.onAppointmentCreated,
        callbackType: typeof callbacks.onAppointmentCreated,
      });
      if (callbacks.onAppointmentCreated) {
        try {
          callbacks.onAppointmentCreated(data);
        } catch (error) {
          console.error('[Pusher] Error in onAppointmentCreated:', error);
        }
      }
    };

    const handleAppointmentUpdated = (data: PusherEvent) => {
      const callbacks = callbacksRef.current;
      console.log('[Pusher] handleAppointmentUpdated START');
      console.log('[Pusher] callbacksRef.current:', callbacks);
      console.log('[Pusher] onAppointmentUpdated exists?', !!callbacks.onAppointmentUpdated);
      console.log('[Pusher] onAppointmentUpdated type:', typeof callbacks.onAppointmentUpdated);
      console.log('[Pusher] onAppointmentUpdated function:', callbacks.onAppointmentUpdated?.toString().substring(0, 100));
      
      if (callbacks.onAppointmentUpdated) {
        console.log('[Pusher] About to call onAppointmentUpdated with data:', data);
        console.log('[Pusher] Calling callback now...');
        try {
          const result = callbacks.onAppointmentUpdated(data);
          console.log('[Pusher] onAppointmentUpdated returned:', result);
          console.log('[Pusher] Callback execution completed');
        } catch (error) {
          console.error('[Pusher] ERROR in onAppointmentUpdated:', error);
          console.error('[Pusher] Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : 'No stack',
            name: error instanceof Error ? error.name : 'Unknown',
          });
        }
      } else {
        console.warn('[Pusher] onAppointmentUpdated is not defined in callbacksRef');
      }
      console.log('[Pusher] handleAppointmentUpdated END');
    };

    const handleAppointmentReminder = (data: PusherEvent) => {
      const callbacks = callbacksRef.current;
      if (callbacks.onAppointmentReminder) {
        try {
          callbacks.onAppointmentReminder(data);
        } catch (error) {
          console.error('[Pusher] Error in onAppointmentReminder:', error);
        }
      }
    };

    // Subscribe to public appointments channel
    const appointmentsChannel = pusher.subscribe('appointments');
    channelsRef.current.push(appointmentsChannel);
    
    appointmentsChannel.bind('pusher:subscription_succeeded', () => {
      console.log('[Pusher] Successfully subscribed to appointments channel');
    });

    appointmentsChannel.bind('pusher:subscription_error', (err: any) => {
      console.error('[Pusher] Subscription error for appointments channel:', err);
    });
    
    console.log('[Pusher] Subscribed to appointments channel');

    // Subscribe to admin channel if user is admin
    if (isAdmin) {
      const adminChannel = pusher.subscribe('admin.appointments');
      channelsRef.current.push(adminChannel);
      console.log('[Pusher] Subscribed to admin.appointments channel');
      
      adminChannel.bind('appointment.created', handleAppointmentCreated);
      adminChannel.bind('appointment.updated', handleAppointmentUpdated);
    }

    // Subscribe to private user channel
    const userChannel = pusher.subscribe(`private-user.${userId}`);
    channelsRef.current.push(userChannel);
    
    userChannel.bind('pusher:subscription_succeeded', () => {
      console.log(`[Pusher] Successfully subscribed to private-user.${userId} channel`);
    });

    userChannel.bind('pusher:subscription_error', (err: any) => {
      console.error(`[Pusher] Subscription error for private-user.${userId} channel:`, err);
    });
    
    console.log(`[Pusher] Subscribed to private-user.${userId} channel`);

    // Listen for notifications on the user channel (AppointmentConfirmed, AppointmentCancelled use user.{userId})
    // AppointmentStatusChanged still uses App.Models.User.{id}, but we'll listen on user channel for the main notifications

    // Listen for appointment created events on public channel
    appointmentsChannel.bind('appointment.created', handleAppointmentCreated);

    // Listen for appointment updated events on public channel
    appointmentsChannel.bind('appointment.updated', (data: PusherEvent) => {
      console.log('[Pusher] Received appointment.updated on appointments channel:', data);
      handleAppointmentUpdated(data);
    });

    // Listen for events on private user channel
    userChannel.bind('appointment.created', (data: PusherEvent) => {
      console.log('[Pusher] Received appointment.created on private channel:', data);
      handleAppointmentCreated(data);
    });

    userChannel.bind('appointment.updated', (data: PusherEvent) => {
      console.log('[Pusher] Received appointment.updated on private channel:', data);
      handleAppointmentUpdated(data);
    });

    userChannel.bind('appointment.reminder', (data: PusherEvent) => {
      console.log('[Pusher] Received appointment.reminder:', data);
      handleAppointmentReminder(data);
    });

    // Listen for general notification events on user channel
    // AppointmentConfirmed and AppointmentCancelled now broadcast to user.{userId}
    const handleNotification = (data: PusherEvent) => {
      const callbacks = callbacksRef.current;
      console.log('[Pusher] Received notification on user channel:', data);
      if (callbacks.onNotification) {
        try {
          callbacks.onNotification(data);
        } catch (error) {
          console.error('[Pusher] Error in onNotification:', error);
        }
      }
    };

    // Listen for notification events on user channel
    // Laravel broadcasts notifications with the event name from broadcastType()
    userChannel.bind('appointment.confirmed', (data: PusherEvent) => {
      console.log('[Pusher] Received appointment.confirmed on user channel:', data);
      handleNotification(data);
    });
    userChannel.bind('appointment.cancelled', (data: PusherEvent) => {
      console.log('[Pusher] Received appointment.cancelled on user channel:', data);
      handleNotification(data);
    });
    userChannel.bind('appointment.status.changed', (data: PusherEvent) => {
      console.log('[Pusher] Received appointment.status.changed on user channel:', data);
      handleNotification(data);
    });
    userChannel.bind('appointment.reminder', (data: PusherEvent) => {
      console.log('[Pusher] Received appointment.reminder on user channel:', data);
      handleNotification(data);
    });
    
    // Also listen for Laravel's default notification broadcast event
    // Even though we use broadcastType(), Laravel may still send the default event
    userChannel.bind('Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (data: PusherEvent) => {
      console.log('[Pusher] Received BroadcastNotificationCreated on user channel:', data);
      // Check if this is one of our custom notification types
      // The data structure is: { type: 'appointment.confirmed', title: '...', message: '...', appointment: {...} }
      const notificationType = (data as any).type || data.notification?.type || (data as any).notification?.data?.type;
      const hasAppointment = (data as any).appointment || data.notification?.data?.appointment || (data as any).notification?.appointment;
      
      // If it has an appointment field or the type matches, it's an appointment notification
      const isAppointmentNotification = hasAppointment || (notificationType && (
        notificationType === 'appointment.confirmed' ||
        notificationType === 'appointment.cancelled' ||
        notificationType === 'appointment.status.changed' ||
        notificationType === 'appointment.reminder' ||
        notificationType === 'appointment_status_changed' ||
        notificationType === 'appointment_reminder' ||
        (typeof notificationType === 'string' && (
          notificationType.includes('AppointmentConfirmed') ||
          notificationType.includes('AppointmentCancelled') ||
          notificationType.includes('AppointmentStatusChanged') ||
          notificationType.includes('AppointmentReminder')
        ))
      ));
      
      if (isAppointmentNotification) {
        console.log('[Pusher] This is an appointment notification, handling it. Type:', notificationType, 'Has appointment:', !!hasAppointment);
        handleNotification(data);
      } else {
        console.log('[Pusher] Not an appointment notification, ignoring. Type:', notificationType, 'Has appointment:', !!hasAppointment);
      }
    });
    
    // Listen for all events on the channel for debugging
    userChannel.bind_global((eventName: string, data: any) => {
      if (eventName.startsWith('appointment.') || eventName.includes('Notification')) {
        console.log('[Pusher] Global event listener caught:', eventName, data);
      }
    });

    // Cleanup on unmount
    return () => {
      channelsRef.current.forEach((channel) => {
        channel.unbind_all();
        pusher.unsubscribe(channel.name);
      });
      channelsRef.current = [];
    };
  }, [userId, pusherConfig, isAdmin]);

  useEffect(() => {
    return () => {
      disconnectPusher();
    };
  }, []);

  return {
    pusher: getPusherInstance(),
  };
}

