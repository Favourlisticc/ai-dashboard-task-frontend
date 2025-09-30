const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

class WhatsAppBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.isReady = false;
    this.qrCode = null;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Generate QR Code
    this.client.on('qr', (qr) => {
      this.qrCode = qr;
      console.log('WhatsApp QR Code received, scan with your phone:');
      qrcode.generate(qr, { small: true });
    });

    // Client is ready
    this.client.on('ready', () => {
      this.isReady = true;
      console.log('WhatsApp Bot is ready!');
    });

    // Handle incoming messages
    this.client.on('message', async (message) => {
      await this.handleIncomingMessage(message);
    });

    // Handle authentication failure
    this.client.on('auth_failure', () => {
      console.log('WhatsApp authentication failed');
      this.isReady = false;
    });

    // Handle disconnection
    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });
  }

  async handleIncomingMessage(message) {
    try {
      // Ignore messages from groups and status broadcasts
      if (message.from === 'status@broadcast' || message.isGroupMsg) return;

      const contact = await message.getContact();
      const senderName = contact.name || contact.pushname || 'Unknown';
      const messageBody = message.body.toLowerCase().trim();

      console.log(`📱 WhatsApp Message from ${senderName}: ${messageBody}`);

      // Log the message to your backend
      await this.logMessage({
        from: message.from,
        senderName: senderName,
        message: message.body,
        timestamp: new Date(),
        type: 'incoming'
      });

      // Handle responses to alerts
      if (this.isResponseToAlert(messageBody)) {
        await this.handleAlertResponse(message, messageBody, senderName);
      }

    } catch (error) {
      console.error('Error handling WhatsApp message:', error);
    }
  }

  isResponseToAlert(message) {
    const responses = ['yes', 'no', 'y', 'n', 'confirm', 'deny', 'approved', 'rejected'];
    return responses.includes(message);
  }

  async handleAlertResponse(message, response, senderName) {
    try {
      // Map responses to standardized format
      const standardizedResponse = this.standardizeResponse(response);
      
      // Log the response
      await this.logAlertResponse({
        from: message.from,
        senderName: senderName,
        originalMessage: message.body,
        standardizedResponse: standardizedResponse,
        timestamp: new Date()
      });

      // Send confirmation
      const replyMessage = this.generateConfirmationMessage(standardizedResponse, senderName);
      await message.reply(replyMessage);

      console.log(`✅ Alert response logged: ${senderName} -> ${standardizedResponse}`);

    } catch (error) {
      console.error('Error handling alert response:', error);
    }
  }

  standardizeResponse(response) {
    const positive = ['yes', 'y', 'confirm', 'approved'];
    const negative = ['no', 'n', 'deny', 'rejected'];
    
    if (positive.includes(response)) return 'confirmed';
    if (negative.includes(response)) return 'rejected';
    return 'unknown';
  }

  generateConfirmationMessage(response, senderName) {
    if (response === 'confirmed') {
      return `✅ Thank you ${senderName}! Your response has been recorded as CONFIRMED.`;
    } else if (response === 'rejected') {
      return `❌ Thank you ${senderName}! Your response has been recorded as REJECTED.`;
    } else {
      return `📝 Thank you ${senderName}! Your response has been recorded.`;
    }
  }

  async logMessage(messageData) {
    try {
      // Save to your database or external service
      // This is where you'd integrate with your existing backend
      console.log('💾 Logging message:', messageData);
      
      // Example: Save to your MongoDB
      // await MessageLog.create(messageData);
      
    } catch (error) {
      console.error('Error logging message:', error);
    }
  }

  async logAlertResponse(responseData) {
    try {
      // Save alert responses to your database
      console.log('🚨 Alert response received:', responseData);
      
      // Example: Save to your MongoDB
      // await AlertResponse.create(responseData);
      
    } catch (error) {
      console.error('Error logging alert response:', error);
    }
  }

  async sendAlert(phoneNumber, alertMessage) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp bot is not ready. Please scan the QR code first.');
      }

      // Format phone number (remove any non-digit characters and add country code)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      // Send message
      await this.client.sendMessage(formattedNumber, alertMessage);
      
      // Log the sent alert
      await this.logMessage({
        to: formattedNumber,
        message: alertMessage,
        timestamp: new Date(),
        type: 'outgoing_alert'
      });

      console.log(`📤 Alert sent to ${formattedNumber}: ${alertMessage}`);
      return { success: true, message: 'Alert sent successfully' };

    } catch (error) {
      console.error('Error sending alert:', error);
      return { success: false, error: error.message };
    }
  }

  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number doesn't have country code, assume it's US/Canada
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    // Format for WhatsApp
    return cleaned + '@c.us';
  }

  getStatus() {
    return {
      isReady: this.isReady,
      qrCode: this.qrCode
    };
  }

  initialize() {
    this.client.initialize();
  }
}

// Create singleton instance
const whatsappBot = new WhatsAppBot();
module.exports = whatsappBot;