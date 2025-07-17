const mongoose = require('mongoose');
const Contract = require("../../models/contract");
const handleMongoError = require('../../utils/handleMongoError');
const fs = require('fs').promises;
const path = require('path');
const sendContractSignedConfirmation = require('../../email/api/sendContractSignedConfirmation');

async function signContractAsClient(req, res) {
  try {
    const contractId = new mongoose.Types.ObjectId(req.params.id);
    const { signature, clientId } = req.body;

    // Validate signature data
    if (!signature) {
      return res.status(400).json({ error: "Missing signature details" });
    }

    // Find the contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Verify client email matches (if you have client email stored)
    // This is optional depending on your security requirements
    if (clientId && contract.quote?.account?._id !== clientId) {
      return res.status(403).json({ error: "Unauthorized signature attempt" });
    }

    // Update contract with client signature
    contract.c_signature = signature;
    contract.c_signature_date = Date.now();
    contract.updated_at = Date.now();

    const updatedContract = await contract.save();

    // Send confirmation email
    try {
      await sendContractSignedConfirmation(
        contract.quote?.account?.email,
        contract.quote?.account?.name,
        contract.quote?.number,
        contract.file_name
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the whole request if email fails
    }

    return res.status(200).json(updatedContract);

  } catch (error) {
    console.error('Error signing contract as client:', error);

    // Handle MongoDB errors
    if (error.name?.includes('Mongo')) {
      const mongoError = handleMongoError(error);
      return res.status(mongoError.status).json({ error: mongoError.message });
    }

    // Handle generic errors
    res.status(500).json({
      error: 'Failed to sign contract',
      details: error.message
    });
  }
}

module.exports = signContractAsClient;