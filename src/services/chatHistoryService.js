import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-dashboard-task-backend-1.onrender.com/api/users';

class ChatHistoryService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getChatHistory(limit = 20, page = 1) {
    try {
      const response = await this.api.get(`/chat/history?limit=${limit}&page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw new Error('Failed to fetch chat history');
    }
  }

  async getChatSession(sessionId) {
    try {
      const response = await this.api.get(`/chat/history/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch chat session');
    }
  }

  async deleteChatSession(sessionId) {
    try {
      const response = await this.api.delete(`/chat/history/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete chat session');
    }
  }

  async getChatStats() {
    try {
      const response = await this.api.get('/chat/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat stats:', error);
      // Return fallback stats if API fails
      return {
        success: true,
        stats: {
          totalChats: 0,
          totalMessages: 0,
          avgMessagesPerChat: 0,
          mostActiveTopic: 'None'
        },
        recentActivity: []
      };
    }
  }
}

export default new ChatHistoryService();