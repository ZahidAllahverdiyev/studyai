const fs = require('fs');
const mammoth = require('mammoth');

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
  const pdfParse = require('pdf-parse/lib/pdf-parse');
  const data = await pdfParse(dataBuffer);
  return data.text.trim();
}

async function extractFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value.trim();
}

module.exports = { extractTextFromFile };