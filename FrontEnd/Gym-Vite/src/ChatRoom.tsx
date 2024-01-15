import { useState, useEffect, useRef } from 'react';
import Message from './Message.tsx';
import './ChatRoom.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function ChatRoom() {
  const [messages, setMessages] = useState<{ sender: boolean; message: string; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Declare inputRef

  useEffect(() => {
    // Fetch chat history when the component mounts
    fetchChatHistory();
  }, []);


  useEffect(() => {
    // Scroll to the bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    const token = localStorage.getItem('token');

    try {
      // Replace 'YOUR_API_ENDPOINT' and 'YOUR_TOKEN' with your actual API endpoint and token
      const response = await axios.get('https://gymmate.pythonanywhere.com/backgpt/chat', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Assuming the response data matches the format you provided
      setMessages(response.data);
      scrollToBottom(); // Scroll to the bottom after fetching history
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

 const handleSendMessage = async () => {
   const token = localStorage.getItem('token');
  if (newMessage.trim() !== '') {
    try {
      // Replace 'YOUR_API_ENDPOINT' and 'YOUR_TOKEN' with your actual API endpoint and token
      await axios.post(
        'https://gymmate.pythonanywhere.com/backgpt/chat',
        { prompt: newMessage },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // Create a new chat message with sender set to true
      const newChatMessage = {
        sender: true,
        message: newMessage,
        timestamp: new Date().toISOString(), // Add a timestamp
      };

      // Add the new message to the chat history
      setMessages([...messages, newChatMessage]);

      setNewMessage('');

      resetInputWidth()

      fetchChatHistory(); // Call resetInputWidth after a short delay

    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
};




  const resetInputWidth = () => {
    if (inputRef.current) {
      inputRef.current.style.width = 'auto'; // Reset the input width
    }
  };

  const handleInputKeyDown = (e: { key: string; preventDefault: () => void; }) => {
    if (e.key === 'Enter') {
      // Prevent the default Enter key behavior (e.g., new line)
      e.preventDefault();
      handleSendMessage(); // Call the send message function
    } else {
      // Adjust the input width based on content
      if (inputRef.current) {
        inputRef.current.style.width = `${inputRef.current.scrollWidth}px`;
      }
    }
  };

  const scrollToBottom = () => {
    // Scroll to the bottom of the messages container
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

    const handleLeaveChat = () => {
    // Redirect to the home page or any other route as needed
    window.location.href = '/';
  };

  return (
    <div className="chat-room">

      {/* Header */}
      <div className="header">
        <button onClick={handleLeaveChat} className="leave-button">
          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '5px' }} />
        </button>
        <div className="header-text">Chat</div>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/800px-ChatGPT_logo.svg.png" alt="Chat Icon" className="header-image" />
      </div>

      <div className="message-container" ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <Message key={index} text={message.message} sender={message.sender} timestamp={message.timestamp} />
        ))}
      </div>
      <div className="message-input-container">
        <input
          type="text"
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleInputKeyDown} // Handle Enter key press
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;