const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

// Register Handlebars helpers
handlebars.registerHelper('formatDate', function(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

handlebars.registerHelper('currentDate', function() {
  return new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

handlebars.registerHelper('calculateLineTotal', function(quantity, unitPrice) {
  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(unitPrice) || 0;
  return (qty * price).toFixed(2);
});

handlebars.registerHelper('calculateSubtotal', function(quoteLines) {
  const subtotal = quoteLines.reduce((sum, line) => {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.unit_price) || 0;
    return sum + (qty * price);
  }, 0);
  return subtotal.toFixed(2);
});

handlebars.registerHelper('calculateTax', function(quoteLines) {
  const subtotal = quoteLines.reduce((sum, line) => {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.unit_price) || 0;
    return sum + (qty * price);
  }, 0);
  // Assuming 10% tax - adjust as needed
  const taxRate = 0.10; // 10%
  return (subtotal * taxRate).toFixed(2);
});

handlebars.registerHelper('calculateGrandTotal', function(quoteLines) {
  const subtotal = quoteLines.reduce((sum, line) => {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.unit_price) || 0;
    return sum + (qty * price);
  }, 0);
  const taxRate = 0.10; // 10%
  return (subtotal * (1 + taxRate)).toFixed(2);
});

handlebars.registerHelper('calculateLineTotal', function(quantity, unitPrice) {
  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(unitPrice) || 0;
  return (qty * price).toFixed(2);
});

handlebars.registerHelper('calculateTotal', function(quoteLines) {
  return quoteLines.reduce((sum, line) => {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.unit_price) || 0;
    return sum + (qty * price);
  }, 0).toFixed(2);
});

handlebars.registerHelper('calculateMonthlyTotal', function(quoteLines) {
  return quoteLines.reduce((sum, line) => {
    if (line.unit_of_measurement === 'Month') {
      const qty = parseFloat(line.quantity) || 0;
      const price = parseFloat(line.unit_price) || 0;
      return sum + (qty * price);
    }
    return sum;
  }, 0).toFixed(2);
});


/**
 * Generates a PDF from an HTML template
 * @param {Object} options
 * @param {string} options.templatePath - Path to the HTML template file
 * @param {Object} options.data - Data to inject into the template
 * @param {string} [options.outputPath] - Where to save the PDF (optional)
 * @param {Object} [options.pdfOptions] - Puppeteer PDF options
 * @returns {Promise<Buffer|String>} PDF buffer if no outputPath, else file path
 */
async function generatePDF({ templatePath, data, outputPath, pdfOptions = {} }) {
  let browser;
  try {
    // Read and compile template
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const html = template(data);

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const defaultPdfOptions = {
      format: 'A4',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      printBackground: true,
      ...pdfOptions
    };

    const pdfBuffer = await page.pdf(defaultPdfOptions);

    // Save to file if outputPath specified
    if (outputPath) {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, pdfBuffer);
      return outputPath;
    }

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = generatePDF;