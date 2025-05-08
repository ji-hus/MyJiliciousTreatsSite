import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init("jRgg2OkLA0U1pS4WQ");

export const EMAIL_CONFIG = {
  serviceId: 'service_10tkiq3',
  templates: {
    order: 'template_34tuje7',
    contact: 'template_zm1pn05'
  },
  toEmail: 'myjilicioustreats@gmail.com'
};

export const sendEmail = async (templateId: string, templateParams: any) => {
  try {
    const result = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      templateId,
      templateParams,
      {
        publicKey: 'jRgg2OkLA0U1pS4WQ'
      }
    );
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}; 