import io, { Socket } from 'socket.io-client';

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  private constructor() {
    this.initSocket();
  }

  // Método singleton para garantir que só exista uma instância do SocketService
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Inicializa a conexão com o socket
  private initSocket(): void {
    // Altere a URL conforme sua configuração
    this.socket = io('http://localhost:3000', {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Socket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });
  }

  // Método para registrar eventos
  public on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  // Método para remover um evento
  public off(event: string): void {
    this.socket?.off(event);
  }

  // Método para emitir eventos
  public emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }
}
