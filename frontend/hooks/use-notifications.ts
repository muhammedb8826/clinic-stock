"use client";

import { useEffect, useState, useCallback } from 'react';
import { notificationService, NotificationPayload, NotificationStats } from '@/lib/notification-service';

export interface UseNotificationsReturn {
  isConnected: boolean;
  notificationPermission: NotificationPermission;
  isServiceWorkerReady: boolean;
  stats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  sendTestNotification: () => void;
  triggerInventoryCheck: () => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update connection status
  const updateConnectionStatus = useCallback(() => {
    setIsConnected(notificationService.isSocketConnected());
    setNotificationPermission(notificationService.getNotificationPermission());
    setIsServiceWorkerReady(notificationService.isServiceWorkerReady());
  }, []);

  // Connect to notification service
  const connect = useCallback(async () => {
    try {
      await notificationService.connect();
      updateConnectionStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, [updateConnectionStatus]);

  // Disconnect from notification service
  const disconnect = useCallback(() => {
    try {
      notificationService.disconnect();
      updateConnectionStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, [updateConnectionStatus]);

  // Send test notification
  const sendTestNotification = useCallback(() => {
    try {
      notificationService.sendTestNotification();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test notification');
    }
  }, []);

  // Trigger inventory check
  const triggerInventoryCheck = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await notificationService.triggerInventoryCheck();
      if (!success) {
        setError('Failed to trigger inventory check');
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger inventory check');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh notification stats
  const refreshStats = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newStats = await notificationService.getNotificationStats();
      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for notification stats updates
  useEffect(() => {
    const handleStatsUpdate = () => {
      refreshStats();
    };

    window.addEventListener('notificationStatsUpdated', handleStatsUpdate);
    
    return () => {
      window.removeEventListener('notificationStatsUpdated', handleStatsUpdate);
    };
  }, [refreshStats]);

  // Initialize connection and stats on mount
  useEffect(() => {
    updateConnectionStatus();
    refreshStats();
    
    // Auto-connect if not already connected
    if (!isConnected) {
      connect().catch(console.error);
    }
  }, [connect, updateConnectionStatus, refreshStats, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect on unmount as other components might be using it
      // The service is a singleton and will handle cleanup appropriately
    };
  }, []);

  return {
    isConnected,
    notificationPermission,
    isServiceWorkerReady,
    stats,
    isLoading,
    error,
    connect,
    disconnect,
    sendTestNotification,
    triggerInventoryCheck,
    refreshStats,
  };
}

// Hook for notification components
export function useNotificationStats() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const newStats = await notificationService.getNotificationStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
    
    const handleStatsUpdate = () => {
      refreshStats();
    };

    window.addEventListener('notificationStatsUpdated', handleStatsUpdate);
    
    return () => {
      window.removeEventListener('notificationStatsUpdated', handleStatsUpdate);
    };
  }, [refreshStats]);

  return { stats, isLoading, refreshStats };
}
