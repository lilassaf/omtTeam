const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const handleMongoError = require('../../utils/handleMongoError');
const Contract = require("../../models/contract");
const getoneQuote = require('../Quote/getone');
const generatePDF = require('../../pdf/utils/GenerationQuotation');
const sendQuotationSignRequest = require('../../email/api/sendQuotationSignRequest');
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
        base64: signature,
        date: Date.now(),
      }
    };

    // Generate PDF
    const outputDir = path.join(__dirname, '../../assets/pdf/Quotation');
    const fileName = `Quotation-${quote.number}-${Date.now()}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Add timeout handling for PDF generation
    const pdfGenerationTimeout = 60000; // 60 seconds
    let pdfGenerationTimeoutId;

    const pdfGenerationPromise = generatePDF({
      templatePath: path.join(__dirname, '../../pdf/template/Quotation.html'),
      data: quoteWithSignature,
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

    // Create contract record
    const contract = new Contract({
      opportunity: quote.opportunity?._id,
      quote: quote._id,
      file_name: fileName,
      download_url: `/assets/pdf/Quotation/${fileName}`, // Fixed path to be web accessible
      m_signature: signature,
      m_signature_date: Date.now()
    });

    const savedContract = await contract.save();

    // send email

    await sendQuotationSignRequest(quote.account.email,quote._id,quote.account.name,quote.number);


    return res.status(201).json({
     ...savedContract.toObject(),
      localPath: outputPath
    });

  } catch (error) {
    console.error('Error generating contract:', error);

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
      error: 'Failed to generate contract',
      details: error.message
    });
  }
}

module.exports = generateContract;