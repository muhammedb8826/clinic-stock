"use client";

import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface NotificationPayload {
  type: 'expire_soon' | 'expired' | 'low_stock' | 'out_of_stock';
  title: string;
  message: string;
  medicineId?: number;
  medicineName?: string;
  quantity?: number;
  expiryDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
}

export interface NotificationStats {
  expired: number;
  expiringSoon: number;
  lowStock: number;
  outOfStock: number;
  connectedClients: number;
}

class NotificationService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Reduced from 5
  private reconnectDelay = 2000; // Increased from 1000
  private notificationPermission: NotificationPermission = 'default';
  private isServiceWorkerRegistered = false;

  constructor() {
    this.initializeServiceWorker();
    this.requestNotificationPermission();
    // Auto-connect on initialization
    this.connect().catch(console.error);
  }

  // Initialize Service Worker for push notifications
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.isServiceWorkerRegistered = true;
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  // Request notification permission
  private async requestNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
      console.log('Notification permission:', this.notificationPermission);
    }
  }

  // Check if backend server is available
  private async checkServerAvailability(): Promise<boolean> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://wanofi-api.daminaa.org';
      // Try to fetch the test endpoint first
      const response = await fetch(`${apiUrl}/notifications`, { 
        method: 'GET',
        mode: 'cors'
      });
      return response.ok;
    } catch (error) {
      console.log('Backend server not available:', error);
      return false;
    }
  }

  // Connect to WebSocket
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('Already connected to notification service');
      return;
    }

    // Check if server is available first
    const serverAvailable = await this.checkServerAvailability();
    if (!serverAvailable) {
      console.log('Backend server not available, skipping WebSocket connection');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://wanofi-api.daminaa.org';
    this.socket = io(`${apiUrl}/notifications`, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification service');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join admin room for all notifications
      this.socket?.emit('join_room', 'admin');
      
      // Only show success toast if this is a reconnection
      if (this.reconnectAttempts > 0) {
        toast.success('Reconnected to real-time notifications', {
          description: 'Live updates are now active',
          duration: 3000,
        });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
      this.isConnected = false;
      
      // Attempt to reconnect
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('notification', (notification: NotificationPayload) => {
      this.handleNotification(notification);
    });

    this.socket.on('connected', (data) => {
      console.log('Welcome message:', data);
    });

    this.socket.on('joined_room', (data) => {
      console.log('Joined room:', data);
    });
  }

  // Handle reconnection logic
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(async () => {
        await this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached - disabling notifications');
      // Don't show error toast repeatedly, just log it
      console.warn('Real-time notifications are disabled. The system will work normally without live updates.');
    }
  }

  // Handle incoming notifications
  private handleNotification(notification: NotificationPayload): void {
    console.log('Received notification:', notification);
    
    // Show toast notification
    this.showToastNotification(notification);
    
    // Show browser notification if permission granted
    this.showBrowserNotification(notification);
    
    // Update notification stats if needed
    this.updateNotificationStats();
  }

  // Show toast notification
  private showToastNotification(notification: NotificationPayload): void {
    const icon = this.getNotificationIcon(notification.type);
    const priority = this.getPriorityColor(notification.priority);
    
    toast(notification.title, {
      description: notification.message,
      icon,
      duration: notification.priority === 'urgent' ? 10000 : 5000,
      className: priority,
      action: {
        label: 'View Details',
        onClick: () => {
          // Navigate to medicines page or show details
          window.location.href = '/medicines';
        },
      },
    });
  }

  // Show browser notification
  private showBrowserNotification(notification: NotificationPayload): void {
    if (this.notificationPermission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.type}-${notification.medicineId}`,
        requireInteraction: notification.priority === 'urgent',
        silent: notification.priority === 'low',
      });

      browserNotification.onclick = () => {
        window.focus();
        window.location.href = '/medicines';
        browserNotification.close();
      };

      // Auto-close after 5 seconds unless urgent
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  // Get notification icon based on type
  private getNotificationIcon(type: string) {
    switch (type) {
      case 'expired':
        return '🔴'; // Red circle for expired
      case 'expire_soon':
        return '🟡'; // Yellow circle for expiring soon
      case 'low_stock':
        return '🟠'; // Orange circle for low stock
      case 'out_of_stock':
        return '🔴'; // Red circle for out of stock
      default:
        return '🔔'; // Bell for general notifications
    }
  }

  // Get priority color for toast
  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50 text-red-900';
      case 'high':
        return 'border-orange-500 bg-orange-50 text-orange-900';
      case 'medium':
        return 'border-amber-500 bg-amber-50 text-amber-900';
      case 'low':
        return 'border-blue-500 bg-blue-50 text-blue-900';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-900';
    }
  }

  // Update notification stats (placeholder for future implementation)
  private updateNotificationStats(): void {
    // This could trigger a state update in components that use this service
    // For now, we'll emit a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('notificationStatsUpdated'));
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Disconnected from notification service');
    }
  }

  // Get connection status
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get notification permission status
  getNotificationPermission(): NotificationPermission {
    return this.notificationPermission;
  }

  // Check if service worker is registered
  isServiceWorkerReady(): boolean {
    return this.isServiceWorkerRegistered;
  }

  // Send custom notification (for testing)
  sendTestNotification(): void {
    const testNotification: NotificationPayload = {
      type: 'low_stock',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working',
      priority: 'medium',
      timestamp: new Date().toISOString(),
    };
    
    this.handleNotification(testNotification);
  }

  // Get notification statistics from server
  async getNotificationStats(): Promise<NotificationStats | null> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://wanofi-api.daminaa.org';
      const response = await fetch(`${apiUrl}/notifications/stats`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch notification stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
    
    return null;
  }

  // Manually trigger inventory checks
  async triggerInventoryCheck(): Promise<boolean> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://wanofi-api.daminaa.org';
      const response = await fetch(`${apiUrl}/notifications/check-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to trigger inventory check:', error);
      return false;
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
