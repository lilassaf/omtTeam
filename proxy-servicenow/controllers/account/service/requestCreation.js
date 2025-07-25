// controllers/account/requestCreation.js
const {
  validateRegistrationInput
} = require('./validationAccountCreation');
const {
  pendingRegistrations,
  emailToTokenMap,
  generateToken,
  sendConfirmationEmail,
  hasPendingRegistration,
  storeRegistration
} = require('./registrationService');
const config = require('../../../utils/configCreateAccount');
const Account = require('../../../models/account');
const Contact = require('../../../models/Contact');

const requestCreation = async (req, res) => {
  try {
    // Enhanced request logging

    // Validate input
    const { isValid, errors, sanitizedData } = validateRegistrationInput(req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'validation_failed',
        message: 'Validation failed',
        fields: errors,
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }


    // Token handling
    let accountSysId = null;
    if (sanitizedData.token) {
  try {
    const rawToken = sanitizedData.token.replace('Bearer ', '').trim();
    
    // Remove JWT validation since your token isn't a JWT
    // Instead, validate it's a proper base64 string
    if (!rawToken.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
      console.warn('Invalid base64 token:', rawToken);
      return res.status(400).json({
        success: false,
        error: 'invalid_token_format',
        message: 'Invalid token encoding',
        statusCode: 400
      });
    }
    
    const decoded = Buffer.from(rawToken, 'base64').toString('utf-8');
    
    // Split the decoded string by colon
    const parts = decoded.split(':');
    if (parts.length !== 2) {
      console.warn('Token missing colon separator:', decoded);
      return res.status(400).json({
        success: false,
        error: 'invalid_token_structure',
        message: 'Token must contain account ID and GUID separated by colon',
        statusCode: 400
      });
    }
    
    [accountSysId, guid] = parts.map(part => part.trim());
    
    if (!accountSysId || !guid) {
      console.warn('Token missing required components:', decoded);
      return res.status(400).json({
        success: false,
        error: 'invalid_token_components',
        message: 'Token must contain both account ID and GUID',
        statusCode: 400
      });
    }
    
    
  } catch (tokenError) {
    console.error('Token processing failed:', tokenError);
    return res.status(400).json({
      success: false,
      error: 'token_processing_failed',
      message: 'Failed to process the provided token',
      details: tokenError.message,
      statusCode: 400
    });
  }
}

// Account verification
let accountCheckQuery = {};
if (accountSysId) {
  accountCheckQuery = { 
    sys_id: accountSysId, 
    status: 'active'  // Checking status field
  };
} else {
  accountCheckQuery = { 
    email: sanitizedData.email.toLowerCase().trim(), // Case-insensitive check
    status: 'active'  // Checking status field
  };
}

try {
  const existingAccount = await Account.findOne(accountCheckQuery)
    .select('sys_id email status')  // Only select needed fields
    .lean();

  if (existingAccount) {
    return res.status(400).json({
      success: false,
      error: 'account_exists',
      message: accountSysId 
        ? 'Account  is already active' 
        : `Email ${sanitizedData.email} is already registered to an active account`,
      accountInfo: {
        sys_id: existingAccount.sys_id,
        email: existingAccount.email,
        status: existingAccount.status
      },
      statusCode: 400
    });
  }
} catch (dbError) {
  console.error('Account verification failed:', dbError);
  return res.status(500).json({
    success: false,
    error: 'account_verification_failed',
    message: 'Could not verify account status',
    details: dbError.message,
    statusCode: 500
  });
}

    // Contact email validation
    if (!sanitizedData.contacts || sanitizedData.contacts.length === 0) {
      console.warn('No contacts provided');
      return res.status(400).json({
        success: false,
        error: 'no_contacts',
        message: 'At least one contact must be provided',
        statusCode: 400
      });
    }

    const contactEmails = sanitizedData.contacts.map(contact => {
      if (!contact.email) {
        console.warn('Contact missing email:', contact);
        return res.status(400).json({
          success: false,
          error: 'missing_email',
          message: 'One or more contacts are missing email addresses',
          statusCode: 400
        });
      }
      return contact.email.toLowerCase().trim();
    });


    // Check for duplicates in request
    const emailToContactIndices = {};
const duplicateEmailsInRequest = [];

sanitizedData.contacts.forEach((contact, index) => {
  const email = contact.email.toLowerCase().trim();
  if (!emailToContactIndices[email]) {
    emailToContactIndices[email] = [index + 1]; // Store contact numbers (1-based)
  } else {
    emailToContactIndices[email].push(index + 1);
    if (emailToContactIndices[email].length === 2) { // Only add once when first duplicate found
      duplicateEmailsInRequest.push({
        email: email,
        contactIndices: emailToContactIndices[email]
      });
    }
  }
});

if (duplicateEmailsInRequest.length > 0) {
  console.log("Duplicate emails in request:", duplicateEmailsInRequest);
  const duplicateDetails = duplicateEmailsInRequest.map(dup => 
    `Email '${dup.email}' appears in contacts ${dup.contactIndices.join(' and ')}`
  );
  
  return res.status(400).json({
    success: false,
    error: 'duplicate_contacts',
    message: 'Duplicate email addresses in your submission',
    duplicates: duplicateEmailsInRequest,
    details: `Please correct: ${duplicateDetails.join('; ')}`,
    statusCode: 400
  });
}

// Check for existing contacts by email
console.log("Checking for existing contacts...");
try {
  const normalizedContactEmails = contactEmails.map(email => 
    email.toLowerCase().trim()
  ).filter(email => email);

  if (normalizedContactEmails.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'no_valid_emails',
      message: 'No valid email addresses provided',
      statusCode: 400
    });
  }

  // Find existing contacts with these emails
  const existingContacts = await Contact.find({ 
    email: { $in: normalizedContactEmails }
  })
  .select('email firstName lastName -_id')
  .lean();

  if (existingContacts && existingContacts.length > 0) {
    const existingEmails = existingContacts.map(c => c.email.toLowerCase());
    
    const conflictingContacts = contactEmails
      .map((email, index) => ({ 
        email, 
        contactIndex: index + 1,
        normalized: email.toLowerCase().trim() 
      }))
      .filter(({ normalized }) => existingEmails.includes(normalized));

    return res.status(400).json({
      success: false,
      error: 'duplicate_emails',
      message: 'These emails are already registered:',
      duplicates: conflictingContacts.map(c => ({
        email: c.email,
        contactPosition: c.contactIndex
      })),
      statusCode: 400
    });
  }
} catch (dbError) {
  console.error("Database error during contact validation:", dbError);
  return res.status(500).json({
    success: false,
    error: 'database_error',
    message: 'Could not validate email addresses',
    details: dbError.message,
    statusCode: 500
  });
}
    // Check for pending registration
    if (hasPendingRegistration(sanitizedData.email)) {
      return res.status(200).json({
        success: true,
        message: 'A confirmation email has already been sent. Please check your inbox.',
        email: sanitizedData.email,
        statusCode: 200
      });
    }

    // Verify ServiceNow configuration
    if (!config.serviceNow.url || !config.serviceNow.user || !config.serviceNow.password) {
      console.error("ServiceNow configuration missing");
      return res.status(500).json({
        success: false,
        error: 'servicenow_config_missing',
        message: 'Server configuration error. Cannot check email availability.',
        statusCode: 500
      });
    }

    // Prepare registration data
    const registrationData = {
      ...sanitizedData,
      password: sanitizedData.password, // Assuming already hashed
      registrationDate: new Date()
    };

    const token = generateToken();
    storeRegistration(token, registrationData);

    // Send confirmation email
    try {
      await sendConfirmationEmail(
        registrationData.email,
        registrationData.first_name || registrationData.name,
        token
      );
      
      return res.status(200).json({
        success: true,
        message: 'Confirmation email sent. Please check your inbox to complete your registration.',
        email: registrationData.email,
        statusCode: 200
      });

    } catch (mailError) {
      console.error('Email sending failed:', mailError);
      pendingRegistrations.delete(token);
      emailToTokenMap.delete(registrationData.email);
      
      return res.status(500).json({
        success: false,
        error: 'email_send_failed',
        message: 'Could not send confirmation email. Please verify your email address and try again.',
        details: mailError.message,
        statusCode: 500
      });
    }

  } catch (error) {
    console.error('Unexpected registration error:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'database_validation_error',
        message: 'Data validation failed',
        details: error.errors,
        statusCode: 400
      });
    }
    
    if (error.name === 'MongoError') {
      return res.status(500).json({
        success: false,
        error: 'database_error',
        message: 'Database operation failed',
        details: error.message,
        statusCode: 500
      });
    }

    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'An unexpected error occurred during registration. Please try again later.',
      details: error.message,
      statusCode: 500,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = requestCreation;