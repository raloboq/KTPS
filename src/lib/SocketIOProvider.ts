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
  private _reconnecting = false;
  private _reconnectAttempts = 0;
  private _maxReconnectAttempts = 10;
  private _callbacks = new Map<string, Set<Function>>();
  private _pingInterval: NodeJS.Timeout | null = null;
  private _connectionCheckInterval: NodeJS.Timeout | null = null;
  private _documentUpdateHandler: (update: Uint8Array, origin: any) => void;
  private _sessionErrorDetected = false;

  constructor(doc: Y.Doc, documentId: string, userName: string, userInfo: UserInfo) {
    this.doc = doc;
    this.documentId = documentId;
    this.userName = userName;
    this.userInfo = userInfo;
    this.clientId = Math.random().toString(36).substring(2, 15);
    this.awareness = new SocketAwareness(this);
    
    // Generar un ID único para este cliente en esta sesión
    const sessionClientId = `${this.clientId}-${Date.now()}`;
    
    // Asegurar que tenemos un protocolo y host válidos
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001';
    console.log('Conectando a Socket.IO en:', socketUrl, {
      documentId,
      userName,
      clientId: sessionClientId
    });

    // Definir el manejador de actualizaciones del documento fuera del constructor
    this._documentUpdateHandler = this.onDocumentUpdate.bind(this);

    try {
      // Configuración del socket con enfoque en evitar problemas de ID de sesión
      this.socket = io(socketUrl, {
        // IMPORTANTE: Usar solo polling para mayor estabilidad
        transports: ['polling'],
        upgrade: false,
        
        // Configuración para manejar errores de sesión
        reconnection: true,
        reconnectionAttempts: 5,      // Intentar reconectar 5 veces antes de crear un socket nuevo
        reconnectionDelay: 1000,      // Comenzar con 1 segundo
        reconnectionDelayMax: 5000,   // Máximo 5 segundos
        randomizationFactor: 0.5,     // Factor de aleatoriedad en los tiempos
        
        // Evitar timeouts cortos
        timeout: 20000,               // 20 segundos para conexión inicial
        
        // Información para el servidor
        query: {
          roomId: documentId,
          userName: userName,
          clientId: sessionClientId    // Incluir el ID del cliente para mejor tracking
        },
        
        // Otras configuraciones críticas
        forceNew: true,               // Forzar una nueva conexión (no reutilizar)
        withCredentials: false,       // No enviar cookies
        autoConnect: true,            // Conectar automáticamente

        // Configuración adicional para evitar problemas de sesión
        path: '/socket.io/',          // Asegurarnos de la ruta correcta
      });

      console.log('Socket creado con opciones:', this.socket.io.opts);
      
      // Configurar event listeners
      this.socket.on('connect', this.onConnect.bind(this));
      this.socket.on('disconnect', this.onDisconnect.bind(this));
      this.socket.on('connect_error', this.onConnectError.bind(this));
      this.socket.on('error', this.onError.bind(this));
      this.socket.on('reconnect_attempt', this.onReconnectAttempt.bind(this));
      this.socket.on('reconnect_error', this.onReconnectError.bind(this));
      this.socket.on('reconnect_failed', this.onReconnectFailed.bind(this));
      
      // Listeners específicos de la aplicación
      this.socket.on('sync-document', this.onSyncDocument.bind(this));
      this.socket.on('sync-update', this.onUpdate.bind(this));
      this.socket.on('cursor-update', this.onCursorUpdate.bind(this));
      this.socket.on('user-joined', this.onUserJoined.bind(this));
      this.socket.on('user-left', this.onUserLeft.bind(this));
      this.socket.on('pong', this.onPong.bind(this));
      
      // Crear un intervalo para verificar la salud de la conexión
      this._connectionCheckInterval = setInterval(() => {
        this.checkConnectionHealth();
      }, 15000); // Cada 15 segundos
      
      // Escuchar cambios locales del documento
      doc.on('update', this._documentUpdateHandler);
    } catch (error) {
      console.error('Error al inicializar Socket.IO:', error);
    }
  }

  private onConnect() {
    console.log('🟢 Conectado al servidor Socket.io con ID:', this.socket.id);
    this._connected = true;
    this._reconnecting = false;
    this._reconnectAttempts = 0;
    this._sessionErrorDetected = false;
    
    // Unirse al documento inmediatamente
    this.socket.emit('join-document', this.documentId, this.userName);
    
    // Programar un ping regular para mantener activa la conexión
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
    }
    
    this._pingInterval = setInterval(() => {
      if (this._connected) {
        this.socket.emit('ping', { 
          timestamp: Date.now(),
          clientId: this.clientId
        });
      }
    }, 10000); // Ping cada 10 segundos
    
    this.emit('status', { connected: true });
  }

  private onDisconnect(reason: string) {
    console.log('🔴 Desconectado del servidor Socket.io. Razón:', reason);
    this._connected = false;
    
    // Verificar si hay un problema con la ID de sesión
    if (reason === 'io server disconnect' || reason === 'io client disconnect') {
      console.log('Desconexión solicitada por el servidor o cliente, creando nueva conexión');
      this._sessionErrorDetected = true;
      this.recreateSocket(); // El servidor nos desconectó, mejor crear una conexión nueva
      return;
    }
    
    // Limpiar el intervalo de ping al desconectar
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
    
    this.emit('status', { connected: false, reason });
  }

  private onConnectError(error: Error) {
    console.error('🔴 Error de conexión al servidor Socket.io:', error);
    
    // Verificar si es un error de sesión
    if (
      error.message.includes('Session ID unknown') || 
      error.message.includes('Invalid session') ||
      error.message.includes('Session closed')
    ) {
      console.log('Detectado error de sesión, recreando socket en lugar de reconectar');
      this._sessionErrorDetected = true;
      this.recreateSocket();
      return;
    }
    
    this._reconnectAttempts++;
    
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      console.error('🔴 Número máximo de intentos de reconexión alcanzado, recreando socket');
      this.recreateSocket();
    }
  }
  
  private onError(error: Error) {
    console.error('Error en socket:', error);
    
    // Verificar si es un error relacionado con la sesión
    if (
      error.message.includes('Session ID unknown') || 
      error.message.includes('Invalid session')
    ) {
      console.log('Detectado error de sesión, recreando socket');
      this._sessionErrorDetected = true;
      this.recreateSocket();
    }
  }
  
  private onReconnectAttempt(attemptNumber: number) {
    console.log(`Intento de reconexión #${attemptNumber}`);
    this._reconnecting = true;
    
    // Si detectamos un error de sesión, detener los intentos de reconexión
    if (this._sessionErrorDetected) {
      console.log('Error de sesión detectado, cancelando reconexión');
      this.socket.disconnect();
      this.recreateSocket();
    }
  }
  
  private onReconnectError(error: Error) {
    console.error('Error durante reconexión:', error);
    
    // Verificar si es un error relacionado con la sesión
    if (
      error.message.includes('Session ID unknown') || 
      error.message.includes('Invalid session')
    ) {
      console.log('Error de sesión en reconexión, recreando socket');
      this._sessionErrorDetected = true;
      this.recreateSocket();
    }
  }
  
  private onReconnectFailed() {
    console.error('Falló la reconexión después de todos los intentos');
    this._reconnecting = false;
    this.recreateSocket();
  }

  private onSyncDocument(update: Uint8Array) {
    console.log('Recibido estado inicial del documento');
    try {
      Y.applyUpdate(this.doc, update);
      this.emit('synced', {});
    } catch (error) {
      console.error('Error al aplicar actualización inicial:', error);
    }
  }

  private onUpdate(update: Uint8Array) {
    console.log('Recibida actualización del documento');
    try {
      Y.applyUpdate(this.doc, update);
    } catch (error) {
      console.error('Error al aplicar actualización:', error);
      // Solicitar resincronización completa en caso de error
      this.sync();
    }
  }

  private onDocumentUpdate(update: Uint8Array, origin: any) {
    // Solo enviar actualizaciones que no vinieron del servidor
    if (origin !== this && this._connected) {
      console.log('Enviando actualización al servidor');
      try {
        this.socket.emit('sync-update', update);
      } catch (error) {
        console.error('Error al enviar actualización:', error);
      }
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
  
  private onPong(data: any) {
    console.log('Pong recibido del servidor:', data);
  }
  
  private checkConnectionHealth() {
    // Si estamos en medio de una reconexión, no interferir
    if (this._reconnecting) {
      console.log('Verificación de salud saltada: reconexión en progreso');
      return;
    }
    
    // Verificar si el socket está realmente conectado según Socket.io
    const isSocketConnected = this.socket && this.socket.connected;
    
    // Si nuestro estado dice conectado pero el socket no lo está
    if (this._connected && !isSocketConnected) {
      console.warn('Inconsistencia de estado: _connected=true pero socket.connected=false, corrigiendo...');
      this._connected = false;
      this.emit('status', { connected: false, reason: 'Inconsistencia de estado detectada' });
      
      // Si detectamos un error de sesión, recrear el socket
      if (this._sessionErrorDetected) {
        this.recreateSocket();
      } else {
        // Intentar reconectar normalmente
        this.socket.connect();
      }
    } else if (isSocketConnected) {
      // Enviar un ping para verificar la conexión
      this.socket.emit('ping', { timestamp: Date.now(), clientId: this.clientId });
    }
  }

  // Método para recrear completamente el socket
  private recreateSocket() {
    console.log('Recreando socket por completo');
    
    try {
      // Limpiar los intervalos actuales
      if (this._pingInterval) {
        clearInterval(this._pingInterval);
        this._pingInterval = null;
      }
      
      // Eliminar los event listeners antiguos
      this.doc.off('update', this._documentUpdateHandler);
      
      // Destruir el socket actual
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }
      
      // Crear un nuevo socket con configuración simplificada y forzando una nueva conexión
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001';
      
      // Crear un nuevo ID de cliente único para evitar problemas con sesiones anteriores
      const newSessionClientId = `${this.clientId}-${Date.now()}`;
      
      this.socket = io(socketUrl, {
        transports: ['polling'],
        upgrade: false,
        reconnection: true,
        reconnectionAttempts: 5,
        forceNew: true,         // CRÍTICO: Forzar una nueva conexión
        autoConnect: true,      // Conectar inmediatamente
        path: '/socket.io/',    // Especificar la ruta para evitar problemas
        query: {
          roomId: this.documentId,
          userName: this.userName,
          clientId: newSessionClientId, // Usar el nuevo ID de cliente
          forceNew: 'true'      // Indicar al servidor que es una nueva conexión
        }
      });
      
      // Reinstalar todos los listeners
      this.socket.on('connect', this.onConnect.bind(this));
      this.socket.on('disconnect', this.onDisconnect.bind(this));
      this.socket.on('connect_error', this.onConnectError.bind(this));
      this.socket.on('error', this.onError.bind(this));
      this.socket.on('reconnect_attempt', this.onReconnectAttempt.bind(this));
      this.socket.on('reconnect_error', this.onReconnectError.bind(this));
      this.socket.on('reconnect_failed', this.onReconnectFailed.bind(this));
      
      this.socket.on('sync-document', this.onSyncDocument.bind(this));
      this.socket.on('sync-update', this.onUpdate.bind(this));
      this.socket.on('cursor-update', this.onCursorUpdate.bind(this));
      this.socket.on('user-joined', this.onUserJoined.bind(this));
      this.socket.on('user-left', this.onUserLeft.bind(this));
      this.socket.on('pong', this.onPong.bind(this));
      
      // Re-agregar el listener de documento
      this.doc.on('update', this._documentUpdateHandler);
      
      // Resetear banderas
      this._sessionErrorDetected = false;
      this._reconnectAttempts = 0;
      this._reconnecting = false;
      
      console.log('Socket recreado, conectando con nuevo ID de cliente:', newSessionClientId);
    } catch (error) {
      console.error('Error al recrear el socket:', error);
      this.emit('error', { message: 'Error grave de conexión. Por favor recarga la página.' });
    }
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
    // Comprobar tanto nuestro estado interno como el estado del socket
    return this._connected && this.socket.connected;
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
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
    
    if (this._connectionCheckInterval) {
      clearInterval(this._connectionCheckInterval);
      this._connectionCheckInterval = null;
    }
    
    this.doc.off('update', this._documentUpdateHandler);
    this.awareness.destroy();
    
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this._callbacks.clear();
  }
  
  // Método público para forzar una reconexión desde cero (útil si la aplicación detecta problemas)
  reconnect() {
    console.log('Forzando reconexión desde el exterior');
    this.recreateSocket();
  }
}