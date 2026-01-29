import Pusher from 'pusher-js';

let pusherInstance: Pusher | null = null;

export const initializePusher = (userId: number | null, pusherConfig?: { key?: string; cluster?: string }): Pusher | null => {
  if (!userId) {
    console.warn('[Pusher] Initialization skipped: userId is null/undefined');
    return null;
  }

  const pusherKey = pusherConfig?.key || 
                    (window as any).PUSHER_APP_KEY || 
                    import.meta.env.VITE_PUSHER_APP_KEY;
  const pusherCluster = pusherConfig?.cluster || 
                       (window as any).PUSHER_APP_CLUSTER || 
                       import.meta.env.VITE_PUSHER_APP_CLUSTER || 
                       'mt1';

  if (!pusherKey) {
    console.error('[Pusher] Initialization failed: Pusher key not found', {
      configKey: pusherConfig?.key,
      windowKey: (window as any).PUSHER_APP_KEY,
      envKey: import.meta.env.VITE_PUSHER_APP_KEY,
    });
    return null;
  }

  if (pusherInstance) {
    console.log('[Pusher] Returning existing instance', {
      state: pusherInstance.connection.state,
      socketId: pusherInstance.connection.socket_id,
    });
    return pusherInstance;
  }

  console.log('[Pusher] Creating new instance', {
    userId,
    key: pusherKey.substring(0, 10) + '...',
    cluster: pusherCluster,
  });

  pusherInstance = new Pusher(pusherKey, {
    cluster: pusherCluster,
    authEndpoint: '/broadcasting/auth',
    auth: {
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
    },
    enabledTransports: ['ws', 'wss'],
    disabledTransports: [],
  });

  // Add connection state logging
  pusherInstance.connection.bind('connecting', () => {
    console.log('[Pusher] Connection state: CONNECTING');
  });

  pusherInstance.connection.bind('connected', () => {
    console.log('[Pusher] Connection state: CONNECTED', {
      socketId: pusherInstance?.connection.socket_id,
    });
  });

  pusherInstance.connection.bind('disconnected', () => {
    console.log('[Pusher] Connection state: DISCONNECTED');
  });

  pusherInstance.connection.bind('failed', () => {
    console.error('[Pusher] Connection state: FAILED');
  });

  pusherInstance.connection.bind('error', (err: any) => {
    console.error('[Pusher] Connection error:', err);
  });

  pusherInstance.connection.bind('state_change', (states: { previous: string; current: string }) => {
    console.log('[Pusher] State change:', states);
  });

  // Log WebSocket errors
  pusherInstance.connection.bind('unavailable', () => {
    console.error('[Pusher] Connection unavailable - WebSocket transport unavailable');
  });

  pusherInstance.connection.bind('closed', () => {
    console.warn('[Pusher] Connection closed');
  });

  return pusherInstance;
};

export const getPusherInstance = (): Pusher | null => {
  return pusherInstance;
};

export const disconnectPusher = (): void => {
  if (pusherInstance) {
    const connectionState = pusherInstance.connection.state;
    const socketId = pusherInstance.connection.socket_id;
    
    console.log('[Pusher] Disconnecting...', {
      state: connectionState,
      socketId: socketId,
      stackTrace: new Error().stack,
    });

    // Only disconnect if connection is established
    // Avoid disconnecting while "connecting" to prevent WebSocket errors
    if (connectionState === 'connected') {
      try {
        pusherInstance.disconnect();
        console.log('[Pusher] Disconnected successfully');
      } catch (error) {
        console.error('[Pusher] Error during disconnect:', error);
      }
      pusherInstance = null;
    } else if (connectionState === 'connecting') {
      // If still connecting, just clear the instance reference
      // The connection will fail naturally or can be cleaned up later
      console.warn('[Pusher] Connection still connecting - clearing instance reference without forcing disconnect');
      pusherInstance = null;
    } else {
      // Already disconnected, failed, or unavailable
      console.log('[Pusher] Connection already inactive, cleaning up', {
        state: connectionState,
      });
      pusherInstance = null;
    }
  } else {
    console.log('[Pusher] Disconnect called but no instance exists');
  }
};

