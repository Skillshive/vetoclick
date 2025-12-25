import axios from 'axios';

export interface Notification {
  id: string;
  type: string;
  data: {
    type: string;
    title: string;
    message: string;
    appointment?: any;
    time: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  unread_count: number;
}

export interface LatestNotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unread_count: number;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (params?: {
  per_page?: number;
  unread_only?: boolean;
  page?: number;
}): Promise<NotificationResponse> => {
  const response = await axios.get('/api/notifications', { 
    params,
    withCredentials: true 
  });
  return response.data;
};

/**
 * Get latest notifications
 */
export const getLatestNotifications = async (limit: number = 5): Promise<LatestNotificationsResponse> => {
  const response = await axios.get('/api/notifications/latest', {
    params: { limit },
    withCredentials: true
  });
  return response.data;
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await axios.get('/api/notifications/unread-count', {
    withCredentials: true
  });
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post(`/api/notifications/${notificationId}/read`, {}, {
    withCredentials: true
  });
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post('/api/notifications/mark-all-read', {}, {
    withCredentials: true
  });
  return response.data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`/api/notifications/${notificationId}`, {
    withCredentials: true
  });
  return response.data;
};

/**
 * Delete all read notifications
 */
export const deleteAllReadNotifications = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete('/api/notifications/read/all', {
    withCredentials: true
  });
  return response.data;
};

