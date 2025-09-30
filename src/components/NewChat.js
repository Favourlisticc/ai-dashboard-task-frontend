import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const NewChat = ({ onNewChat, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    gsap.fromTo('.welcome-message', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }
    );
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ai-dashboard-task-backend-1.onrender.com/api/users/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: inputText,
          sessionId: currentSessionId || `session_${Date.now()}`
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
          sessionId: data.sessionId
        };

        setMessages(prev => [...prev, botMessage]);
        
        if (!currentSessionId) {
          setCurrentSessionId(data.sessionId);
          onNewChat({
            sessionId: data.sessionId,
            title: inputText.substring(0, 30) + (inputText.length > 30 ? '...' : ''),
            preview: data.response.substring(0, 50) + '...',
            timestamp: new Date(),
            messages: [{
              content: inputText,
              sender: 'user',
              timestamp: new Date()
            }, {
              content: data.response,
              sender: 'bot',
              timestamp: new Date()
            }]
          });
        }
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50 p-4 lg:p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">New Chat</h1>
            <p className="text-sm lg:text-base text-gray-600">Ask about Chelsea FC or Frontend Development</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
        {messages.length === 0 ? (
          <div className="welcome-message h-full flex items-center justify-center">
            <div className="text-center max-w-md lg:max-w-2xl px-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Bot className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3 lg:mb-4">
                Welcome, {user.profile?.firstName || user.username}!
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 mb-4 lg:mb-6">
                I'm your specialized AI assistant for Chelsea FC and Frontend Development.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 max-w-lg mx-auto">
                <div className="bg-blue-50 rounded-xl p-3 lg:p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm lg:text-base">🏆 Chelsea FC</h3>
                  <p className="text-blue-700 text-xs lg:text-sm">Ask about matches, players, history, or tactics</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 lg:p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2 text-sm lg:text-base">💻 Frontend Dev</h3>
                  <p className="text-purple-700 text-xs lg:text-sm">Get help with React, JavaScript, Tailwind, GSAP</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 lg:space-x-3 max-w-[85%] lg:max-w-2xl ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  )}
                </div>
                <div className={`px-3 py-2 lg:px-4 lg:py-3 rounded-xl lg:rounded-2xl max-w-full ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none lg:rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none lg:rounded-bl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap text-sm lg:text-base">{message.text}</p>
                  <span className={`text-xs mt-1 block ${
                    message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 lg:space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <div className="px-3 py-2 lg:px-4 lg:py-3 bg-gray-100 rounded-xl lg:rounded-2xl rounded-bl-none lg:rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Chelsea FC or Frontend Development..."
                className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-xl lg:rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-sm lg:text-base"
                rows="2"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-2 text-sm lg:text-base whitespace-nowrap min-w-[80px] lg:min-w-[100px]"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            I specialize in Chelsea FC and Frontend Development topics
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewChat;