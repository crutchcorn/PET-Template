import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Socket} from 'socket.io-client';

@Injectable()
export class ChatService {
  socket: Socket;

  constructor() {
    this.socket = io('localhost:3000', {});
  }

  send(text: string) {
    this.socket.emit('send', {msg: text});
  }
  // https://github.com/avatsaev/kawachat2-client
}
