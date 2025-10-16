import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');
  private connectedClients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
    
    // Send welcome message
    client.emit('connected', {
      message: 'Connected to notification service',
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    client.emit('joined_room', { room, timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    client.emit('left_room', { room, timestamp: new Date().toISOString() });
  }

  // Broadcast notification to all connected clients
  broadcastNotification(notification: NotificationPayload) {
    this.logger.log(`Broadcasting notification: ${notification.type}`);
    this.server.emit('notification', notification);
  }

  // Send notification to specific room (e.g., admin users)
  sendToRoom(room: string, notification: NotificationPayload) {
    this.logger.log(`Sending notification to room ${room}: ${notification.type}`);
    this.server.to(room).emit('notification', notification);
  }

  // Send notification to specific client
  sendToClient(clientId: string, notification: NotificationPayload) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      this.logger.log(`Sending notification to client ${clientId}: ${notification.type}`);
      client.emit('notification', notification);
    }
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get all connected client IDs
  getConnectedClientIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}

