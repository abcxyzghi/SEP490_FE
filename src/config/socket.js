
let socket = null;


// Hàm mới nhận thêm myId và token
export function connectWebSocket(conversationId, myId, token, onMessage, onOpen, onClose, onError) {
  // Sử dụng URL mới của backend
  const wsUrl = `wss://sep490-manga-mystery-box-pybe.onrender.com/websocket/chatbox/${conversationId}/${myId}?token=${token}`;
  socket = new WebSocket(wsUrl);
  console.log('WS URL:', `wss://sep490-manga-mystery-box-pybe.onrender.com/websocket/chatbox/${conversationId}/${myId}?token=${token}`);

  socket.onopen = () => {
    console.log('WebSocket Connection Status: CONNECTED');
    console.log('Connection established for conversation:', conversationId);
    if (onOpen) onOpen();
  };


  socket.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
      console.log('WebSocket Received Message:', data);
    } catch {
      data = event.data;
      console.log('WebSocket Received Raw Message:', data);
    }
    if (onMessage) onMessage(data);
  };

  socket.onclose = () => {
    console.log('WebSocket Connection Status: CLOSED');
    console.log('Connection closed for conversation:', conversationId);
    if (onClose) onClose();
  };

  socket.onerror = (error) => {
    console.error('WebSocket Connection Status: ERROR');
    console.error('WebSocket Error:', error);
    if (onError) onError(error);
  };
}

export function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

export function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}