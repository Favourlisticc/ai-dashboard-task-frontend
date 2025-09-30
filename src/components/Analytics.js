import React from 'react';
import { BarChart3, MessageSquare, Clock, TrendingUp, Users, Target, Zap } from 'lucide-react';

const Analytics = ({ history, stats }) => {
  const calculatedStats = stats?.stats || {
    totalChats: history.length,
    totalMessages: history.reduce((sum, chat) => sum + (chat.messageCount || 1), 0),
    avgMessagesPerChat: history.length > 0 ? 
      Math.round(history.reduce((sum, chat) => sum + (chat.messageCount || 1), 0) / history.length) : 0,
    mostActiveTopic: 'General'
  };

  const recentActivity = stats?.recentActivity || history.slice(0, 5);

  const topicDistribution = history.reduce((acc, chat) => {
    const topic = chat.topic || 'general';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">Insights into your AI assistant usage</p>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 lg:p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Chats</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-800">{calculatedStats.totalChats}</p>
              </div>
              <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 lg:p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-800">{calculatedStats.totalMessages}</p>
              </div>
              <BarChart3 className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 lg:p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Avg. Messages</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-800">{calculatedStats.avgMessagesPerChat}</p>
              </div>
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 lg:p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">Favorite Topic</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-800 capitalize truncate">
                  {calculatedStats.mostActiveTopic}
                </p>
              </div>
              <Target className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Topic Distribution */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200/50">
            <h2 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4 flex items-center">
              <Zap className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-yellow-500" />
              Topic Distribution
            </h2>
            <div className="space-y-2 lg:space-y-3">
              {Object.entries(topicDistribution).map(([topic, count]) => (
                <div key={topic} className="flex items-center justify-between">
                  <span className="text-xs lg:text-sm font-medium text-gray-700 capitalize truncate flex-1 mr-2">
                    {topic}
                  </span>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="w-16 lg:w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / calculatedStats.totalChats) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-6 lg:w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200/50">
            <h2 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4 flex items-center">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-gray-500" />
              Recent Activity
            </h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-2 lg:space-y-3">
                {recentActivity.map((chat, index) => (
                  <div key={chat.sessionId || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-medium text-gray-800 truncate text-sm">{chat.title}</p>
                      <p className="text-xs text-gray-600 truncate">
                        {chat.lastMessage?.content || chat.preview || 'No messages yet'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                      {new Date(chat.lastActivity || chat.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6 lg:py-8 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-6 lg:mt-8 bg-blue-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm lg:text-base">💡 Usage Tips</h3>
          <ul className="text-blue-700 text-xs lg:text-sm space-y-1">
            <li>• Ask specific questions for more detailed answers</li>
            <li>• Use the topic filters to organize your conversations</li>
            <li>• Premium users get unlimited messages and advanced features</li>
            <li>• Your chat history is saved automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;