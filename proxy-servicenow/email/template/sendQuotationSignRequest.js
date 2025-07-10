

// Email template function
module.exports = ({ clientName, quotationDetails, signingLink }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { margin-top: 20px; font-size: 12px; text-align: center; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Quotation Signature Request</h2>
        </div>
        <div class="content">
          <p>Dear ${clientName},</p>
          <p>Please review and sign the following quotation: <strong>${quotationDetails}</strong></p>
          <p>To proceed with the signing process, please click the button below:</p>
          <p><a href="${signingLink}" class="button">Sign Quotation</a></p>
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p>${signingLink}</p>
          <p>Thank you for your business!</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};