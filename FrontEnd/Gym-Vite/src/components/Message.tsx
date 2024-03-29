import * as React from 'react';
// import './Message.css';

interface MessageProps {
  text: string;
  sender: boolean;
  timestamp?: string;
}

function Message({ text, sender, timestamp }: MessageProps) {
  const messageClass = sender ? 'message sender' : 'message receiver';
  const textAlign = sender ? 'left' : 'right'; // Reverse the textAlign condition

  const messageStyle: React.CSSProperties = {
    textAlign: textAlign as 'left' | 'right', // Explicitly cast textAlign to the correct type
  };

  return (
    <div className={messageClass} style={messageStyle}>
      <div>{text}</div>
      {timestamp && <div className="timestamp">{}</div>}
    </div>
  );
}

export default Message;