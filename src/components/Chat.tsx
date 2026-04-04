import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/openclawApi";

interface Message {
  id: string;
  type: "user" | "response";
  text: string;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userText = inputValue.trim();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setError(null);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Add to conversation history
    conversationHistoryRef.current.push({
      role: "user",
      content: userText,
    });

    try {
      // Call OpenClaw API
      const response = await sendMessage(
        userText,
        conversationHistoryRef.current.slice(0, -1),
      );

      // Add assistant response to conversation history
      conversationHistoryRef.current.push({
        role: "assistant",
        content: response,
      });

      // Add response message to UI
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "response",
        text: response,
      };

      setMessages((prev) => [...prev, responseMessage]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get response";
      setError(errorMessage);

      // Add error message to UI
      const errorResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "response",
        text: `Error: ${errorMessage}`,
      };

      setMessages((prev) => [...prev, errorResponseMessage]);

      // Remove the failed user message from conversation history
      conversationHistoryRef.current.pop();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Icon Button */}
      <button
        className="chat-icon"
        onClick={() => setIsChatOpen(true)}
        title="Open Chat"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Chat Popup */}
      {isChatOpen && (
        <div
          className="chat-popup-overlay"
          onClick={() => setIsChatOpen(false)}
        >
          <div className="chat-popup" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <div className="header-content">
                <div className="bot-avatar">🤖</div>
                <h3>FXMedia Assistant</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsChatOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-welcome">
                  <p>Start a conversation by typing a message below</p>
                </div>
              )}
              {error && (
                <div className="chat-error">
                  <p>{error}</p>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  {message.type === "response" && (
                    <div className="message-avatar">🤖</div>
                  )}
                  <div className="message-bubble">{message.text}</div>
                </div>
              ))}
              {isLoading && (
                <div className="message response">
                  <div className="message-avatar">🤖</div>
                  <div className="message-bubble message-loading">
                    <span className="loading-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder="Tell me something..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                rows={1}
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={inputValue.trim() === "" || isLoading}
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
