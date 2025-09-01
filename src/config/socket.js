let socket = null;
let currentConversationId = null;
let currentUserId = null;
let currentToken = null;
let eventHandlers = {
  message: null,
  open: null,
  close: null,
  error: null
};

// WebSocket state constants for reference
const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;

/**
 * Connect to WebSocket or update handlers if already connected
 * @param {string} conversationId - The conversation ID
 * @param {string} myId - The user ID
 * @param {string} token - Authentication token
 * @param {Function} onMessage - Message handler
 * @param {Function} onOpen - Open connection handler
 * @param {Function} onClose - Close connection handler
 * @param {Function} onError - Error handler
 */
export function connectWebSocket(conversationId, myId, token, onMessage, onOpen, onClose, onError) {
  eventHandlers = {
    message: onMessage,
    open: onOpen,
    close: onClose,
    error: onError
  };

  if (
    socket &&
    socket.readyState === WS_OPEN &&
    currentConversationId === conversationId &&
    currentUserId === myId &&
    currentToken === token
  ) {
    console.log('🔄 Reusing existing WebSocket connection for conversation:', conversationId);
    if (onOpen) onOpen(); // Trigger onOpen since the connection is already open
    return;
  }
  currentConversationId = conversationId;
  currentUserId = myId;
  currentToken = token;
  //https://sep490-manga-mystery-box-pybe.onrender.com/py
  const wsUrl = `wss://api.mmb.io.vn/py/websocket/chatbox/${conversationId}/${myId}?token=${token}`;

  if (socket && (socket.readyState === WS_CONNECTING || socket.readyState === WS_CLOSING)) {
    console.log('⏳ Waiting for previous WebSocket operation to complete');
    setTimeout(() => connectWebSocket(conversationId, myId, token, onMessage, onOpen, onClose, onError), 100);
    return;
  }

  if (socket && socket.readyState !== WS_CLOSED) {
    console.log('🔄 Closing previous WebSocket connection');

    const previousHandlers = { ...eventHandlers };

    const originalOnClose = socket.onclose;
    socket.onclose = () => {
      if (originalOnClose) originalOnClose();
      createNewSocket(wsUrl, previousHandlers);
    };

    socket.close();
  } else {
    createNewSocket(wsUrl, eventHandlers);
  }
}

/**
 * Create a new WebSocket connection
 * @param {string} url - WebSocket URL
 * @param {Object} handlers - Event handlers
 */
function createNewSocket(url, handlers) {
  socket = new WebSocket(url);
  console.log('🌐 New WebSocket connection:', url);

  socket.onopen = () => {
    console.log('✅ WebSocket CONNECTED for conversation:', currentConversationId);
    if (handlers.open) handlers.open();
  };

  socket.onmessage = (event) => {
    let data;

    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.warn('⚠️ WebSocket received non-JSON message:', event.data);
      data = event.data;
    }

    if (typeof data === 'object' && data !== null) {
      if (!data.content) {
        console.warn('⚠️ Message received without content field:', data);
      }
      if (handlers.message) handlers.message(data);
    } else {
      console.error('❌ Invalid message format:', data);
    }
  };

  socket.onclose = () => {
    console.log('🔌 WebSocket CLOSED for conversation:', currentConversationId);
    if (handlers.close) handlers.close();
  };

  socket.onerror = (error) => {
    console.error('🛑 WebSocket ERROR:', error);
    if (handlers.error) handlers.error(error);
  };
}

/**
 * Update event handlers for existing WebSocket
 * @param {Object} handlers - New handlers object with message, open, close, error properties
 */
export function updateWebSocketHandlers(handlers) {
  if (!socket) return false;

  if (handlers.message) eventHandlers.message = handlers.message;
  if (handlers.open) eventHandlers.open = handlers.open;
  if (handlers.close) eventHandlers.close = handlers.close;
  if (handlers.error) eventHandlers.error = handlers.error;

  return true;
}

/**
 * Get current WebSocket connection state
 * @returns {Object} Status object with isConnected and currentConversation
 */
export function getWebSocketStatus() {
  return {
    isConnected: socket && socket.readyState === WS_OPEN,
    currentConversation: currentConversationId,
    readyState: socket ? socket.readyState : null
  };
}

/**
 * Send a message through WebSocket
 * @param {string|Object} message - Message to send
 * @returns {boolean} Success status
 */
export function sendMessage(message) {
  if (socket && socket.readyState === WS_OPEN) {
    const isString = typeof message === 'string';
    const payload = isString ? message : JSON.stringify(message);
    socket.send(payload);
    return true;
  } else {
    console.warn('⚠️ WebSocket is not open. Message not sent:', message);
    return false;
  }
}

/**
 * Disconnect WebSocket
 */
export function disconnectWebSocket() {
  if (socket) {
    console.log('🔌 Closing WebSocket connection...');
    socket.close();
    socket = null;
    currentConversationId = null;
    currentUserId = null;
    currentToken = null;
    eventHandlers = {
      message: null,
      open: null,
      close: null,
      error: null
    };
  }
}
