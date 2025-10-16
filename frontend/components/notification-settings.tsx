"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotifications } from '@/hooks/use-notifications';
import { 
  Bell, 
  BellOff, 
  Wifi, 
  WifiOff, 
  Settings, 
  TestTube, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export function NotificationSettings() {
  const {
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
  } = useNotifications();

  const [isTesting, setIsTesting] = useState(false);

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      sendTestNotification();
      toast.success('Test notification sent!');
    } catch (error) {
      toast.error('Failed to send test notification');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTriggerCheck = async () => {
    const success = await triggerInventoryCheck();
    if (success) {
      toast.success('Inventory check triggered successfully');
    } else {
      toast.error('Failed to trigger inventory check');
    }
  };

  const getPermissionStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return { icon: CheckCircle, color: 'text-green-600', text: 'Granted' };
      case 'denied':
        return { icon: XCircle, color: 'text-red-600', text: 'Denied' };
      default:
        return { icon: AlertTriangle, color: 'text-amber-600', text: 'Not Requested' };
    }
  };

  const permissionStatus = getPermissionStatus();
  const PermissionIcon = permissionStatus.icon;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Real-time notification connection status and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex gap-2">
              {isConnected ? (
                <Button variant="outline" size="sm" onClick={disconnect}>
                  <WifiOff className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={connect}>
                  <Wifi className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Notification Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Manage browser notification permissions and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PermissionIcon className={`h-4 w-4 ${permissionStatus.color}`} />
              <span className="font-medium">Permission Status</span>
              <Badge variant="outline" className={permissionStatus.color}>
                {permissionStatus.text}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Service Worker</span>
              <Badge variant="outline" className={isServiceWorkerReady ? 'text-green-600' : 'text-red-600'}>
                {isServiceWorkerReady ? 'Ready' : 'Not Ready'}
              </Badge>
            </div>
          </div>

          {notificationPermission === 'denied' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Browser notifications are disabled. To enable them, please update your browser settings 
                and allow notifications for this site.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Notification Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Statistics
          </CardTitle>
          <CardDescription>
            Current inventory alert counts and system status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="ml-2">Loading statistics...</span>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Expired</span>
                </div>
                <Badge variant="destructive">{stats.expired}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Expiring Soon</span>
                </div>
                <Badge variant="secondary">{stats.expiringSoon}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Low Stock</span>
                </div>
                <Badge variant="outline">{stats.lowStock}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
                <Badge variant="destructive">{stats.outOfStock}</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No statistics available
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshStats}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTriggerCheck}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Trigger Check
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Notifications
          </CardTitle>
          <CardDescription>
            Test the notification system to ensure it's working properly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleTestNotification}
              disabled={isTesting}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Sending...' : 'Send Test Notification'}
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            This will send a test notification to verify the system is working correctly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
