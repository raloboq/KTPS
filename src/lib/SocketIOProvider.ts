// La clase SocketIOProvider ya está implementada en tu código,
// pero aquí hay algunas recomendaciones de mejoras y verificaciones

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

// Implementación de la clase Awareness para compatibilidad con Tiptap
class SocketAwareness {
  private localState: Record<string, any> = {};
  private states = new Map<string, Record<string, any>>();
  private _callbacks = new Map<string, Set<Function>>();

  constructor(private provider: SocketIOProvider) {}

  setLocalStateField(field: string, value: any) {
    this.localState[field] = value;
    // Cuando se actualiza el estado local, notificamos al provider
    if (field === 'cursor') {
      this.provider.setCursor(value);
    }
    this.emit('update', [{ added: [], updated: [this.provider.clientId], removed: [] }]);
    return this;
  }

  getLocalState() {
    return this.localState;
  }

  getStates() {
    const result = new Map();
    // Incluimos el estado local en el resultado
    result.set(this.provider.clientId, this.localState);
    // Incluimos los estados de otros usuarios
    this.states.forEach((state, key) => {
      if (key !== this.provider.clientId) {
        result.set(key, state);
      }
    });
    return result;
  }

  // Sistema de eventos para awareness
  on(event: string, callback: Function) {
    if (!this._callbacks.has(event)) {
      this._callbacks.set(event, new Set());
    }
    this._callbacks.get(event)?.add(callback);
    return this;
  }

  off(event: string, callback: Function) {
    this._callbacks.get(event)?.delete(callback);
    return this;
  }

  emit(event: string, data: any) {
    this._callbacks.get(event)?.forEach(callback => callback(data));
  }

  // Para uso interno
  updateRemoteState(clientId: string, state: Record<string, any>) {
    const prevState = this.states.get(clientId);
    this.states.set(clientId, state);
    
    this.emit('update', [{ 
      added: prevState ? [] : [clientId],
      updated: prevState ? [clientId] : [],
      removed: []
    }]);
  }

  removeRemoteState(clientId: string) {
    if (this.states.has(clientId)) {
      this.states.delete(clientId);
      this.emit('update', [{ added: [], updated: [], removed: [clientId] }]);
    }
  }

  destroy() {
    this._callbacks.clear();
    this.states.clear();
  }
}

export class SocketIOProvider {
  private socket!: Socket;
  doc: Y.Doc;
  private documentId: string;
  private userName: string;
  private userInfo: UserInfo;
  clientId: string; // ID único para este cliente
  awareness: SocketAwareness;
  private _connected = false;
  private _reconnectAttempts = 0;
  private _maxReconnectAttempts = 5;
  private _callbacks = new Map<string, Set<Function>>();

  constructor(doc: Y.Doc, documentId: string, userName: string, userInfo: UserInfo) {
    this.doc = doc;
    this.documentId = documentId;
    this.userName = userName;
    this.userInfo = userInfo;
    this.clientId = Math.random().toString(36).substring(2, 15);
    this.awareness = new SocketAwareness(this);
    
    // Asegurar que tenemos un protocolo y host válidos
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001';
    //console.log('Conectando a Socket.IO en:', socketUrl);
    console.log(`Intentando conectar a Socket.IO en: ${socketUrl} con parámetros:`, {
        roomId: documentId,
        userName: userName
      });

    try {
      // Mejorar opciones de Socket.io
      this.socket = io(socketUrl, {
        query: {
          roomId: documentId,
          userName: userName
        },
        reconnectionAttempts: this._maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling'], // Intentar ambos métodos de transporte
        autoConnect: true
      });
      
      // Configurar event listeners
      this.socket.on('connect', this.onConnect.bind(this));
      this.socket.on('disconnect', this.onDisconnect.bind(this));
      this.socket.on('connect_error', this.onConnectError.bind(this));
      this.socket.on('sync-document', this.onSyncDocument.bind(this));
      this.socket.on('sync-update', this.onUpdate.bind(this));
      this.socket.on('cursor-update', this.onCursorUpdate.bind(this));
      this.socket.on('user-joined', this.onUserJoined.bind(this));
      this.socket.on('user-left', this.onUserLeft.bind(this));
      
      // Escuchar cambios locales del documento
      doc.on('update', this.onDocumentUpdate.bind(this));
    } catch (error) {
      console.error('Error al inicializar Socket.IO:', error);
    }
  }

  private onConnect() {
    console.log(`Socket.IO conectado con ID: ${this.socket.id}`);
    this._connected = true;
    this._reconnectAttempts = 0;
    this.socket.emit('join-document', this.documentId, this.userName);
    this.emit('status', { connected: true });
  }

  private onDisconnect(reason: string) {
    console.log(`Socket.IO desconectado. Razón: ${reason}`);
    this._connected = false;
    this.emit('status', { connected: false, reason });
  }

  private onConnectError(error: Error) {
    console.error('Error de conexión al servidor Socket.io:', error);
    this._reconnectAttempts++;
    
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      console.error('Número máximo de intentos de reconexión alcanzado');
      this.emit('error', { message: 'No se pudo conectar al servidor de colaboración' });
    }
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
    if (origin !== this && this._connected) {
      console.log('Enviando actualización al servidor');
      this.socket.emit('sync-update', update);
    }
  }

  private onCursorUpdate(data: {socketId: string, userName: string, cursor: CursorPosition}) {
    console.log('Cursor actualizado para:', data.userName);
    
    // Actualizar el estado de awareness para este usuario
    this.awareness.updateRemoteState(data.socketId, {
      user: {
        name: data.userName,
        color: this.getRandomColor(data.userName),
        picture: this.userInfo.picture
      },
      cursor: data.cursor
    });
  }

  private onUserJoined(data: {socketId: string, userName: string}) {
    console.log(`Usuario unido: ${data.userName}`);
    
    // Añadir el usuario al awareness
    this.awareness.updateRemoteState(data.socketId, {
      user: {
        name: data.userName,
        color: this.getRandomColor(data.userName),
        picture: this.userInfo.picture
      }
    });
  }

  private onUserLeft(data: {socketId: string, userName: string}) {
    console.log(`Usuario desconectado: ${data.userName}`);
    
    // Quitar el usuario del awareness
    this.awareness.removeRemoteState(data.socketId);
  }

  // Método para enviar actualizaciones de cursor
  setCursor(position: CursorPosition | null) {
    if (this._connected) {
      this.socket.emit('cursor-update', { cursor: position });
    }
    return this;
  }

  // Método para verificar si está conectado
  isConnected() {
    return this._connected;
  }

  // Sistema de eventos simple
  on(event: string, callback: Function) {
    if (!this._callbacks.has(event)) {
      this._callbacks.set(event, new Set());
    }
    this._callbacks.get(event)?.add(callback);
    return this;
  }

  off(event: string, callback: Function) {
    this._callbacks.get(event)?.delete(callback);
    return this;
  }

  emit(event: string, data: any) {
    this._callbacks.get(event)?.forEach(callback => callback(data));
  }

  // Solicitar documento completo al servidor (útil para sincronización manual)
  sync() {
    if (this._connected) {
      this.socket.emit('sync-request', this.documentId);
    }
    return this;
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
    this.awareness.destroy();
    this.socket.disconnect();
    this._callbacks.clear();
  }
}