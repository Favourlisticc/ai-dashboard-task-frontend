import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

const WhatsAppBot = () => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isContactSupport, setIsContactSupport] = useState(false);

  const validatePhoneNumber = (phone) => {
    // Basic validation for international phone numbers
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleWhatsAppSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isContactSupport && !validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Log the notification details
      console.log('Sending WhatsApp notification:', { 
        phoneNumber: isContactSupport ? '+2349067753060' : phoneNumber, 
        message 
      });
      
      // In a real implementation, you would use a WhatsApp API here
      // For demonstration, I'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNotificationSent(true);
      
      // In a real scenario, you would listen for webhooks from the WhatsApp API
      // Here we simulate the user responding after a short delay
      setTimeout(() => {
        simulateUserResponse();
      }, 3000);
      
    } catch (err) {
      console.error('Error sending WhatsApp notification:', err);
      setError('Failed to send WhatsApp notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateUserResponse = () => {
    // This simulates the user responding "yes" or "no"
    const responses = ['yes', 'no', 'maybe later'];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setUserResponse(randomResponse);
    
    // In a real app, you would receive this via webhooks and log to your backend
    logResponseToBackend(randomResponse);
  };

  const logResponseToBackend = async (response) => {
    // Simulate logging to backend
    console.log('Logging user response to backend:', { 
      phoneNumber: isContactSupport ? '+2349067753060' : phoneNumber, 
      message, 
      response,
      timestamp: new Date().toISOString()
    });
  };

  const resetWhatsAppForm = () => {
    setPhoneNumber('');
    setMessage('');
    setNotificationSent(false);
    setUserResponse('');
    setShowWhatsAppModal(false);
    setError('');
    setIsLoading(false);
    setIsContactSupport(false);
  };

  const handleContactSupport = () => {
    setIsContactSupport(true);
    setPhoneNumber('+2349067753060');
    setMessage('Hello Support, I need help with...');
    setShowWhatsAppModal(true);
  };

  const handleRegularWhatsApp = () => {
    setIsContactSupport(false);
    setPhoneNumber('');
    setMessage('');
    setShowWhatsAppModal(true);
  };
  
  // Function to directly open WhatsApp with the given number and message
  const openWhatsAppDirectly = () => {
    const targetPhone = isContactSupport ? '+2349067753060' : phoneNumber;
    
    if (!isContactSupport && !validatePhoneNumber(targetPhone)) {
      setError('Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }
    
    const cleanedPhone = targetPhone.replace(/\+/g, '').replace(/\s+/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* WhatsApp Floating Button with Dropdown */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          {/* Main WhatsApp Button */}
          <div 
            className="cursor-pointer transform hover:scale-110 transition-transform duration-300"
            onClick={() => setShowWhatsAppModal(true)}
            aria-label="Open WhatsApp options"
          >
            <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="absolute bottom-20 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="p-2">
              <button
                onClick={handleRegularWhatsApp}
                className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 fill-white">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Send Message</p>
                  <p className="text-xs text-gray-500">To any number</p>
                </div>
              </button>
              
              <div className="my-1 border-t border-gray-200"></div>
              
              <button
                onClick={handleContactSupport}
                className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Contact Support</p>
                  <p className="text-xs text-gray-500">+2349067753060</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-scaleIn">
            <div className="bg-[#25D366] p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">
                {isContactSupport ? 'Contact Support' : 'WhatsApp Message'}
              </h3>
              <button 
                onClick={resetWhatsAppForm}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {!notificationSent ? (
                <form onSubmit={handleWhatsAppSubmit}>
                  {!isContactSupport && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Phone Number (with country code)
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1234567890"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                      />
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      {isContactSupport ? 'Your Message to Support' : 'Your Message'}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isContactSupport ? "Hello Support, I need help with..." : "Enter your message here..."}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                    />
                  </div>
                  
                  {isContactSupport && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Support Number:</strong> +2349067753060
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    
                    
                    <button
                      type="button"
                      onClick={openWhatsAppDirectly}
                      className="flex-1 py-2 px-4 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Open WhatsApp
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {isContactSupport ? 'Message Sent to Support!' : 'Message Sent!'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isContactSupport 
                      ? 'Your message has been sent to our support team.' 
                      : 'Your WhatsApp message has been sent successfully.'
                    }
                  </p>
                  
                  {userResponse ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <p className="font-medium text-gray-700 mb-1">User Response:</p>
                      <p className="text-xl font-bold text-[#25D366]">{userResponse}</p>
                      <p className="text-xs text-gray-500 mt-2">Response logged to backend</p>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-[#25D366] rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-gray-600 ml-2">Waiting for response...</span>
                    </div>
                  )}
                  
                  <button
                    onClick={resetWhatsAppForm}
                    className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
                  >
                    {isContactSupport ? 'Send Another Message' : 'Send Another Message'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default WhatsAppBot;