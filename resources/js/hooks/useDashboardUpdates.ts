// @refresh reset
import { useEffect, useCallback, useRef } from 'react';
import { usePusher } from './usePusher';
import { useInertiaAuth } from './useInertiaAuth';
import { Appointment } from '@/pages/Appointments/datatable/types';

interface UseDashboardUpdatesOptions {
  onAppointmentUpdated?: (
    appointment: Appointment,
    payload?: { raw?: any; changes?: any }
  ) => void;
  onAppointmentCreated?: (appointment: Appointment) => void;
  onAppointmentDeleted?: (appointmentUuid: string) => void;
}

/**
 * Hook to listen for real-time appointment updates via WebSocket
 * and update dashboard state without page reload
 */
export function useDashboardUpdates(options: UseDashboardUpdatesOptions = {}) {
  const { user } = useInertiaAuth();
  const callbacksRef = useRef(options);
  const recentEventsRef = useRef<Map<string, number>>(new Map());
  
  // Always keep ref up to date with latest callbacks
  callbacksRef.current = options;

  // Helper to convert backend appointment data to frontend Appointment type
  const normalizeAppointment = useCallback((data: any): Appointment | null => {
    const appointment =
      data?.appointment ||
      data?.notification?.data?.appointment ||
      data?.notification?.appointment ||
      data?.data?.appointment ||
      null;

    if (!appointment) return null;
    
    const appointmentDate = appointment.appointment_date
      ? new Date(appointment.appointment_date)
      : new Date();

    return {
      uuid: appointment.uuid,
      appointment_date: appointmentDate,
      start_time: appointment.start_time || '',
      end_time: appointment.end_time || '',
      status: appointment.status || '',
      appointment_type: appointment.appointment_type || 'consultation',
      reason_for_visit: appointment.reason_for_visit || '',
      is_video_conseil: appointment.is_video_conseil || false,
      video_meeting_id: appointment.video_meeting_id || '',
      video_join_url: appointment.video_join_url || '',
      duration_minutes: appointment.duration_minutes || 30,
      appointment_notes: appointment.appointment_notes || '',
      created_at: appointment.created_at || '',
      client: appointment.client ? {
        uuid: appointment.client.uuid || '',
        first_name:
          appointment.client.name?.split(' ')[0] ||
          appointment.client.first_name ||
          '',
        last_name:
          appointment.client.name?.split(' ').slice(1).join(' ') ||
          appointment.client.last_name ||
          '',
        avatar: appointment.client.avatar || '',
      } : {
        uuid: '',
        first_name: '',
        last_name: '',
        avatar: '',
      },
      pet: appointment.pet ? {
        uuid: appointment.pet.uuid || '',
        name: appointment.pet.name || '',
        species: appointment.pet.species || '',
        breed: appointment.pet.breed || '',
        avatar: appointment.pet.avatar || '',
        microchip: appointment.pet.microchip || '',
        gender: appointment.pet.gender || '',
        dob: appointment.pet.dob ? new Date(appointment.pet.dob) : new Date(),
        wieght: appointment.pet.wieght || 0,
      } : {
        uuid: '',
        name: '',
        species: '',
        breed: '',
        avatar: '',
        microchip: '',
        gender: '',
        dob: new Date(),
        wieght: 0,
      },
      consultation: appointment.consultation || null,
    } as Appointment;
  }, []);

  const isDebugEnabled = () => {
    try {
      return (
        typeof window !== 'undefined' &&
        (import.meta as any)?.env?.DEV &&
        window.localStorage?.getItem('debug_dashboard') === '1'
      );
    } catch {
      return false;
    }
  };

  const logDebug = (message: string, payload?: any) => {
    if (!isDebugEnabled()) return;
    // eslint-disable-next-line no-console
    console.debug(`[dashboard-updates] ${message}`, payload || '');
  };

  const shouldDeduplicate = (key: string, ttlMs = 5000) => {
    const now = Date.now();
    const last = recentEventsRef.current.get(key);
    if (last && now - last < ttlMs) {
      return true;
    }
    recentEventsRef.current.set(key, now);
    // Cleanup old entries
    for (const [k, ts] of recentEventsRef.current.entries()) {
      if (now - ts > ttlMs * 2) {
        recentEventsRef.current.delete(k);
      }
    }
    return false;
  };

  // Handle appointment updated event
  const handleAppointmentUpdated = useCallback((data: any) => {
    const callbacks = callbacksRef.current;
    const appointment = normalizeAppointment(data);
    
    if (appointment && callbacks.onAppointmentUpdated) {
      const eventKey = `${appointment.uuid || 'unknown'}-${appointment.status || 'unknown'}-updated`;
      if (shouldDeduplicate(eventKey)) {
        logDebug('dedup appointment.updated', { eventKey });
        return;
      }
      logDebug('appointment.updated received', {
        uuid: appointment.uuid,
        status: appointment.status,
        changes: data?.changes || data?.notification?.data?.changes || null,
      });
      callbacks.onAppointmentUpdated(appointment, {
        raw: data,
        changes: data?.changes || data?.notification?.data?.changes || null,
      });
    }
  }, [normalizeAppointment]);

  // Handle appointment created event
  const handleAppointmentCreated = useCallback((data: any) => {
    const callbacks = callbacksRef.current;
    const appointment = normalizeAppointment(data);
    
    if (appointment && callbacks.onAppointmentCreated) {
      const eventKey = `${appointment.uuid || 'unknown'}-${appointment.status || 'unknown'}-created`;
      if (shouldDeduplicate(eventKey)) {
        logDebug('dedup appointment.created', { eventKey });
        return;
      }
      logDebug('appointment.created received', {
        uuid: appointment.uuid,
        status: appointment.status,
      });
      callbacks.onAppointmentCreated(appointment);
    }
  }, [normalizeAppointment]);

  const handleNotification = useCallback((data: any) => {
    const callbacks = callbacksRef.current;
    const appointment = normalizeAppointment(data);
    if (!appointment) return;

    const eventKey = `${appointment.uuid || 'unknown'}-${appointment.status || 'unknown'}-notification`;
    if (shouldDeduplicate(eventKey)) {
      logDebug('dedup notification', { eventKey });
      return;
    }

    logDebug('notification received', {
      uuid: appointment.uuid,
      status: appointment.status,
      type: data?.type || data?.notification?.data?.type || null,
    });

    if (callbacks.onAppointmentUpdated) {
      callbacks.onAppointmentUpdated(appointment, {
        raw: data,
        changes: data?.changes || data?.notification?.data?.changes || null,
      });
    }
  }, [normalizeAppointment]);

  // Use Pusher to listen for events
  usePusher({
    userId: user?.id as number | null,
    onAppointmentUpdated: handleAppointmentUpdated,
    onAppointmentCreated: handleAppointmentCreated,
    onNotification: handleNotification,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLocalUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent?.detail;
      if (!detail) return;

      const payload = detail.appointment
        ? { appointment: detail.appointment, changes: detail.changes }
        : detail;

      logDebug('local appointment.updated received', detail);
      handleAppointmentUpdated(payload);
    };

    window.addEventListener('appointment.updated.local', handleLocalUpdate);
    return () => {
      window.removeEventListener('appointment.updated.local', handleLocalUpdate);
    };
  }, [handleAppointmentUpdated]);

  return {
    // Return any helper functions if needed
  };
}

