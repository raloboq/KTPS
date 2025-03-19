import * as Y from 'yjs';
import { io, Socket } from 'socket.io-client';

export interface CursorPosition {
  index: number;
  length: number;
}

export interface UserInfo {
  name: string;
  color: string;
  picture?: string;
}

export class SocketIOProvider {
  private socket: Socket;
  doc: Y.Doc;
  private documentId: string;
  private userName: string;
  private userInfo: UserInfo;
  private awareness = new Map<string, {user: UserInfo, cursor: CursorPosition | null}>();
  private _callbacks = new Map<string, Set<Function>>();

  constructor(doc: Y.Doc, documentId: string, userName: string, userInfo: UserInfo) {
    this.doc = doc;
    this.documentId = documentId;
    this.userName = userName;
    this.userInfo = userInfo;
    
    // Asegurar que tenemos un protocolo y host válidos
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001';
    
    // Inicializar socket
    this.socket = io(socketUrl);
    
    // Configurar event listeners
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('sync-document', this.onSyncDocument.bind(this));
    this.socket.on('sync-update', this.onUpdate.bind(this));
    this.socket.on('cursor-update', this.onCursorUpdate.bind(this));
    this.socket.on('user-joined', this.onUserJoined.bind(this));
    this.socket.on('user-left', this.onUserLeft.bind(this));
    
    // Escuchar cambios locales del documento
    doc.on('update', this.onDocumentUpdate.bind(this));
  }

  private onConnect() {
    console.log('Conectado al servidor Socket.io');
    this.socket.emit('join-document', this.documentId, this.userName);
  }

  private onSyncDocument(update: Uint8Array) {
    console.log('Recibido estado inicial del documento');
    Y.applyUpdate(this.doc, update);
    this.emit('synced', {});
  }

  private onUpdate(update: Uint8Array) {
    console.log('Recibida actualización del documento');
    Y.applyUpdate(this.doc, update);
  }

  private onDocumentUpdate(update: Uint8Array, origin: any) {
    // Solo enviar actualizaciones que no vinieron del servidor
    if (origin !== this) {
      console.log('Enviando actualización al servidor');
      this.socket.emit('sync-update', update);
    }
  }

  private onCursorUpdate(data: {socketId: string, userName: string, cursor: CursorPosition}) {
    this.awareness.set(data.socketId, {
      user: {
        name: data.userName,
        color: this.getRandomColor(data.userName)
      },
      cursor: data.cursor
    });
    
    this.emit('awareness', {
      added: [data.socketId]
    });
  }

  private onUserJoined(data: {socketId: string, userName: string}) {
    console.log(`Usuario unido: ${data.userName}`);
    this.awareness.set(data.socketId, {
      user: {
        name: data.userName,
        color: this.getRandomColor(data.userName)
      },
      cursor: null
    });
    
    this.emit('awareness', {
      added: [data.socketId]
    });
  }

  private onUserLeft(data: {socketId: string, userName: string}) {
    console.log(`Usuario desconectado: ${data.userName}`);
    this.awareness.delete(data.socketId);
    
    this.emit('awareness', {
      removed: [data.socketId]
    });
  }

  // Método para enviar actualizaciones de cursor
  setCursor(position: CursorPosition | null) {
    this.socket.emit('cursor-update', { cursor: position });
  }

  // Método para obtener la lista de usuarios conectados
  getStates() {
    return this.awareness;
  }

  // Sistema de eventos simple
  on(event: string, callback: Function) {
    if (!this._callbacks.has(event)) {
      this._callbacks.set(event, new Set());
    }
    this._callbacks.get(event)?.add(callback);
  }

  off(event: string, callback: Function) {
    this._callbacks.get(event)?.delete(callback);
  }

  emit(event: string, data: any) {
    this._callbacks.get(event)?.forEach(callback => callback(data));
  }

  // Utilitario para generar colores consistentes para usuarios
  private getRandomColor(name: string): string {
    // Simple hash para generar un color basado en el nombre
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
    ];
    
    // Usar el hash para seleccionar un color del array
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  // Limpieza
  destroy() {
    this.doc.off('update', this.onDocumentUpdate);
    this.socket.disconnect();
    this._callbacks.clear();
  }
}