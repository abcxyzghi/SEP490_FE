let socket = null;

// Hàm kết nối WebSocket
export function connectWebSocket(conversationId, myId, token, onMessage, onOpen, onClose, onError) {
  const wsUrl = `wss://api.mmb.io.vn/py/websocket/chatbox/${conversationId}/${myId}?token=${token}`;
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.warn('⚠️ WebSocket already connected, skipping reconnect.');
    return;
  }

  // ✅ Nếu socket đang ở trạng thái CONNECTING hoặc CLOSING → đóng lại cho chắc
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    console.warn('🔄 Closing existing WebSocket before reconnecting.');
    socket.close();
  }
  socket = new WebSocket(wsUrl);
  console.log('🌐 WS URL:', wsUrl);

  socket.onopen = () => {
    console.log('✅ WebSocket CONNECTED for conversation:', conversationId);
    if (onOpen) onOpen();
  };
  socket.onmessage = (event) => {
    let data;

    try {
      data = JSON.parse(event.data);
      console.log('📩 WebSocket Received Parsed Message:', data);
    } catch (e) {
      console.warn('⚠️ WebSocket Received Raw (non-JSON) Message:', event.data);
      data = event.data;
    }

    if (typeof data === 'object' && data !== null) {
      if (!data.content) {
        console.warn('⚠️ Message received but missing content field:', data);
      }
      if (onMessage) onMessage(data);
    } else {
      console.error('❌ Invalid message format (not object):', data);
    }
  };

  socket.onclose = () => {
    console.log('🔌 WebSocket CLOSED for conversation:', conversationId);
    if (onClose) onClose();
  };

  socket.onerror = (error) => {
    console.error('🛑 WebSocket ERROR:', error);
    if (onError) onError(error);
  };
}

// Gửi tin nhắn
export function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const isString = typeof message === 'string';
    const payload = isString ? message : JSON.stringify(message);
    socket.send(payload);
    console.log('📤 Sent WebSocket Message:', payload);
  } else {
    console.warn('⚠️ WebSocket is not open. Message not sent.', message);
  }
}

// Ngắt kết nối
export function disconnectWebSocket() {
  if (socket) {
    console.log('🔌 Closing WebSocket connection...');
    socket.close();
    socket = null;
  }
}