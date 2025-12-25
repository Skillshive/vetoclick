import Pusher from 'pusher-js';

let pusherInstance: Pusher | null = null;

export const initializePusher = (userId: number | null, pusherConfig?: { key?: string; cluster?: string }): Pusher | null => {
  if (!userId) {
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
    return null;
  }

  if (pusherInstance) {
    return pusherInstance;
  }

  pusherInstance = new Pusher(pusherKey, {
    cluster: pusherCluster,
    authEndpoint: '/broadcasting/auth',
    auth: {
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
    },
  });

  return pusherInstance;
};

export const getPusherInstance = (): Pusher | null => {
  return pusherInstance;
};

export const disconnectPusher = (): void => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
};

