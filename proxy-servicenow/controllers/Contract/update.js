const mongoose = require('mongoose');
const handleMongoError = require('../../utils/handleMongoError');
const Contract = require("../../models/contract");
const getoneQuote = require('../Quote/getone');
const generatePDF = require('../../pdf/utils/GenerationQuotation');
const fs = require('fs').promises;
const path = require('path');

async function updateContract(req, res) {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const { signature } = req.body;
    

    // Validate input
    if (!signature ) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: "Both signature and signatureType (m_signature or c_signature) are required"
      });
    }


    // Find existing contract
    const existingContract = await Contract.findById(id);
    if (!existingContract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Fetch associated quote
    const quote = await getoneQuote(existingContract.quote);
    if (!quote) {
      return res.status(404).json({ error: "Associated quote not found" });
    }

    // Prepare updated quote data with new signature
    const updatedQuote = {
      ...quote,
      signature: {
        base64:quote.m_signature,
        date: quote.m_signature_date,
      },
      client_signature: {
        base64: signature,
        date: Date.now()
      }
    };

    // Generate new PDF path (replace existing file)
    const outputDir = path.join(__dirname, '../../assets/pdf/Quotation');
    const fileName = existingContract.file_name; // Keep same filename to overwrite
    const outputPath = path.join(outputDir, fileName);

    // Generate updated PDF
    const pdfGenerationTimeout = 60000; // 60 seconds
    let pdfGenerationTimeoutId;

    const pdfGenerationPromise = generatePDF({
      templatePath: path.join(__dirname, '../../pdf/template/Quotation.html'),
      data: updatedQuote,
      outputPath: outputPath,
      pdfOptions: {
        format: 'A4',
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true
      }
    });

    const timeoutPromise = new Promise((_, reject) => {
      pdfGenerationTimeoutId = setTimeout(() => {
        reject(new Error(`PDF generation timed out after ${pdfGenerationTimeout}ms`));
      }, pdfGenerationTimeout);
    });

    await Promise.race([pdfGenerationPromise, timeoutPromise]);
    clearTimeout(pdfGenerationTimeoutId);

    // Update contract record
    const updateData = {
      c_signature: signature,
      c_signature_date: Date.now(),
      updated_at: Date.now()
    };

    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

   

    return res.status(200).json({
      ...updatedContract.toObject(),
      localPath: outputPath
    });

  } catch (error) {
    console.error('Error updating contract:', error);

    // Handle timeout errors specifically
    if (error.message.includes('timed out')) {
      return res.status(504).json({
        error: 'PDF generation took too long',
        suggestion: 'Try again with a simpler template or larger timeout'
      });
    }

    // Handle MongoDB errors
    if (error.name?.includes('Mongo')) {
      const mongoError = handleMongoError(error);
      return res.status(mongoError.status).json({ error: mongoError.message });
    }

    // Handle generic errors
    res.status(500).json({
      error: 'Failed to update contract',
      details: error.message
    });
  }
}

module.exports = updateContract;