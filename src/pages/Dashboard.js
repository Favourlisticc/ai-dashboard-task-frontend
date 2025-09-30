import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { MessageSquare, Plus, LogOut, User, History, BarChart3, Settings, Loader, Menu, X } from 'lucide-react';
import { authService } from '../services/authService';
import chatHistoryService from '../services/chatHistoryService';
import ChatHistory from '../components/ChatHistory';
import NewChat from '../components/NewChat';
import UserProfile from '../components/UserProfile';
import Analytics from '../components/Analytics';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('new-chat');
  const [user, setUser] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/auth';
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadDashboardData();

    gsap.fromTo('.dashboard-container', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const historyResponse = await chatHistoryService.getChatHistory();
      if (historyResponse.success) {
        setChatHistory(historyResponse.chats);
      }

      const statsResponse = await chatHistoryService.getChatStats();
      if (statsResponse.success) {
        setStats(statsResponse);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      setChatHistory(localHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = (chatData) => {
    loadDashboardData();
    setActiveTab('history');
    setIsMobileMenuOpen(false);
    
    if (chatData && chatData.sessionId) {
      setSelectedChatId(chatData.sessionId);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleChatDeleted = () => {
    loadDashboardData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (selectedChatId) {
      const selectedChat = chatHistory.find(chat => chat.sessionId === selectedChatId);
      if (selectedChat) {
        return (
          <ChatHistory 
            history={chatHistory} 
            onChatDeleted={handleChatDeleted} 
            initialSelectedChat={selectedChat} 
            onBackToList={() => setSelectedChatId(null)}
          />
        );
      }
    }

    switch (activeTab) {
      case 'new-chat':
        return <NewChat onNewChat={handleNewChat} user={user} />;
      case 'history':
        return <ChatHistory history={chatHistory} onChatDeleted={handleChatDeleted} onSelectChat={setSelectedChatId} />;
      case 'profile':
        return <UserProfile user={user} />;
      case 'analytics':
        return <Analytics history={chatHistory} stats={stats} />;
      default:
        return <NewChat onNewChat={handleNewChat} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              {user.profile?.avatar ? (
                <img src={user.profile.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                {user.profile?.firstName || user.username}
              </h2>
              <p className="text-xs text-gray-600">Dashboard</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="dashboard-container flex h-screen lg:pt-0 pt-16">
        {/* Sidebar - Hidden on mobile, shown with overlay */}
        <div className={`
          fixed lg:static inset-0 z-40 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:w-80 w-64 bg-white/95 lg:bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col
        `}>
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4 border-b border-gray-200/50">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 lg:p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                {user.profile?.avatar ? (
                  <img src={user.profile.avatar} alt="Avatar" className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" />
                ) : (
                  <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base lg:text-lg font-semibold text-gray-800 truncate">
                  {user.profile?.firstName || user.username}
                </h2>
                <p className="text-xs lg:text-sm text-gray-600 truncate">{user.email}</p>
                <p className="text-xs text-green-600 font-medium mt-1">✓ Premium User</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2">
            {[
              { key: 'new-chat', icon: Plus, label: 'New Chat' },
              { key: 'history', icon: History, label: 'Chat History', count: chatHistory.length },
              { key: 'analytics', icon: BarChart3, label: 'Analytics', hasNew: stats },
              { key: 'profile', icon: Settings, label: 'Profile' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-sm lg:text-base ${
                  activeTab === item.key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.count > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
                {item.hasNew && (
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Stats Summary */}
          <div className="p-3 lg:p-4 border-t border-gray-200/50">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex justify-between items-center text-xs lg:text-sm">
                <span className="text-blue-700 font-medium">Total Chats</span>
                <span className="text-blue-900 font-bold">
                  {stats?.stats?.totalChats || chatHistory.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs lg:text-sm mt-1">
                <span className="text-blue-700 font-medium">Total Messages</span>
                <span className="text-blue-900 font-bold">
                  {stats?.stats?.totalMessages || chatHistory.reduce((sum, chat) => sum + (chat.messageCount || 1), 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-3 lg:p-4 border-t border-gray-200/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 text-sm lg:text-base"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;