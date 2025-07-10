const path = require('path');
const fs = require('fs');
const Contract = require("../../models/contract");

async function downloadContract(req, res) {
  try {
    const { id } = req.params;

    // Find contract by ID or quote ID
    let contract = await Contract.findById(id) || await Contract.findOne({ quote: id });

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Construct absolute file path
    const filePath = path.resolve(
      __dirname,
      '../../assets/pdf/Quotation',
      contract.file_name
    );

    console.log("Checking for file at:", filePath);

    // Verify file exists (callback-based)
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File not found at:', filePath);
        return res.status(404).json({
          error: "PDF file not found",
          debug: {
            expectedPath: filePath,
            fileName: contract.file_name,
            contractId: contract._id
          }
        });
      }

      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${contract.file_name}"`);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (streamErr) => {
        console.error('File stream error:', streamErr);
        res.status(500).json({ error: 'Error streaming file' });
      });

      fileStream.pipe(res);
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Failed to download contract',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = downloadContract;
