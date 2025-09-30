import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { MessageSquare, Calendar, Clock, Trash2, Eye, Loader, ArrowLeft, Send, Menu, X, Pencil } from 'lucide-react';
import { User, Bot } from 'lucide-react'; 

const ChatHistory = ({ history, onChatDeleted, initialSelectedChat = null, onSelectChat, onBackToList }) => {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(initialSelectedChat);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingId, setCurrentTypingId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (history.length > 0 && !selectedChat) {
      gsap.fromTo('.history-item', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }
      );
    }
  }, [history, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, typingMessage]);

  // Close mobile menu when selecting a chat
  useEffect(() => {
    if (selectedChat) {
      setIsMobileMenuOpen(false);
    }
  }, [selectedChat]);

  // Add this to handle props changes
  useEffect(() => {
    if (initialSelectedChat) {
      setSelectedChat(initialSelectedChat);
      if (initialSelectedChat.sessionId) {
        handleViewChat(initialSelectedChat.sessionId);
      }
    }
  }, [initialSelectedChat]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  const simulateTyping = (message, onComplete) => {
    setIsTyping(true);
    setTypingMessage('');
    let index = 0;
    
    const typingInterval = setInterval(() => {
      if (index < message.length) {
        setTypingMessage(prev => prev + message[index]);
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setTypingMessage('');
        onComplete();
      }
    }, 30); // Adjust typing speed here (lower = faster)
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getTopicBadge = (topic) => {
    const topicConfig = {
      chelsea: { color: 'bg-blue-100 text-blue-800', label: 'Chelsea FC' },
      frontend: { color: 'bg-purple-100 text-purple-800', label: 'Frontend' },
      mixed: { color: 'bg-green-100 text-green-800', label: 'Mixed' },
      general: { color: 'bg-gray-100 text-gray-800', label: 'General' }
    };
    
    const config = topicConfig[topic] || topicConfig.general;
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleDeleteChat = async (sessionId, index) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;

    setDeletingId(sessionId || index);
    setLoading(true);

    try {
      if (sessionId) {
        await fetch(`http://localhost:3005/api/users/chat/history/${sessionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      onChatDeleted();
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  const handleViewChat = async (sessionId) => {
    try {
      setLoading(true);

      if (onSelectChat) {
        onSelectChat(sessionId);
      }
      
      const response = await fetch(`http://localhost:3005/api/users/chat/history/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat');
      }

      const data = await response.json();
      
      if (data.success) {
        setSelectedChat(data.chat);
        
        const formattedMessages = data.chat.messages.map(msg => ({
          id: msg._id || Date.now(),
          text: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp),
          sessionId: data.chat.sessionId
        }));
        
        setChatMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error viewing chat:', error);
      alert('Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setChatMessages([]);
    setInputText('');
    if (onBackToList) onBackToList();
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoadingResponse || !selectedChat) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoadingResponse(true);

    try {
      const response = await fetch('http://localhost:3005/api/users/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: inputText,
          sessionId: selectedChat.sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      if (data.success) {
        // Instead of immediately adding the bot message, simulate typing
        simulateTyping(data.response, () => {
          const botMessage = {
            id: Date.now() + 1,
            text: data.response,
            sender: 'bot',
            timestamp: new Date(),
            sessionId: data.sessionId
          };
          setChatMessages(prev => [...prev, botMessage]);
          setIsLoadingResponse(false);
          onChatDeleted();
        });
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setIsLoadingResponse(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // If we're viewing and continuing a specific chat
  if (selectedChat) {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header - Mobile Responsive */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleBackToList}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="max-w-[200px] sm:max-w-none">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                  {selectedChat.title}
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm truncate">
                  {chatMessages.length} messages
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getTopicBadge(selectedChat.topic)}
            </div>
          </div>
        </div>

        {/* Chat Messages - Mobile Responsive - FIXED SCROLLING */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6"
          style={{ 
            minHeight: 0, // Important for flex scrolling
            WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
          }}
        >
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-2xl ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl max-w-full ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {message.text}
                  </p>
                  <span className={`text-xs mt-1 block ${
                    message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator with Pencil Icon - NO LOADING DOTS */}
          {(isLoadingResponse || isTyping) && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-100 rounded-2xl rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 animate-pulse" />
                      <span className="text-sm text-gray-600 font-medium">Typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Show typing message if available */}
          {typingMessage && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-100 rounded-2xl rounded-bl-none max-w-[85%] sm:max-w-2xl">
                  <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {typingMessage}
                    <span className="inline-block w-1 h-4 bg-gray-600 ml-0.5 animate-pulse"></span>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Mobile Responsive */}
        <div className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 p-3 sm:p-6 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Continue your conversation..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-sm sm:text-base"
                  rows="2"
                  disabled={isLoadingResponse || isTyping}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={isLoadingResponse || isTyping || !inputText.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Continuing conversation in {selectedChat.topic === 'chelsea' ? 'Chelsea FC' : 
                                      selectedChat.topic === 'frontend' ? 'Frontend Development' : 
                                      selectedChat.topic} mode
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Original history list view - Mobile Responsive
  if (history.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No chat history yet</h3>
          <p className="text-gray-500 text-sm sm:text-base">Start a new conversation to see your history here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Header with Menu Toggle */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Chat History</h1>
              <p className="text-gray-600 text-sm sm:text-base hidden sm:block">
                Your recent conversations - click "Continue" to keep chatting
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {history.length} conversation{history.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Mobile Info */}
        <div className="sm:hidden text-center mb-4">
          <p className="text-gray-600 text-sm">
            {history.length} conversation{history.length !== 1 ? 's' : ''} • Tap to continue chatting
          </p>
        </div>

        {loading && (
          <div className="flex justify-center mb-4">
            <Loader className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}

        <div className="grid gap-3 sm:gap-4">
          {history.map((chat, index) => (
            <div
              key={chat.sessionId || chat.id}
              className="history-item bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 space-y-2 sm:space-y-0">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {chat.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                      {getTopicBadge(chat.topic)}
                      <span className="text-xs text-gray-500">
                        {chat.messageCount || 1} messages
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">
                      {formatDate(chat.lastActivity || chat.timestamp || chat.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>
                      {new Date(chat.lastActivity || chat.timestamp || chat.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                {chat.preview || 'Start a conversation to see preview...'}
              </p>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex-1 min-w-0">
                  {/* Empty space for alignment */}
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handleViewChat(chat.sessionId)}
                    disabled={loading}
                    className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-xs sm:text-sm disabled:opacity-50"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Continue</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteChat(chat.sessionId, index)}
                    disabled={loading && deletingId === (chat.sessionId || index)}
                    className="flex items-center space-x-1 px-2 sm:px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs sm:text-sm disabled:opacity-50"
                  >
                    {loading && deletingId === (chat.sessionId || index) ? (
                      <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span className="hidden xs:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;