// controllers/authController.js
const bcrypt = require('bcrypt');
const Contact = require('../../models/Contact');

module.exports = {
    login: async(req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // 1. Find contact by email (case-insensitive exact match)
            const contact = await Contact.findOne({
                email: { $regex: new RegExp(`^${email}$`, 'i') }
            });

            if (!contact) {
                console.log('Login failed: Contact not found for email:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // 2. Debug logging (remove in production)
            console.log('Stored hash:', contact.password);
            console.log('Provided password:', password);

            // 3. Compare passwords
            const isMatch = await bcrypt.compare(password, contact.password);
            if (!isMatch) {
                console.log('Login failed: Password mismatch for:', email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // 4. Successful login
            const contactData = contact.toObject();
            delete contactData.password;

            res.status(200).json({
                message: 'Login successful',
                contact: contactData
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    }
};