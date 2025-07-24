const config = require('../../utils/configCreateAccount');
const axios = require('axios');
const bcrypt = require('bcrypt');
const handleMongoError = require('../../utils/handleMongoError');
const Contact = require('../../models/Contact');
const Account = require('../../models/account');
const Location = require('../../models/location'); // ✅ Import Location model

async function createContact(req, res = null) {
  let savedContact = null;

  try {
    if (!req.body.account) {
      throw new Error('Account reference is required');
    }

    const accountDoc = await Account.findById(req.body.account);
    if (!accountDoc) {
      throw new Error('Account not found');
    }

    // ✅ Check and fetch location if provided
    let locationDoc = null;
    if (req.body.location) {
      locationDoc = await Location.findById(req.body.location);
      if (!locationDoc) {
        throw new Error('Location not found');
      }
    }

    // Hash password if provided
    let hashedPassword = '';
    if (req.body.password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    }

    // Create in MongoDB to get ID
    const contact = new Contact({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      account: accountDoc._id,
      location: locationDoc?._id || null, // ✅ Save MongoDB reference to location
      isPrimaryContact: req.body.isPrimaryContact ?? true,
      active: req.body.active || true,
      ...(req.body.jobTitle && { jobTitle: req.body.jobTitle })
    });

    savedContact = await contact.save();

    // Prepare ServiceNow payload
    const contactPayload = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone || '',
      account: accountDoc.sys_id,
      user_password: req.body.password || '',
      is_primary_contact: req.body.isPrimaryContact ?? true,
      active: req.body.active || true,
      sn_tmt_core_external_id: savedContact._id.toString(),
      ...(req.body.jobTitle && { job_title: req.body.jobTitle }),
      ...(locationDoc && { location: locationDoc.sys_id }), // ✅ Add ServiceNow location sys_id
      sys_class_name: 'customer_contact'
    };

    // Send to ServiceNow
    const snResponse = await axios.post(
      `${config.serviceNow.url}/api/now/table/customer_contact`,
      contactPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-SN-Table-Name': 'customer_contact'
        },
        auth: {
          username: config.serviceNow.user,
          password: config.serviceNow.password
        }
      }
    );

    // Update MongoDB with ServiceNow sys_id
    savedContact.sys_id = snResponse.data.result.sys_id;
    await savedContact.save();

    const result = {
      _id: savedContact._id,
      message: 'Contact created successfully',
      servicenow: snResponse.data.result,
      mongodb: savedContact
    };

    if (res) return res.status(201).json(result);
    return result;

  } catch (error) {
    console.error('Error creating contact:', error);

    // Clean up if ServiceNow creation failed
    if (savedContact) {
      await Contact.findByIdAndDelete(savedContact._id);
    }

    if (res) {
      if (error.name?.includes('Mongo')) {
        const mongoError = handleMongoError(error);
        return res.status(mongoError.status).json({ error: mongoError.message });
      }

      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || error.message;
      return res.status(status).json({ error: message });
    }

    throw error;
  }
}

module.exports = createContact;