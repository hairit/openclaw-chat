import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  type: "user" | "response";
  text: string;
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPopup({ isOpen, onClose }: ChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate response from server/API
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "response",
        text: "This is a response message. Replace this with actual API call.",
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-popup-overlay" onClick={onClose}>
      <div className="chat-popup" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>Chat with Us</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <p>Start a conversation by typing a message below</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-bubble">{message.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={3}
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={inputValue.trim() === ""}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
