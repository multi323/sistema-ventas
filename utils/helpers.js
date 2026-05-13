const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PED${timestamp}${random}`;
};

const sendWhatsAppMessage = async (phone, message) => {
  try {
    if (!client) {
      console.log('[SIMULADO] WhatsApp a', phone, ':', message);
      return;
    }

    await client.messages.create({
      from: `whatsapp:${twilioPhone}`,
      to: `whatsapp:${phone}`,
      body: message
    });
    console.log('✅ WhatsApp enviado a', phone);
  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error.message);
  }
};

const formatCurrency = (amount, currency = 'COP') => {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  });
  return formatter.format(amount);
};

const isBusinessOpen = (openTime, closeTime) => {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  return currentTime >= openTime && currentTime <= closeTime;
};

module.exports = {
  generateOrderNumber,
  sendWhatsAppMessage,
  formatCurrency,
  isBusinessOpen
};