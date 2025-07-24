const bcrypt = require('bcrypt');
const Client = require('../../models/Client');
const serviceNow = require('../../api/client/serviceNow');
const handleMongoError = require('../../utils/handleMongoError');

module.exports = {
    // CREATE - Enhanced with better password validation
    create: async(req, res) => {
        try {
            // Validate required fields - FIXED THE TYPO HERE
            const requiredFields = ['u_first_name', 'u_last_name', 'u_email_address', 'u_username', 'u_password'];
            const missingFields = requiredFields.filter(field => !req.body[field]); // Fixed 'ield' to 'field'

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    missing: missingFields
                });
            }

            // Password validation
            if (req.body.u_password.length < 6) {
                return res.status(400).json({
                    error: 'Password must be at least 6 characters'
                });
            }

            // Create client data
            const clientData = {
                ...req.body,
                u_account_status: req.body.u_account_status || 'active',
                u_user_role: req.body.u_user_role || 'client'
            };

            // 1. Create in ServiceNow
            const serviceNowClient = await serviceNow.createClient(clientData);

            // 2. Create in MongoDB with hashed password
            const salt = await bcrypt.genSalt(10);
            const mongoClient = await Client.create({
                ...serviceNowClient,
                u_password: await bcrypt.hash(req.body.u_password, salt)
            });

            // Return response without password
            const clientResponse = mongoClient.toObject();
            delete clientResponse.u_password;

            res.status(201).json(clientResponse);

        } catch (error) {
            console.error('Create Client Error:', error);

            if (error.name === 'ValidationError') {
                const errors = {};
                for (const field in error.errors) {
                    errors[field] = error.errors[field].message;
                }
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors
                });
            }

            if (error.message.includes('ServiceNow')) {
                return res.status(502).json({
                    error: 'ServiceNow integration failed',
                    details: error.message
                });
            }

            // Handle duplicate key errors (unique fields)
            if (error.code === 11000) {
                const duplicateField = Object.keys(error.keyPattern)[0];
                return res.status(409).json({
                    error: 'Duplicate value',
                    message: `${duplicateField} already exists`,
                    field: duplicateField
                });
            }

            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    },

    // READ ONE
    read: async(req, res) => {
        try {
            const { id } = req.params;
            const client = await serviceNow.getClient(id) ||
                await Client.findOne({ $or: [{ _id: id }, { sys_id: id }] });

            if (!client) {
                return res.status(404).json({ error: 'Client not found' });
            }

            // Remove sensitive data
            const { u_password, ...clientData } = client.toObject ? client.toObject() : client;
            res.status(200).json(clientData);
        } catch (error) {
            console.error('Read Error:', error);
            res.status(500).json({ error: 'Server error while fetching client' });
        }
    },

    // UPDATE - Enhanced password update handling
    update: async(req, res) => {
        try {
            const { id } = req.params;
            const updateData = {...req.body };

            // Handle password update
            if (updateData.u_password) {
                if (updateData.u_password.length < 6) {
                    return res.status(400).json({
                        error: 'Password must be at least 6 characters'
                    });
                }
                const salt = await bcrypt.genSalt(10);
                updateData.u_password = await bcrypt.hash(updateData.u_password, salt);
            } else {
                // If password isn't being updated, remove it from updateData to prevent overwriting
                delete updateData.u_password;
            }

            // Update in both systems
            const updatedSNClient = await serviceNow.updateClient(id, updateData);

            // Make sure we're not passing password to ServiceNow if it wasn't updated
            const snUpdateData = {...updateData };
            if (!req.body.u_password) {
                delete snUpdateData.u_password;
            }

            const updatedMongoClient = await Client.findOneAndUpdate({ sys_id: id }, { $set: snUpdateData }, // Use $set operator to only update provided fields
                { new: true }
            );

            if (!updatedMongoClient) {
                return res.status(404).json({ error: 'Client not found' });
            }

            // Remove password from response
            const { u_password, ...clientResponse } = updatedMongoClient.toObject();
            res.status(200).json(clientResponse);
        } catch (error) {
            console.error('Update Error:', error);
            res.status(500).json({
                error: 'Server error while updating client',
                details: error.message
            });
        }
    },

    // DELETE
    delete: async(req, res) => {
        try {
            const { id } = req.params;

            // Delete from both systems
            await serviceNow.deleteClient(id);
            const deletedClient = await Client.findOneAndDelete({ sys_id: id });

            if (!deletedClient) {
                return res.status(404).json({ error: 'Client not found' });
            }

            res.status(200).json({
                message: 'Client deleted successfully',
                deletedId: deletedClient._id
            });
        } catch (error) {
            console.error('Delete Error:', error);
            res.status(500).json({ error: 'Server error while deleting client' });
        }
    },

    // GET ALL WITH PAGINATION + SEARCH
    getAll: async(req, res) => {
        try {
            const { q: searchQuery, page = 1, limit = 10 } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            let mongoQuery = {};

            if (searchQuery) {
                mongoQuery.$or = [
                    { u_first_name: { $regex: searchQuery, $options: 'i' } },
                    { u_last_name: { $regex: searchQuery, $options: 'i' } },
                    { u_email_address: { $regex: searchQuery, $options: 'i' } },
                    { u_username: { $regex: searchQuery, $options: 'i' } },
                    { u_city: { $regex: searchQuery, $options: 'i' } },
                    { u_country: { $regex: searchQuery, $options: 'i' } }
                ];
            }

            const [total, clients] = await Promise.all([
                Client.countDocuments(mongoQuery),
                Client.find(mongoQuery)
                .select('-u_password') // Exclude password from results
                .skip(skip)
                .limit(parseInt(limit))
                .lean()
            ]);

            res.json({
                result: clients,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                source: 'mongodb'
            });

        } catch (error) {
            console.error('Get All Error:', error);
            const mongoError = handleMongoError(error);
            res.status(mongoError.status).json({ error: mongoError.message });
        }
    },

    login: async(req, res) => {
        try {
            const { email, password } = req.body;

            // 1. Validate input
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email and password are required'
                });
            }

            // 2. Find user by email (case-insensitive)
            const client = await Client.findOne({
                u_email_address: { $regex: new RegExp(`^${email}$`, 'i') }
            });

            if (!client) {
                console.log('[LOGIN] User not found:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // 3. Debug: Log stored vs input password
            console.log('[LOGIN] Stored hash:', client.u_password);
            console.log('[LOGIN] Input password:', password);

            // 4. Compare passwords
            const isMatch = await bcrypt.compare(password, client.u_password);
            if (!isMatch) {
                console.log('[LOGIN] Password mismatch for:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // 5. Successful login
            const { u_password, ...userData } = client.toObject();
            res.status(200).json({
                message: 'Login successful',
                user: userData
            });

        } catch (error) {
            console.error('[LOGIN] Error:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    }
};