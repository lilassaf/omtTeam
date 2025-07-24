const nodemailer = require('nodemailer');
const signQuotationTemplate = require('../template/sendQuotationSignRequest');
require('dotenv').config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a quotation sign request email to a client
 * @param {string} clientEmail - The client's email address
 * @param {string} quotationId - The quotation ID
 * @param {string} [clientName] - Optional client name (defaults to "Valued Client")
 * @param {string} [quotationDetails] - Optional quotation details (defaults to "your quotation")
 * @returns {Promise<void>}
 * @throws {Error} If clientEmail or quotationId is missing, or if email sending fails
 */
module.exports = async (clientEmail, quotationId, clientName, quotationDetails)  => {
  if (!clientEmail || !quotationId) {
    throw new Error('Client email and quotation ID are required');
  }


  const signingLink = `${process.env.FRONTEND_URL}/dashboard/quote/edit/?id=${quotationId}`;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_SENDER_NAME || 'Your Company'}" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: 'Action Required: Please Sign Your Quotation',
    html: signQuotationTemplate({
      clientName: clientName || 'Valued Client',
      quotationDetails: quotationDetails || 'your quotation',
      signingLink,
    }),
  });
}

