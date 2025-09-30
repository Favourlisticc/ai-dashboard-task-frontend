import React from 'react';
import { User, Mail, Calendar, Shield, LogIn } from 'lucide-react';

const UserProfile = ({ user }) => {
  const getAuthProvider = () => {
    if (user.socialAuth?.googleId) return { name: 'Google', color: 'bg-red-500' };
    if (user.socialAuth?.githubId) return { name: 'GitHub', color: 'bg-gray-800' };
    if (user.socialAuth?.facebookId) return { name: 'Facebook', color: 'bg-blue-600' };
    return { name: 'Email', color: 'bg-gray-500' };
  };

  const authProvider = getAuthProvider();

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          {/* Profile Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              {user.profile?.avatar ? (
                <img src={user.profile.avatar} alt="Avatar" className="w-20 h-20 rounded-2xl" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {user.profile?.firstName} {user.profile?.lastName}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`px-2 py-1 rounded-full text-white text-xs ${authProvider.color}`}>
                  {authProvider.name}
                </div>
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Verified
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{user.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{user.username}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Authentication</label>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{authProvider.name} OAuth</span>
                </div>
              </div>
            </div>
          </div>

          {/* GitHub-specific info */}
          {user.socialAuth?.githubUsername && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">GitHub Information</h3>
              <p className="text-sm text-gray-600">
                Username: {user.socialAuth.githubUsername}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;