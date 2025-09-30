import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Send, Bot, User, Loader, Crown, Lock, AlertCircle, Info, Pencil } from 'lucide-react';
import { pageTransition } from '../animations/gsapAnimations';

const API_BASE_URL = 'https://ai-dashboard-task-backend-1.onrender.com';

const Chat = () => {
  const pageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [typingText, setTypingText] = useState('');

  useEffect(() => {
    pageTransition(pageRef.current);
    loadMessageData();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  const loadMessageData = () => {
    const today = new Date().toDateString();
    const messageData = JSON.parse(localStorage.getItem('messageData') || '{}');
    
    if (messageData.date === today) {
      setMessageCount(messageData.count || 0);
      setIsPremium(messageData.premium || false);
    } else {
      // Reset for new day
      const newData = { date: today, count: 0, premium: false };
      localStorage.setItem('messageData', JSON.stringify(newData));
      setMessageCount(0);
      setIsPremium(false);
    }

    // Load initial bot message if no messages yet
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        text: "Hello! I'm your specialized AI assistant for Chelsea FC and Frontend Development. You have 3 free messages per day. What would you like to know?",
        sender: 'bot',
        timestamp: new Date(),
        isOffTopic: false,
        isTyping: false
      }]);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 100);
  };

  const canSendMessage = () => {
    return isPremium || messageCount < 3;
  };

  const updateMessageCount = () => {
    const today = new Date().toDateString();
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    
    const messageData = {
      date: today,
      count: newCount,
      premium: isPremium
    };
    localStorage.setItem('messageData', JSON.stringify(messageData));
  };

  const typeText = (text, messageId, speed = 20) => {
    return new Promise((resolve) => {
      setTypingMessageId(messageId);
      let currentText = '';
      let index = 0;

      const typeChar = () => {
        if (index < text.length) {
          currentText += text.charAt(index);
          setTypingText(currentText);
          index++;
          setTimeout(typeChar, speed);
        } else {
          setTypingMessageId(null);
          setTypingText('');
          resolve();
        }
      };

      typeChar();
    });
  };

  const getAIResponse = async (input) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/free/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !canSendMessage()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      isOffTopic: false,
      isTyping: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Update message count
    updateMessageCount();

    try {
      const aiResponse = await getAIResponse(inputText);
      
      // Create a temporary typing message
      const typingMessageId = Date.now() + 1;
      const typingMessage = {
        id: typingMessageId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
        isOffTopic: aiResponse.isOffTopic || false,
        isTyping: true
      };
      
      setMessages(prev => [...prev, typingMessage]);
      
      // Simulate typing delay before starting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Type out the response
      await typeText(aiResponse.response, typingMessageId, 15);
      
      // Replace typing message with final message
      setMessages(prev => prev.map(msg => 
        msg.id === typingMessageId 
          ? {
              ...msg,
              text: aiResponse.response,
              isTyping: false
            }
          : msg
      ));
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble connecting to the AI service. Please check your connection and try again.",
        sender: 'bot',
        timestamp: new Date(),
        isOffTopic: false,
        isTyping: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!canSendMessage()) {
        setShowUpgradeModal(true);
        return;
      }
      handleSend();
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  const remainingMessages = 3 - messageCount;

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16 md:pt-20">
      {/* Header - Responsive */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 md:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">AI Chat Assistant</h1>
                <p className="text-sm md:text-base text-gray-600 truncate">Specialized in Chelsea FC & Frontend Development</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {!isPremium && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                  <div className="flex items-center space-x-2 justify-center sm:justify-start">
                    <Crown className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-orange-700 text-center sm:text-left">
                      {remainingMessages} free {remainingMessages === 1 ? 'message' : 'messages'} left
                    </span>
                  </div>
                </div>
              )}
              
              {isPremium ? (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                  <div className="flex items-center space-x-2 justify-center sm:justify-start">
                    <Crown className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-green-700">Premium User</span>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container - Responsive */}
      <div className="container mx-auto max-w-6xl p-3 sm:p-4 md:p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-white/20 overflow-hidden">
          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="h-64 sm:h-80 md:h-96 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 md:space-y-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 md:space-x-3 max-w-[85%] sm:max-w-[90%] md:max-w-2xl ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                      : message.isError
                      ? 'bg-gradient-to-r from-red-500 to-orange-500'
                      : message.isOutOfScope
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    ) : message.isError ? (
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    ) : message.isOutOfScope ? (
                      <Info className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    )}
                  </div>
                  <div className={`px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl max-w-full ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none md:rounded-br-none'
                      : message.isError
                      ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-none md:rounded-bl-none'
                      : message.isOutOfScope
                      ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-bl-none md:rounded-bl-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none md:rounded-bl-none'
                  }`}>
                    {/* Typing indicator for bot messages */}
                    {message.sender === 'bot' && message.isTyping && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <Pencil className="w-3 h-3 md:w-4 md:h-4 text-gray-500 animate-pulse" />
                        <span className="text-xs text-gray-500">AI is typing...</span>
                      </div>
                    )}
                    
                    {/* Message content */}
                    <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {message.isTyping && typingMessageId === message.id ? typingText : message.text}
                    </p>
                    
                    <span className={`text-xs mt-1 block ${
                      message.sender === 'user' ? 'text-blue-200' : 
                      message.isError ? 'text-red-600' :
                      message.isOutOfScope ? 'text-yellow-600' :
                      'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.isOutOfScope && ' • Specialization reminder'}
                      {message.isError && ' • Error'}
                      {message.isTyping && ' • Typing...'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator for initial response */}
            {isLoading && messages.filter(msg => msg.isTyping).length === 0 && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 md:space-x-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <div className="px-3 py-2 md:px-4 md:py-3 bg-gray-100 rounded-xl md:rounded-2xl rounded-bl-none md:rounded-bl-none">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <Pencil className="w-3 h-3 md:w-4 md:h-4 text-gray-500 animate-pulse" />
                      <span className="text-xs text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Responsive */}
          <div className="border-t border-gray-200/50 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={canSendMessage() ? 
                    "Ask about Chelsea FC or Frontend Development..." : 
                    "Upgrade to premium for unlimited messages"}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-xl md:rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
                  rows="2"
                  disabled={!canSendMessage() || isLoading}
                />
                {!canSendMessage() && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center">
                    <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600 font-medium text-sm md:text-base">Daily limit reached</span>
                  </div>
                )}
              </div>
              <button
                onClick={canSendMessage() ? handleSend : () => setShowUpgradeModal(true)}
                disabled={isLoading || !inputText.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-2 text-sm md:text-base whitespace-nowrap min-w-[100px]"
              >
                {canSendMessage() ? (
                  <>
                    <Send className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Send</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Upgrade</span>
                  </>
                )}
              </button>
            </div>
            
            {!isPremium && (
              <div className="mt-2 md:mt-3 flex flex-col sm:flex-row items-center justify-between text-xs md:text-sm text-gray-500 space-y-1 sm:space-y-0">
                <span>{messageCount}/3 messages used today</span>
                <span>Reset at midnight</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal - Responsive */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full mx-auto">
            <div className="text-center">
              <Crown className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 mx-auto mb-3 md:mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Upgrade to Premium</h3>
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                You've used all 3 free messages for today. Upgrade to premium for unlimited access to our AI assistant.
              </p>
              
              <div className="space-y-3 md:space-y-4">
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm md:text-base"
                >
                  View Pricing Plans
                </button>
                
                <button
                  onClick={handleLogin}
                  className="w-full border-2 border-gray-300 text-gray-700 py-2 md:py-3 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-200 text-sm md:text-base"
                >
                  Sign In for More Features
                </button>
                
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full text-gray-500 py-1 md:py-2 hover:text-gray-700 transition-colors text-sm md:text-base"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;