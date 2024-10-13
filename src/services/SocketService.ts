import { Inject, Service } from "typedi";
import { Socket } from "socket.io";
import { Server } from "socket.io";
import { SocketEvents } from "../utils/socketEvents";

@Service()
export class SocketService {
  private io: Server;

  constructor(@Inject("sockets-server") io: Server) {
    this.io = io;
  }

  async joinRoom(socket: Socket, roomId: string): Promise<void> {
    await socket.join(roomId);
  }

  async emitToRoom(
    roomId: string,
    event: SocketEvents,
    data: any
  ): Promise<void> {
    this.io.to(roomId).emit(event, data);
  }
}
