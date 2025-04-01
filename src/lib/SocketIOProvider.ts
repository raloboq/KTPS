/*
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
  private _pingInterval: NodeJS.Timeout | null = null; // Añadir esta propiedad
  

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
    console.log('Conectando a Socket.IO en:', socketUrl, {
        documentId,
        userName,
        clientId: this.clientId
      });

    try {
      // Mejorar opciones de Socket.io
      this.socket = io(socketUrl, {
        

        transports: ['polling'],  // Usar SOLO polling
        upgrade: false,           // No intentar actualizar a WebSocket
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: 100, // Intentar muchísimas veces
        forceNew: true,           // Forzar una nueva conexión
        timeout: 60000,           // Timeout de 60 segundos
        query: {
          roomId: documentId,
          userName: userName
        }
     
      });

      console.log('Socket creado con opciones:', this.socket.io.opts);
      
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
    console.log('🟢 Conectado al servidor Socket.io con ID:', this.socket.id);
    this._connected = true;
    this._reconnectAttempts = 0;
    this.socket.emit('join-document', this.documentId, this.userName);

    // Unirse al documento
  this.socket.emit('join-document', this.documentId, this.userName);
  
  // Programar un ping regular para mantener activa la conexión
  if (this._pingInterval) {
    clearInterval(this._pingInterval);
  }
  
  this._pingInterval = setInterval(() => {
    if (this._connected) {
      console.log('Enviando ping para mantener conexión activa');
      this.socket.emit('ping', { timestamp: Date.now() });
    }
  }, 20000); // Ping cada 20 segundos
  
    this.emit('status', { connected: true });
  }

  private onDisconnect(reason: string) {
    console.log('🔴 Desconectado del servidor Socket.io. Razón:', reason);
    this._connected = false;
    this.emit('status', { connected: false, reason });
  }

  private onConnectError(error: Error) {
    console.error('🔴 Error de conexión al servidor Socket.io:', error, {
        message: error.message,
        details: JSON.stringify(error)
      })
    this._reconnectAttempts++;
    
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
        console.error('🔴 Número máximo de intentos de reconexión alcanzado');
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
}*/
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
  private _pingInterval: NodeJS.Timeout | null = null;

  constructor(doc: Y.Doc, documentId: string, userName: string, userInfo: UserInfo) {
    this.doc = doc;
    this.documentId = documentId;
    this.userName = userName;
    this.userInfo = userInfo;
    this.clientId = Math.random().toString(36).substring(2, 15);
    this.awareness = new SocketAwareness(this);
    
    // Asegurar que tenemos un protocolo y host válidos
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://37.27.189.148';
    console.log('Conectando a Socket.IO en:', socketUrl, {
      documentId,
      userName,
      clientId: this.clientId
    });

    try {
      // Configuración mejorada del socket
      this.socket = io(socketUrl, {
        
        path: '/socket.io/',
        transports: ['polling', 'websocket'],
        upgrade: true,    
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceBase64: false, 
        auth: {
          roomId: documentId,
          userName: userName,
          clientId: this.clientId
        }
      });
      (window as any).socket = this.socket;
      console.log('Socket creado con opciones:', this.socket.io.opts);
      
      // Configurar event listeners
      this.socket.on('connect', this.onConnect.bind(this));
      this.socket.on('disconnect', this.onDisconnect.bind(this));
      this.socket.on('connect_error', this.onConnectError.bind(this));
      this.socket.on('sync-document', this.onSyncDocument.bind(this));
      this.socket.on('sync-update', this.onUpdate.bind(this));
      this.socket.on('cursor-update', this.onCursorUpdate.bind(this));
      this.socket.on('user-joined', this.onUserJoined.bind(this));
      this.socket.on('user-left', this.onUserLeft.bind(this));
      this.socket.on('pong', this.onPong.bind(this));
      this.socket.on('error', this.onError.bind(this));

      this.socket.io.on('reconnect_attempt', () => {
        console.log('🔁 Intentando reconectar...');
      });
      
      this.socket.io.on('reconnect', (attemptNumber: any) => {
        console.log(`✅ Reconectado en el intento ${attemptNumber}`);
      });
      
      this.socket.io.on('reconnect_failed', () => {
        console.log('❌ Falló la reconexión después de varios intentos');
      });
      
      // Escuchar cambios locales del documento
      //doc.on('update', this.onDocumentUpdate.bind(this));

      const fragment = doc.getXmlFragment('default');

fragment.observeDeep(() => {
  const update = Y.encodeStateAsUpdateV2(doc); // ✅ omitimos transaction
  console.log('🆕 Cambio detectado en fragmento XML, enviando update:', update.byteLength, 'bytes');
  
  if (this._connected) {
    this.socket.emit('sync-update', Array.from(update));
  }
});

      //const fragment = doc.getXmlFragment('default');
fragment.observe(event => {
  const update = Y.encodeStateAsUpdate(doc);
  console.log('🆕 Cambio detectado en fragmento XML, enviando update:', update.byteLength, 'bytes');
  if (this._connected) {
    this.socket.emit('sync-update', Array.from(update));
  }
});
      
    } catch (error) {
      console.error('Error al inicializar Socket.IO:', error);
      this.emit('error', { message: 'Error al inicializar Socket.IO' });
    }
  }

  

  private onConnect() {
    console.log('🟢 Conectado al servidor Socket.io con ID:', this.socket.id);
    this._connected = true;
    this._reconnectAttempts = 0;

    this.socket.onAny((event: any, ...args: any) => {
        console.log(`[SOCKET EVENT] ${event}`, args);
      });
    
    // Unirse al documento
    this.socket.emit('join-document', this.documentId, this.userName);
    
    // Programar un ping regular para mantener activa la conexión
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
    }
    
    this._pingInterval = setInterval(() => {
      if (this._connected) {
        console.log('Enviando ping para mantener conexión activa');
        this.socket.emit('ping', { timestamp: Date.now() });
      }
    }, 20000); // Ping cada 20 segundos
    
    this.emit('status', { connected: true });
  }

  private onDisconnect(reason: string) {
    console.log('🔴 Desconectado del servidor Socket.io. Razón:', reason);
    console.log('🔍 ¿Se llama a socket.disconnect() desde algún lugar?');
  console.trace();
    //console.log('¿Intentando reconectar?', this.socket.io._reconnection); 
    this._connected = false;
    
    // Limpiar el intervalo de ping al desconectar
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
    
    this.emit('status', { connected: false, reason });
  }

  private onConnectError(error: Error) {
    console.error('🔴 Error de conexión al servidor Socket.io:', error);
    this._reconnectAttempts++;
    
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      console.error('🔴 Número máximo de intentos de reconexión alcanzado');
      this.emit('error', { message: 'No se pudo conectar al servidor de colaboración' });
    }
  }
  
  private onError(error: any) {
    console.error('Error recibido del servidor:', error);
    this.emit('error', error);
  }
  
  private onPong(data: any) {
    console.log('Pong recibido del servidor:', data.timestamp);
  }
        private onSyncDocument(update: any) {
            try {
              console.log('Recibido estado inicial del documento', {
                tipo: typeof update,
                esArray: Array.isArray(update),
                esUint8Array: update instanceof Uint8Array,
                esArrayBuffer: update instanceof ArrayBuffer,
                constructor: update?.constructor?.name,
                longitud: update?.length || update?.byteLength,
                preview: update instanceof Uint8Array
                  ? `Primeros bytes: ${Array.from(update.slice(0, 10))}`
                  : 'No es Uint8Array'
              });
          
              // 🧠 Conversión robusta a Uint8Array
              if (Array.isArray(update)) {
                update = new Uint8Array(update);
              } else if (update instanceof ArrayBuffer) {
                update = new Uint8Array(update);
              } else if (typeof update === 'object' && update !== null && !(update instanceof Uint8Array)) {
                const values = Object.values(update);
                if (values.every(v => typeof v === 'number')) {
                    update = new Uint8Array(values as number[]);
                } else {
                  throw new Error('❌ Formato inesperado de update');
                }
              }
          
              // 🚨 Validación final
              if (!(update instanceof Uint8Array)) {
                throw new Error('❌ Update recibido no es un Uint8Array válido');
              }
          
              if (update.byteLength < 10) {
                console.warn('⚠️ Documento recibido inválido o muy pequeño, creando uno nuevo');
                Y.applyUpdate(this.doc, Y.encodeStateAsUpdate(new Y.Doc()));
                this.emit('synced', {});
                return;
              }
          
              // ✅ Aplicar el update
              console.log('✅ Aplicando update convertido:', update.byteLength, 'bytes');
              Y.applyUpdate(this.doc, update);
              this.emit('synced', {});
          
            } catch (error) {
              console.error('❌ Error al aplicar estado inicial:', error);
              this.emit('error', { message: 'Error al sincronizar documento' });
          
              // 🕒 Reintento automático tras 2 segundos
              setTimeout(() => {
                if (this._connected) {
                  console.log('🔁 Reintentando sincronización completa...');
                  this.socket.emit('sync-request', this.documentId);
                }
              }, 2000);
            }
          }

    private onUpdate(update: any) {
        try {
          console.log('[SOCKET EVENT] sync-update', update);
      
          if (Array.isArray(update)) {
            update = new Uint8Array(update);
          }
      
          Y.applyUpdate(this.doc, update);
        } catch (error) {
          console.error('Error al aplicar actualización:', error);
          this.emit('error', { message: 'Error al aplicar actualización' });
          this.sync(); // Pedir documento completo en caso de error
        }
      }

  private onDocumentUpdate(update: Uint8Array, origin: any) {
    console.log('⚙️ onDocumentUpdate ejecutado. Origin:', origin);
    if (this._connected) {
  console.log('💌 Enviando update al servidor, tamaño:', update.byteLength);
  this.socket.emit('sync-update', Array.from(update));
}
    // Solo enviar actualizaciones que no vinieron del servidor
    if (origin !== this && this._connected) {
        console.log('💌 Enviando update al servidor, tamaño:', update.byteLength);
        this.socket.emit('sync-update', update);
      } else if (!this._connected) {
        console.log('🔴 No conectado, no se envía update');
      } else {
        console.log('📦 Update con origin indefinido o esperado, igual se envía');
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
      try {
        this.socket.emit('cursor-update', { cursor: position });
      } catch (error) {
        console.error('Error al enviar actualización de cursor:', error);
      }
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
      console.log('Solicitando sincronización completa del documento');
      this.socket.emit('sync-request', this.documentId);
    }
    return this;
  }
  
  // Método para forzar reconexión
  reconnect() {
    console.log('Intentando reconexión manual');
    this.socket.connect();
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
    console.log('💥 Llamando a provider.destroy()');
    console.trace();
    this.doc.off('update', this.onDocumentUpdate);
    
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
    
    this.awareness.destroy();
    //this.socket.disconnect();
    this._callbacks.clear();
  }
}