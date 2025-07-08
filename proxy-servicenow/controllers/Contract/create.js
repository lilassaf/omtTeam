const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const handleMongoError = require('../../utils/handleMongoError');
const Contract = require("../../models/contract");
const getoneQuote = require('../Quote/getone');
const generatePDF = require('../../pdf/utils/GenerationQuotation');
const fs = require('fs').promises;
const path = require('path');

async function generateContract(req, res) {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const { signature } = req.body;
    
    // Validate signature data
    if (!signature) {
      return res.status(400).json({ error: "Missing signature details" });
    }

    // Check for existing contract
    const exists = await Contract.findOne({ quote: id }).lean();
    if (exists) return res.status(200).json(exists);

    // Fetch quote
    const quote = await getoneQuote(id);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    // Add signature data to quote object
    const quoteWithSignature = {
      ...quote,
      signature: {
        base64: signature, // Base64 encoded signature image
        date: Date.now(),
      }
    };

    // Generate PDF
    const outputDir = path.join(__dirname, '../../assets/pdf/Quotation');
    const fileName = `Quotation-${quote.number}-${Date.now()}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Generate the PDF with signature
    await generatePDF({
      templatePath: path.join(__dirname, '../../pdf/template/Quotation.html'),
      data: quoteWithSignature,
      outputPath: outputPath,
      pdfOptions: {
        format: 'A4',
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true
      }
    });

    // Create download URL
    const downloadUrl = `https://proxy-servicenow.onrender.com/assets/pdf/Quotation/${fileName}`;

    // Create contract record
    const contract = new Contract({
      opportunity: quote.opportunity?._id,
      quote: quote._id,
      file_name: fileName,
      download_url: downloadUrl,
      m_signature:  Date.now(),
      generated_at: new Date()
    });

    const savedContract = await contract.save();
    
    return res.status(201).json({
      ...savedContract.toObject(),
      localPath: outputPath
    });

  } catch (error) {
    console.error('Error generating contract:', error);

    // Handle MongoDB errors
    if (error.name?.includes('Mongo')) {
      const mongoError = handleMongoError(error);
      return res.status(mongoError.status).json({ error: mongoError.message });
    }

    // Handle generic errors
    res.status(500).json({ 
      error: 'Failed to generate contract',
      details: error.message 
    });
  }
}

module.exports = generateContract;