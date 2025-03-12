import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket }
  from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LobbyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    
  }

  handleConnection(client: Socket) {
    

  }

  handleDisconnect(client: Socket) {
    
  }

  @SubscribeMessage('joinLobbyRoom')
  handleJoinLobbyRoom(
    @MessageBody() lobbyId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(lobbyId);
    
    return { event: 'joinedLobbyRoom', data: lobbyId };
  }


  @SubscribeMessage('leaveLobbyRoom')
  handleLeaveLobbyRoom(
    @MessageBody() lobbyId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.leave(lobbyId);
    
    return { event: 'leftLobbyRoom', data: lobbyId };
  }
}
