import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { connectWebSocket, disconnectWebSocket } from '../../../config/socket';


export default function ChatRoom({ otherUserId = '' }) {
  const [status, setStatus] = useState('Initializing...');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const user = useSelector(state => state.auth.user);
  const myId = user?.user_id;
  const params = useParams();
  // Ưu tiên lấy otherUserId từ props, nếu không có thì lấy từ params
  const finalOtherUserId = otherUserId || params.otherUserId || params.id || '';

  // Hàm lấy lịch sử chat của user
  const getMyChatHistory = async (token) => {
    try {
      const response = await fetch('https://sep490-manga-mystery-box-pybe.onrender.com/py/api/chatbox/conversation/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch chat history');
        return;
      }
      
      const data = await response.json();
      console.log("check data", data.data)
      setChatHistory(data.data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };
  
  // Hàm lấy hoặc tạo conversationId từ API
async function getOrCreateConversation(otherUserId, token) {
  console.log("check otherUserId", otherUserId)
  const apiUrl = `https://sep490-manga-mystery-box-pybe.onrender.com/py/api/chatbox/conversation/${otherUserId}`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData.detail || 'Failed to get conversation');
      return null;
    }
    const result = await response.json();
    // Lấy id từ object đầu tiên trong mảng data
    const conversationId = result.data[0]?.id;
    return conversationId;
  } catch (error) {
    console.error('Network or parsing error:', error);
    return null;
  }
}



  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("check finalOtherUserId", finalOtherUserId)
    console.log("check token", token)
    console.log("check myId", myId)
    if (!token || !myId) {
      setStatus('Missing Token or User ID');
      return;
    }
    
    // Gọi API lấy lịch sử chat
    getMyChatHistory(token);

    if (!finalOtherUserId) {
      setStatus('Missing other user id');
      return;
    }

  

    const setupChatConnection = async () => {
      setStatus('Getting conversation...');
      const conversationId = await getOrCreateConversation(finalOtherUserId, token);
      // const conversationId = "686fd92a08e03c8ee8664504"
      console.log("check conversationId",conversationId)
      if (!conversationId) {
        setStatus('Error: Could not get conversation ID');
        return;
      }
      setStatus(`Connecting to room: ${conversationId}`);
      connectWebSocket(
        conversationId,
        myId,
        token,
        (data) => {
          setMessages((prev) => [...prev, JSON.stringify(data)]);
        },
        () => {
          setStatus('Connected');
          console.log('WebSocket connected in ChatRoom.jsx');
        },
        () => setStatus('Disconnected'),
        (error) => {
          console.error('WebSocket Error:', error);
          setStatus('Error');
        }
      );
    };

    setupChatConnection();

    return () => {
      disconnectWebSocket();
    };
  }, [myId, finalOtherUserId]);



  return (
    <div>
      <h2>ChatRoom WebSocket Test</h2>
      <div>Status: {status}</div>
      <div className='text-white'>
        <h4>Chat History:</h4>
      <ul>
  {chatHistory.map((chat, idx) => (
    <li key={idx}>
      <p onClick={() => getOrCreateConversation(chat._id)}><strong>Conversation ID:</strong> {chat._id}</p> 
      <p><strong>Participant 1:</strong> {chat.participant_1}</p>
      <p><strong>Participant 2:</strong> {chat.participant_2}</p>
    </li>
  ))}
</ul>
      </div>
      <div>
        <h4>Current Messages:</h4>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}