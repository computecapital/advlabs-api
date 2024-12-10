import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://206.42.19.112:3003'],
    methods: ['GET', 'POST'],
  },
})
export class FileUpdatesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Set<string>();

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
    this.connectedClients.add(client.id);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
    this.connectedClients.delete(client.id);
  }

  announceUpdateFiles(data?: Record<string, string>) {
    console.log('Announcing update files to all clients.');
    this.server.emit('update-files', { message: 'Files have been updated.', ...data });
  }
}
