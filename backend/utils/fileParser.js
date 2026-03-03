// ============================================================
// utils/fileParser.js - Extract text from PDF and DOCX files
// ============================================================

const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts plain text from a PDF or DOCX file.
 * @param {string} filePath - Absolute path to the file
 * @param {string} fileType - 'pdf' or 'docx'
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromFile(filePath, fileType) {
  if (fileType === 'pdf') {
    return await extractFromPDF(filePath);
  } else if (fileType === 'docx') {
    return await extractFromDOCX(filePath);
  } else {
    throw new Error('Unsupported file type.');
  }
}

async function extractFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text.trim();
}

async function extractFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value.trim();
}

module.exports = { extractTextFromFile };
