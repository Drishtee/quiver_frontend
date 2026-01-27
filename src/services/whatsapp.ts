// WhatsApp integration utilities

interface MeetingShareData {
  title: string;
  date: string;
  time: string;
  mentor: string;
  meetLink: string;
}

/**
 * Generate WhatsApp share URL for meeting details
 */
export const generateWhatsAppShareUrl = (meeting: MeetingShareData): string => {
  const message = `
🗓️ *Meeting Scheduled!*
━━━━━━━━━━━━━━━━

📅 *Date:* ${meeting.date}
⏰ *Time:* ${meeting.time}
👤 *Mentor:* ${meeting.mentor}
📋 *Topic:* ${meeting.title}

🔗 *Join Meeting:*
${meeting.meetLink}

━━━━━━━━━━━━━━━━
📱 Scheduled via Quiver
  `.trim();

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

/**
 * Generate WhatsApp share URL with custom message
 */
export const generateWhatsAppUrl = (phoneNumber: string, message: string): string => {
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate meeting reminder message in Hindi
 */
export const generateMeetingReminderHindi = (meeting: MeetingShareData): string => {
  return `
🗓️ *मीटिंग अनुस्मारक*
━━━━━━━━━━━━━━━━

📅 *तारीख:* ${meeting.date}
⏰ *समय:* ${meeting.time}
👤 *मेंटर:* ${meeting.mentor}
📋 *विषय:* ${meeting.title}

🔗 *मीटिंग में शामिल हों:*
${meeting.meetLink}

━━━━━━━━━━━━━━━━
📱 Quiver द्वारा शेड्यूल किया गया
  `.trim();
};

/**
 * Generate onboarding completion share message
 */
export const generateOnboardingShareMessage = (userName: string): string => {
  return `
✅ *मैंने Quiver के साथ अपना पंजीकरण पूरा कर लिया!*

Quiver एक व्यवसाय विकास मंच है जो ग्रामीण उद्यमियों को बढ़ने में मदद करता है।

अगर आप भी अपना व्यवसाय बढ़ाना चाहते हैं, तो आज ही शुरू करें:
👉 https://quiver.co.in

- ${userName}
  `.trim();
};

/**
 * Open WhatsApp with pre-filled message
 */
export const openWhatsApp = (url: string): void => {
  window.open(url, '_blank');
};

/**
 * Check if WhatsApp is available (mobile detection)
 */
export const isWhatsAppAvailable = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
};

export default {
  generateWhatsAppShareUrl,
  generateWhatsAppUrl,
  generateMeetingReminderHindi,
  generateOnboardingShareMessage,
  openWhatsApp,
  isWhatsAppAvailable
};
