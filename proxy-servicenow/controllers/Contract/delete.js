const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Contract = require("../../models/contract");

export async function deleteContractById(id) {
  try {
    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contract ID");
    }

    // First find the contract to get file information
    const contract = await Contract.findById(id);
    
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Delete the associated PDF file (if exists) before database operation
    if (contract.file_name) {
      try {
        const filePath = path.join(__dirname, '../../assets/pdf/Quotation', contract.file_name);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.error("Failed to delete PDF file:", fileError);
        // You might want to throw here if file deletion is critical
         throw new Error("Failed to delete associated PDF file");
      }
    }

    // Now delete the contract from database
    const deletedContract = await Contract.findByIdAndDelete(id);

    return {
      success: true,
      message: "Contract deleted successfully",
      deletedContract
    };

  } catch (error) {
    console.error('Error deleting contract:', error);

    if (error.name?.includes('Mongo')) {
      const mongoError = handleMongoError(error);
      throw new Error(mongoError.message);
    }

    throw error;
  }
}