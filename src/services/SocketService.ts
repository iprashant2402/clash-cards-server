import { Service } from "typedi";
import { Socket } from "socket.io";
import { Server } from "socket.io";

@Service()
export class SocketService {
  private io!: Server;

  setIo(io: Server) {
    this.io = io;
  }

  async joinRoom(socket: Socket, roomId: string): Promise<void> {
    await socket.join(roomId);
  }

  async emitToRoom(roomId: string, event: string, data: any): Promise<void> {
    this.io.to(roomId).emit(event, data);
  }
}
