import * as React from 'react'
import { useState, useEffect, useRef } from 'react';
import Message from '../components/Message.tsx';
import '../styles/ChatRoom.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import BottomNavBar from "../components/BottomNavBar.tsx";

function ChatRoom() {
  const [messages, setMessages] = useState<{ sender: boolean; message: string; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [responseReceived, setResponseReceived] = useState(false);

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
  if (isSending || responseReceived) {
    return; // If sending or response received, do not send a new message
  }

  setIsSending(true);

  setNewMessage('');
  resetInputWidth();

  const newChatMessage = {
    sender: true,
    message: newMessage,
    timestamp: new Date().toISOString(), // Add a timestamp
  };

  const updatedMessages = [...messages, newChatMessage];
  console.log(newChatMessage);
  setMessages(updatedMessages);
  const token = localStorage.getItem('token');
  console.log(token)
     if (newMessage.trim() !== '') {
    try {
      const response = await axios.post(
        'https://gymmate.pythonanywhere.com/backgpt/chat',
        { prompt: newMessage },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const newResponseMessage = {
        sender: false, // Assuming the response is from the server and not the user
        message: response.data.response, // Update with the actual response structure
        timestamp: response.data.timestamp, // Update with the actual response structure
      };

      // Update the state with both user and response messages separately
      setMessages([...updatedMessages, newResponseMessage]);

      scrollToBottom(); // Scroll to the bottom after adding the new message
      setResponseReceived(true);

      // Reset responseReceived after a brief delay (e.g., 2 seconds)
      setTimeout(() => {
        setResponseReceived(false);
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
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

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };


  return (
      <div className="chat-room">

        {/* Header */}
        <div className="header">
          <div className="header-text">GymMate</div>
          <img
              src="https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_b541e326e0acd44b1ef931c92154c6b9/ai-chat.png"
              alt="Chat Icon" className="header-image"/>
          <FontAwesomeIcon icon={faInfoCircle} className="info-icon" onClick={togglePopup} size="2x"/>
          {showPopup && (
              <div className="popup">
                <div className="popup-inner">
                  <p>
                    ChatGPT, expertly trained in fitness and gym-related domains,
                    is employed to provide you with specialized assistance for your training inquiries.
                  </p>
                  <button className="button-shared-style" onClick={() => setShowPopup(false)}>Close</button>
                </div>
              </div>
          )}
        </div>

        {/* Message container */}
        <div className="message-container" ref={messagesContainerRef}>
          {messages.map((message, index) => (
              <Message key={index} text={message.message} sender={message.sender} timestamp={message.timestamp}/>
          ))}
        </div>

        {/* Input container */}
        <div className="message-input-container">
          <input
              className='message-input'
              type="text"
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Type your message..."
              disabled={isSending || responseReceived } // Disable input when sending, response received, or listening
          />
          <button
              className={`button-shared-style ${isSending || responseReceived ? 'button-disabled' : ''}`}
              onClick={handleSendMessage}
              disabled={isSending || responseReceived} // Disable send button when sending, response received, or listening
          >
            Send
          </button>
        </div>

        <BottomNavBar/>
      </div>
  );

}

export default ChatRoom;
